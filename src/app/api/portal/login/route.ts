import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json(
        { success: false, error: '슬러그와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 클라이언트 조회
    const client = await getClientBySlug(slug);

    if (!client) {
      return NextResponse.json(
        { success: false, error: '클라이언트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 환경변수에서 비밀번호 확인 (형식: lead_{slug}_PW)
    const envPassword = process.env[`lead_${slug}_PW`];

    if (!envPassword) {
      return NextResponse.json(
        { success: false, error: '포털 비밀번호가 설정되지 않았습니다.' },
        { status: 403 }
      );
    }

    if (envPassword !== password) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 쿠키에 포털 세션 저장
    const cookieStore = await cookies();
    cookieStore.set(`portal_${slug}`, client.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: client.id,
        name: client.name,
        slug: client.slug,
      },
    });
  } catch (error) {
    console.error('Portal login error:', error);
    return NextResponse.json(
      { success: false, error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
