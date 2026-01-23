import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateToken,
  validateToken,
  invalidateToken,
  checkRateLimit,
  resetRateLimit,
} from '@/lib/auth';

describe('Auth Module', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateToken', () => {
    it('should generate a unique token', () => {
      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2);
    });

    it('should generate a token with sufficient length', () => {
      const token = generateToken();
      // UUID format: 36 characters
      expect(token.length).toBeGreaterThanOrEqual(32);
    });

    it('should not be predictable (not contain password)', () => {
      const token = generateToken();
      // 토큰이 예측 가능한 패턴을 포함하지 않아야 함
      expect(token).not.toContain('password');
      expect(token).not.toContain('admin');
    });
  });

  describe('validateToken', () => {
    it('should return true for a valid token', () => {
      const token = generateToken();
      expect(validateToken(token)).toBe(true);
    });

    it('should return false for an invalid token', () => {
      expect(validateToken('invalid-token')).toBe(false);
    });

    it('should return false for an empty token', () => {
      expect(validateToken('')).toBe(false);
    });

    it('should return false for undefined token', () => {
      expect(validateToken(undefined as unknown as string)).toBe(false);
    });

    it('should return false for an expired token', () => {
      const token = generateToken();

      // 7일 + 1초 후
      vi.advanceTimersByTime(7 * 24 * 60 * 60 * 1000 + 1000);

      expect(validateToken(token)).toBe(false);
    });

    it('should return true for a token within expiry', () => {
      const token = generateToken();

      // 6일 후 (아직 유효)
      vi.advanceTimersByTime(6 * 24 * 60 * 60 * 1000);

      expect(validateToken(token)).toBe(true);
    });
  });

  describe('invalidateToken', () => {
    it('should invalidate a valid token', () => {
      const token = generateToken();
      expect(validateToken(token)).toBe(true);

      invalidateToken(token);

      expect(validateToken(token)).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    const testIp = '192.168.1.1';

    beforeEach(() => {
      resetRateLimit(testIp);
    });

    it('should allow requests within limit', () => {
      // 5회까지 허용
      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit(testIp)).toEqual({ allowed: true, remaining: 5 - i - 1 });
      }
    });

    it('should block requests exceeding limit', () => {
      // 5회 시도
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIp);
      }

      // 6번째는 차단
      const result = checkRateLimit(testIp);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it('should reset after 1 minute', () => {
      // 5회 시도하여 제한 도달
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIp);
      }
      expect(checkRateLimit(testIp).allowed).toBe(false);

      // 1분 경과
      vi.advanceTimersByTime(60 * 1000);

      // 다시 허용
      expect(checkRateLimit(testIp).allowed).toBe(true);
    });

    it('should track different IPs separately', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // ip1에서 5회 시도
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip1);
      }

      // ip1은 차단
      expect(checkRateLimit(ip1).allowed).toBe(false);
      // ip2는 여전히 허용
      expect(checkRateLimit(ip2).allowed).toBe(true);
    });
  });
});
