/**
 * Auth Module
 * 토큰 생성, 검증, Rate Limiting 기능
 *
 * 환경에 따라 저장소 자동 전환:
 * - KV_REST_API_URL 설정 시: Vercel KV (Redis)
 * - 미설정 시: 메모리 기반 (개발용)
 */

import { kv } from '@vercel/kv';

// 설정값
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7일
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7일 (Redis TTL용)
const RATE_LIMIT_MAX = 5; // 최대 시도 횟수
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1분

// KV 키 접두사
const TOKEN_PREFIX = 'token:';
const RATE_LIMIT_PREFIX = 'ratelimit:';

// 메모리 저장소 (개발용 폴백)
interface TokenData {
  createdAt: number;
  expiresAt: number;
}

interface RateLimitData {
  count: number;
  resetAt: number;
}

const memoryTokenStore = new Map<string, TokenData>();
const memoryRateLimitStore = new Map<string, RateLimitData>();

// KV 사용 여부 확인
function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * 안전한 토큰 생성
 */
export async function generateToken(): Promise<string> {
  const token = crypto.randomUUID();
  const now = Date.now();

  if (useKV()) {
    await kv.set(
      `${TOKEN_PREFIX}${token}`,
      { createdAt: now, expiresAt: now + TOKEN_EXPIRY_MS },
      { ex: TOKEN_EXPIRY_SECONDS }
    );
  } else {
    memoryTokenStore.set(token, {
      createdAt: now,
      expiresAt: now + TOKEN_EXPIRY_MS,
    });
  }

  return token;
}

/**
 * 토큰 유효성 검증
 */
export async function validateToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') {
    return false;
  }

  if (useKV()) {
    const tokenData = await kv.get<TokenData>(`${TOKEN_PREFIX}${token}`);
    if (!tokenData) {
      return false;
    }

    const now = Date.now();
    if (now > tokenData.expiresAt) {
      await kv.del(`${TOKEN_PREFIX}${token}`);
      return false;
    }

    return true;
  } else {
    const tokenData = memoryTokenStore.get(token);
    if (!tokenData) {
      return false;
    }

    const now = Date.now();
    if (now > tokenData.expiresAt) {
      memoryTokenStore.delete(token);
      return false;
    }

    return true;
  }
}

/**
 * 동기 토큰 검증 (middleware용 - 메모리 모드만)
 * KV 모드에서는 항상 true 반환 (API 라우트에서 비동기 검증 필요)
 */
export function validateTokenSync(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // KV 모드에서는 Edge에서 검증 불가, 일단 통과시키고 API에서 검증
  if (useKV()) {
    return true; // API 라우트에서 validateToken으로 재검증
  }

  const tokenData = memoryTokenStore.get(token);
  if (!tokenData) {
    return false;
  }

  const now = Date.now();
  if (now > tokenData.expiresAt) {
    memoryTokenStore.delete(token);
    return false;
  }

  return true;
}

/**
 * 토큰 무효화 (로그아웃)
 */
export async function invalidateToken(token: string): Promise<void> {
  if (useKV()) {
    await kv.del(`${TOKEN_PREFIX}${token}`);
  } else {
    memoryTokenStore.delete(token);
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken(oldToken: string): Promise<string | null> {
  const isValid = await validateToken(oldToken);
  if (!isValid) {
    return null;
  }

  await invalidateToken(oldToken);
  return generateToken();
}

/**
 * Rate Limiting 체크
 */
export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining?: number;
  retryAfter?: number;
}> {
  const now = Date.now();

  if (useKV()) {
    const key = `${RATE_LIMIT_PREFIX}${ip}`;
    const count = await kv.incr(key);

    // 첫 번째 요청이면 TTL 설정
    if (count === 1) {
      await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    if (count > RATE_LIMIT_MAX) {
      const ttl = await kv.ttl(key);
      return { allowed: false, remaining: 0, retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS };
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX - count };
  } else {
    const data = memoryRateLimitStore.get(ip);

    if (!data || now >= data.resetAt) {
      memoryRateLimitStore.set(ip, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000,
      });
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }

    if (data.count >= RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil((data.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    data.count += 1;
    memoryRateLimitStore.set(ip, data);

    return { allowed: true, remaining: RATE_LIMIT_MAX - data.count };
  }
}

/**
 * Rate Limit 리셋
 */
export async function resetRateLimit(ip: string): Promise<void> {
  if (useKV()) {
    await kv.del(`${RATE_LIMIT_PREFIX}${ip}`);
  } else {
    memoryRateLimitStore.delete(ip);
  }
}

/**
 * 모든 토큰 정리 (테스트용)
 */
export async function clearAllTokens(): Promise<void> {
  if (useKV()) {
    // KV에서는 패턴 삭제가 제한적이므로 개별 삭제 필요
    // 프로덕션에서는 사용 자제
    console.warn('clearAllTokens: KV mode에서는 지원하지 않습니다.');
  } else {
    memoryTokenStore.clear();
  }
}

/**
 * 만료된 토큰 정리 (메모리 모드용)
 * KV는 TTL이 자동 정리함
 */
export function cleanupExpiredTokens(): number {
  if (useKV()) {
    return 0; // KV는 TTL로 자동 정리
  }

  const now = Date.now();
  let cleaned = 0;

  for (const [token, data] of memoryTokenStore.entries()) {
    if (now > data.expiresAt) {
      memoryTokenStore.delete(token);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * 저장소 상태 확인
 */
export function getStorageInfo(): { type: 'kv' | 'memory'; connected: boolean } {
  return {
    type: useKV() ? 'kv' : 'memory',
    connected: useKV() ? !!(process.env.KV_REST_API_URL) : true,
  };
}
