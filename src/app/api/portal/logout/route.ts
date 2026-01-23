import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: '슬러그가 필요합니다.' },
        { status: 400 }
      );
    }

    // 쿠키 삭제
    const cookieStore = await cookies();
    cookieStore.delete(`portal_${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portal logout error:', error);
    return NextResponse.json(
      { success: false, error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
