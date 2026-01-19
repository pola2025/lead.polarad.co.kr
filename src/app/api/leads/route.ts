import { NextRequest, NextResponse } from "next/server";
import { getLeads, createLead } from "@/lib/airtable";
import type { LeadStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || undefined;
    const status = (searchParams.get("status") as LeadStatus) || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const leads = await getLeads({ clientId, status, limit });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { success: false, error: "리드 목록을 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.clientId || !body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: "클라이언트 ID, 이름, 연락처는 필수입니다." },
        { status: 400 }
      );
    }

    const lead = await createLead({
      clientId: body.clientId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      businessName: body.businessName,
      industry: body.industry,
      kakaoId: body.kakaoId,
      status: body.status || "new",
      memo: body.memo,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { success: false, error: "리드 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
