import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateToken, checkRateLimit } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function POST(request: NextRequest) {
  try {
    // IP 주소 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Rate Limiting 체크 (async)
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.',
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      // 안전한 토큰 생성 (async - KV 지원)
      const token = await generateToken();

      const cookieStore = await cookies();
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
      });

      return NextResponse.json({
        success: true,
        remaining: rateLimit.remaining,
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid password',
        remaining: rateLimit.remaining,
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
