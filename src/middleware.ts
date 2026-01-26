import { NextRequest, NextResponse } from 'next/server';
import { validateTokenSync } from '@/lib/auth';

// 인증이 필요하지 않은 경로
const publicPaths = ['/login', '/api/auth/login', '/api/auth/kakao', '/api/og', '/l/', '/api/leads/submit', '/api/clients/by-slug/', '/privacy', '/portal/'];

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

  // 개발 환경에서는 토큰 존재 여부만 확인 (메모리 저장소 동기화 문제)
  // 프로덕션에서는 KV를 사용하므로 API에서 재검증
  if (process.env.NODE_ENV === 'production' && !validateTokenSync(token)) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('admin_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
