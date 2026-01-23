/**
 * Auth Module - JWT 기반
 * 토큰 생성, 검증, Rate Limiting 기능
 *
 * JWT는 무상태(stateless)이므로 별도 저장소 불필요
 */

import { SignJWT, jwtVerify } from 'jose';

// 설정값
const TOKEN_EXPIRY = '7d'; // 7일
const RATE_LIMIT_MAX = 5; // 최대 시도 횟수
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1분

// JWT 시크릿 키 (ADMIN_PASSWORD를 시크릿으로 사용)
function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_PASSWORD || 'default-secret-key';
  return new TextEncoder().encode(secret);
}

// Rate Limiting용 메모리 저장소 (Serverless에서는 제한적이지만 기본 보호 제공)
interface RateLimitData {
  count: number;
  resetAt: number;
}
const memoryRateLimitStore = new Map<string, RateLimitData>();

/**
 * JWT 토큰 생성
 */
export async function generateToken(): Promise<string> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey());

  return token;
}

/**
 * JWT 토큰 유효성 검증
 */
export async function validateToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

/**
 * 동기 토큰 검증 (middleware용)
 * JWT는 비동기 검증이 필요하므로 middleware에서는 일단 통과시키고
 * API 라우트에서 validateToken으로 재검증
 */
export function validateTokenSync(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  // JWT는 비동기 검증이 필요하므로 일단 토큰 존재 여부만 확인
  // 실제 검증은 API 라우트에서 수행
  return true;
}

/**
 * 토큰 무효화 (로그아웃)
 * JWT는 무상태이므로 서버에서 무효화 불가
 * 클라이언트에서 쿠키 삭제로 처리
 */
export async function invalidateToken(_token: string): Promise<void> {
  // JWT는 서버에서 무효화할 수 없음
  // 클라이언트에서 쿠키를 삭제하면 됨
}

/**
 * 토큰 갱신
 */
export async function refreshToken(oldToken: string): Promise<string | null> {
  const isValid = await validateToken(oldToken);
  if (!isValid) {
    return null;
  }
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

/**
 * Rate Limit 리셋
 */
export async function resetRateLimit(ip: string): Promise<void> {
  memoryRateLimitStore.delete(ip);
}

/**
 * 모든 토큰 정리 (테스트용)
 * JWT는 무상태이므로 불필요
 */
export async function clearAllTokens(): Promise<void> {
  // JWT는 무상태이므로 정리할 것이 없음
}

/**
 * 만료된 토큰 정리
 * JWT는 자체 만료 시간이 있으므로 불필요
 */
export function cleanupExpiredTokens(): number {
  return 0;
}

/**
 * 저장소 상태 확인
 */
export function getStorageInfo(): { type: 'jwt' | 'kv' | 'memory'; connected: boolean } {
  return {
    type: 'jwt',
    connected: true,
  };
}
