/**
 * Logout API
 * POST /api/auth/logout
 * 토큰 무효화 및 쿠키 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { invalidateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 쿠키에서 토큰 추출
  const token = request.cookies.get('admin_token')?.value;

  // 토큰이 있으면 무효화 (async)
  if (token) {
    await invalidateToken(token);
  }

  // 응답 생성
  const response = NextResponse.json(
    {
      success: true,
      message: '로그아웃 되었습니다',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );

  // 쿠키 삭제
  response.cookies.delete('admin_token');

  return response;
}
