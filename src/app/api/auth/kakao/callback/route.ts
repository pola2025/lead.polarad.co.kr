import { NextRequest, NextResponse } from "next/server";
import { getClientBySlug, createLead, findKakaoLoginLead } from "@/lib/airtable";

/**
 * 카카오 OAuth 콜백 API
 * GET /api/auth/kakao/callback?code=xxx&state=slug
 *
 * 1. 인가 코드로 토큰 발급
 * 2. 토큰으로 사용자 정보(이메일) 조회
 * 3. 에어테이블에 리드 생성 (kakao_login 상태)
 * 4. 원래 페이지로 리다이렉트 (이메일을 쿼리 파라미터로 전달)
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  // 프로덕션/개발 환경에 따른 base URL 설정
  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://lead.polarad.co.kr"
    : "http://localhost:3000";

  // state 파싱 (base64 JSON 또는 기존 slug 형식 호환)
  let slug = "";
  let utmSource: string | null = null;
  let utmAd: string | null = null;

  if (stateParam) {
    try {
      const decoded = Buffer.from(stateParam, "base64").toString("utf8");
      const stateData = JSON.parse(decoded);
      slug = stateData.slug || "";
      utmSource = stateData.utmSource || null;
      utmAd = stateData.utmAd || null;
    } catch {
      // 기존 형식 (slug만 있는 경우) 호환
      slug = stateParam;
    }
  }

  // 에러 처리 (사용자가 취소한 경우 등)
  if (error) {
    console.error("Kakao OAuth error:", error);
    const redirectUrl = slug ? `${baseUrl}/l/${slug}?kakao_error=${error}` : baseUrl;
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !slug) {
    console.error("Missing code or state");
    return NextResponse.redirect(`${baseUrl}?error=missing_params`);
  }

  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  if (!clientId) {
    console.error("KAKAO_CLIENT_ID is not set");
    return NextResponse.redirect(`${baseUrl}/l/${slug}?kakao_error=config_error`);
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
      return NextResponse.redirect(`${baseUrl}/l/${slug}?kakao_error=token_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token received");
      return NextResponse.redirect(`${baseUrl}/l/${slug}?kakao_error=no_token`);
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
      return NextResponse.redirect(`${baseUrl}/l/${slug}?kakao_error=user_info_failed`);
    }

    const userData = await userResponse.json();
    const email = userData.kakao_account?.email;
    const kakaoId = userData.id?.toString(); // 카카오 고유 사용자 ID

    console.log(`[Kakao] User ID: ${kakaoId}, Email: ${email}`);

    if (!email) {
      console.error("No email in user data:", userData);
      return NextResponse.redirect(`${baseUrl}/l/${slug}?kakao_error=no_email`);
    }

    // 3. 에어테이블에 리드 생성 (kakao_login 상태)
    // 카카오 로그인만 해도 리드 정보 기록 (단, 중복 방지)
    try {
      const client = await getClientBySlug(slug);
      if (client && client.leadsTableId && client.status === "active" && kakaoId) {
        // 이미 같은 kakaoId로 kakao_login 상태의 리드가 있는지 확인
        const existingLead = await findKakaoLoginLead(client.leadsTableId, kakaoId, client.id);

        if (existingLead) {
          console.log(`[Kakao] Lead already exists for user ${kakaoId}, skipping creation`);
        } else {
          // IP 주소 가져오기
          const forwarded = request.headers.get("x-forwarded-for");
          const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
          const userAgent = request.headers.get("user-agent") || "unknown";

          await createLead(client.leadsTableId, client.id, {
            kakaoId: kakaoId,
            email: email,
            status: "kakao_login",
            ipAddress: ip,
            userAgent: userAgent.substring(0, 500),
          });
          console.log(`[Kakao] Lead created for user ${kakaoId} (kakao_login status)`);
        }
      }
    } catch (leadError) {
      // 리드 생성 실패해도 로그인은 진행
      console.error("Failed to create kakao_login lead:", leadError);
    }

    // 4. 토큰 연결 해제 (일회성 인증이므로)
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

    // 5. 원래 페이지로 리다이렉트 (이메일, 카카오ID, UTM 정보를 쿼리 파라미터로 전달)
    const redirectUrl = new URL(`${baseUrl}/l/${slug}`);
    redirectUrl.searchParams.set("kakao_email", email);
    if (kakaoId) {
      redirectUrl.searchParams.set("kakao_id", kakaoId);
    }
    // UTM 정보 유지
    if (utmSource) {
      redirectUrl.searchParams.set("utm_source", utmSource);
    }
    if (utmAd) {
      redirectUrl.searchParams.set("utm_ad", utmAd);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Kakao OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/l/${slug}?kakao_error=unknown_error`);
  }
}
