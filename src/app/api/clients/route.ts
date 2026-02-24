import { NextRequest, NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/airtable";
import { isSlugUnique, validateSlugFormat } from "@/lib/client";
import { createSlackChannel, sendClientCreatedNotification } from "@/lib/slack";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { success: false, error: "클라이언트 목록을 가져오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: "이름과 슬러그는 필수입니다." },
        { status: 400 },
      );
    }

    // 슬러그 형식 검증
    if (!validateSlugFormat(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
        },
        { status: 400 },
      );
    }

    // 슬러그 중복 검사
    const slugUnique = await isSlugUnique(body.slug);
    if (!slugUnique) {
      return NextResponse.json(
        {
          success: false,
          error: "이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해주세요.",
        },
        { status: 400 },
      );
    }

    // 슬랙 채널 자동 생성 (수동 입력값이 없으면)
    let slackChannelId = body.slackChannelId;
    if (!slackChannelId) {
      slackChannelId = await createSlackChannel(body.slug);
    }

    const client = await createClient({
      name: body.name,
      slug: body.slug,
      status: body.status || "pending",
      kakaoClientId: body.kakaoClientId,
      kakaoClientSecret: body.kakaoClientSecret,
      telegramChatId: body.telegramChatId,
      slackChannelId: slackChannelId || undefined,
      landingTitle: body.landingTitle,
      landingDescription: body.landingDescription,
      primaryColor: body.primaryColor || "#3b82f6",
      logoUrl: body.logoUrl,
      contractStart: body.contractStart,
      contractEnd: body.contractEnd,
      ctaButtonText: body.ctaButtonText,
      thankYouTitle: body.thankYouTitle,
      thankYouMessage: body.thankYouMessage,
    });

    // 슬랙 알림 (비동기 - 실패해도 생성은 성공)
    sendClientCreatedNotification(client).catch((err) => {
      console.error("[Slack] 클라이언트 생성 알림 실패:", err);
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to create client:", message);
    return NextResponse.json(
      { success: false, error: `클라이언트 생성에 실패했습니다: ${message}` },
      { status: 500 },
    );
  }
}
