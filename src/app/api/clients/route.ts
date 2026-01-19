import { NextRequest, NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/airtable";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { success: false, error: "클라이언트 목록을 가져오는데 실패했습니다." },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // 슬러그 형식 검증
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
        },
        { status: 400 }
      );
    }

    const client = await createClient({
      name: body.name,
      slug: body.slug,
      status: body.status || "pending",
      kakaoClientId: body.kakaoClientId,
      kakaoClientSecret: body.kakaoClientSecret,
      telegramChatId: body.telegramChatId,
      landingTitle: body.landingTitle,
      landingDescription: body.landingDescription,
      primaryColor: body.primaryColor || "#3b82f6",
      logoUrl: body.logoUrl,
      contractStart: body.contractStart,
      contractEnd: body.contractEnd,
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    console.error("Failed to create client:", error);
    return NextResponse.json(
      { success: false, error: "클라이언트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
