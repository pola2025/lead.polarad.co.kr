import { NextRequest, NextResponse } from "next/server";

/**
 * 카카오 OAuth 콜백 API
 * GET /api/auth/kakao/callback?code=xxx&state=slug
 *
 * 1. 인가 코드로 토큰 발급
 * 2. 토큰으로 사용자 정보(이메일) 조회
 * 3. 원래 페이지로 리다이렉트 (이메일을 쿼리 파라미터로 전달)
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state"); // slug
  const error = request.nextUrl.searchParams.get("error");

  // 프로덕션/개발 환경에 따른 base URL 설정
  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://lead.polarad.co.kr"
    : "http://localhost:3000";

  // 에러 처리 (사용자가 취소한 경우 등)
  if (error) {
    console.error("Kakao OAuth error:", error);
    const redirectUrl = state ? `${baseUrl}/l/${state}?kakao_error=${error}` : baseUrl;
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    console.error("Missing code or state");
    return NextResponse.redirect(`${baseUrl}?error=missing_params`);
  }

  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  if (!clientId) {
    console.error("KAKAO_CLIENT_ID is not set");
    return NextResponse.redirect(`${baseUrl}/l/${state}?kakao_error=config_error`);
  }

  const redirectUri = `${baseUrl}/api/auth/kakao/callback`;

  try {
    // 1. 토큰 발급
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code,
        ...(clientSecret && { client_secret: clientSecret }),
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token request failed:", errorData);
      return NextResponse.redirect(`${baseUrl}/l/${state}?kakao_error=token_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token received");
      return NextResponse.redirect(`${baseUrl}/l/${state}?kakao_error=no_token`);
    }

    // 2. 사용자 정보 조회
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error("User info request failed:", errorData);
      return NextResponse.redirect(`${baseUrl}/l/${state}?kakao_error=user_info_failed`);
    }

    const userData = await userResponse.json();
    const email = userData.kakao_account?.email;
    const kakaoId = userData.id?.toString(); // 카카오 고유 사용자 ID

    console.log(`[Kakao] User ID: ${kakaoId}, Email: ${email}`);

    if (!email) {
      console.error("No email in user data:", userData);
      return NextResponse.redirect(`${baseUrl}/l/${state}?kakao_error=no_email`);
    }

    // 3. 토큰 연결 해제 (일회성 인증이므로)
    // 선택사항: 사용자 데이터를 더 이상 보관하지 않으므로 연결 해제
    try {
      await fetch("https://kapi.kakao.com/v1/user/unlink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (unlinkError) {
      // 연결 해제 실패해도 진행 (중요하지 않음)
      console.warn("Failed to unlink Kakao user:", unlinkError);
    }

    // 4. 원래 페이지로 리다이렉트 (이메일과 카카오ID를 쿼리 파라미터로 전달)
    const redirectUrl = new URL(`${baseUrl}/l/${state}`);
    redirectUrl.searchParams.set("kakao_email", email);
    if (kakaoId) {
      redirectUrl.searchParams.set("kakao_id", kakaoId);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Kakao OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/l/${state}?kakao_error=unknown_error`);
  }
}
