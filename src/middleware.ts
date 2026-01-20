import { NextRequest, NextResponse } from 'next/server';
import { validateTokenSync } from '@/lib/auth';

// 인증이 필요하지 않은 경로
const publicPaths = ['/login', '/api/auth/login', '/l/', '/api/leads/submit', '/api/clients/by-slug/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 정적 파일은 통과
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 토큰 확인
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    // 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 토큰 유효성 검증 (동기 버전 - KV 모드에서는 API에서 재검증)
  if (!validateTokenSync(token)) {
    // 유효하지 않은 토큰 - 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // 무효한 쿠키 삭제
    response.cookies.delete('admin_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
