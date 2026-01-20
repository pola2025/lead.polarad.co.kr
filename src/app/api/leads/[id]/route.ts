import { NextRequest, NextResponse } from "next/server";
import { findLeadById, updateLead, deleteLead } from "@/lib/airtable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await findLeadById(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "리드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.lead });
  } catch (error) {
    console.error("Failed to fetch lead:", error);
    return NextResponse.json(
      { success: false, error: "리드를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 리드 ID로 클라이언트 정보 먼저 조회
    const result = await findLeadById(id);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "리드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { client } = result;
    if (!client.leadsTableId) {
      return NextResponse.json(
        { success: false, error: "클라이언트에 리드 테이블이 설정되지 않았습니다." },
        { status: 400 }
      );
    }

    const lead = await updateLead(id, client.leadsTableId, client.id, body);
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json(
      { success: false, error: "리드 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 리드 ID로 클라이언트 정보 먼저 조회
    const result = await findLeadById(id);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "리드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { client } = result;
    if (!client.leadsTableId) {
      return NextResponse.json(
        { success: false, error: "클라이언트에 리드 테이블이 설정되지 않았습니다." },
        { status: 400 }
      );
    }

    await deleteLead(id, client.leadsTableId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json(
      { success: false, error: "리드 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
