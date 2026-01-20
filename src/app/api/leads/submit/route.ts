import { NextRequest, NextResponse } from "next/server";
import { getClientById, createLead, isBlacklisted } from "@/lib/airtable";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, name, phone } = body;

    // 필수 필드 검증
    if (!clientId || !name || !phone) {
      return NextResponse.json(
        { success: false, error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 클라이언트 조회
    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 요청입니다." },
        { status: 400 }
      );
    }

    // 비활성 클라이언트 체크
    if (client.status !== "active") {
      return NextResponse.json(
        { success: false, error: "현재 신청을 받지 않고 있습니다." },
        { status: 400 }
      );
    }

    // leadsTableId 체크
    if (!client.leadsTableId) {
      return NextResponse.json(
        { success: false, error: "서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // User Agent 가져오기
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 블랙리스트 체크
    const blacklisted = await isBlacklisted(clientId, { phone, ip });
    if (blacklisted) {
      // 블랙리스트에 있어도 사용자에게는 성공처럼 보이게
      return NextResponse.json({ success: true });
    }

    // 리드 생성
    await createLead(client.leadsTableId, clientId, {
      name,
      phone,
      status: "new",
      ipAddress: ip,
      userAgent: userAgent.substring(0, 500), // 너무 긴 UA는 자름
    });

    // TODO: 텔레그램 알림 전송 (client.telegramChatId가 있으면)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
