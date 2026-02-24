import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientBySlug } from "@/lib/airtable";
import { sendPortalOTP, verifyPortalOTP } from "@/lib/portal-otp";

export async function POST(request: NextRequest) {
  try {
    const { slug, action, code } = await request.json();

    if (!slug || !action) {
      return NextResponse.json(
        { success: false, error: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 클라이언트 조회
    const client = await getClientBySlug(slug);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (action === "send") {
      if (!client.telegramChatId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "텔레그램 채팅 ID가 설정되지 않았습니다. 관리자에게 문의하세요.",
          },
          { status: 403 },
        );
      }

      const result = await sendPortalOTP(
        slug,
        client.name,
        client.telegramChatId,
      );
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 },
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      if (!code || typeof code !== "string") {
        return NextResponse.json(
          { success: false, error: "인증코드를 입력해주세요." },
          { status: 400 },
        );
      }

      const result = verifyPortalOTP(slug, code.trim());
      if (!result.valid) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            lockedUntil: result.lockedUntil,
          },
          { status: 401 },
        );
      }

      // 포털 세션 쿠키 발급
      const cookieStore = await cookies();
      cookieStore.set(`portal_auth_${slug}`, client.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: "/",
      });

      return NextResponse.json({
        success: true,
        data: { id: client.id, name: client.name, slug: client.slug },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Portal login error:", error);
    return NextResponse.json(
      { success: false, error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
