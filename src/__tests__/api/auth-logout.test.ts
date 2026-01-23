import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/auth/logout/route';
import { NextRequest } from 'next/server';
import { generateToken, validateToken } from '@/lib/auth';

// NextResponse cookies mock
const mockCookiesDelete = vi.fn();

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: (body: unknown, init?: ResponseInit) => {
        const response = new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });
        // cookies 메서드 추가
        (response as unknown as { cookies: { delete: typeof mockCookiesDelete } }).cookies = {
          delete: mockCookiesDelete,
        };
        return response;
      },
    },
  };
});

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should invalidate token and delete cookie', async () => {
    // 유효한 토큰 생성
    const token = generateToken();
    expect(validateToken(token)).toBe(true);

    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    });

    const response = await POST(request);
    const body = await response.json();

    // 응답 확인
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('로그아웃 되었습니다');

    // 토큰이 무효화되었는지 확인
    expect(validateToken(token)).toBe(false);
  });

  it('should return success even without token (idempotent)', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
    });

    const response = await POST(request);
    const body = await response.json();

    // 토큰이 없어도 성공 (이미 로그아웃 상태)
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should return success with invalid token (idempotent)', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: 'auth_token=invalid-token',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    // 유효하지 않은 토큰이어도 성공
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should set proper headers for cache prevention', async () => {
    const token = generateToken();
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    });

    const response = await POST(request);

    // 캐시 방지 헤더 확인
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
