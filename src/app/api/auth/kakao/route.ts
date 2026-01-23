import { NextRequest, NextResponse } from "next/server";

/**
 * 카카오 로그인 시작 API
 * GET /api/auth/kakao?slug=xxx
 *
 * 카카오 OAuth 인증 페이지로 리다이렉트합니다.
 * state 파라미터에 slug를 포함하여 콜백 후 원래 페이지로 돌아갈 수 있게 합니다.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) {
    console.error("KAKAO_CLIENT_ID is not set");
    return NextResponse.json({ error: "Kakao configuration error" }, { status: 500 });
  }

  // 프로덕션/개발 환경에 따른 redirect_uri 설정
  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://lead.polarad.co.kr"
    : "http://localhost:3000";

  const redirectUri = `${baseUrl}/api/auth/kakao/callback`;

  // 카카오 OAuth 인증 URL 생성
  const kakaoAuthUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  kakaoAuthUrl.searchParams.set("client_id", clientId);
  kakaoAuthUrl.searchParams.set("redirect_uri", redirectUri);
  kakaoAuthUrl.searchParams.set("response_type", "code");
  kakaoAuthUrl.searchParams.set("state", slug); // 원래 페이지로 돌아가기 위한 slug

  return NextResponse.redirect(kakaoAuthUrl.toString());
}
