import { NextRequest, NextResponse } from "next/server";
import { getLeadById, updateLead, deleteLead } from "@/lib/airtable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await getLeadById(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "리드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
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

    const lead = await updateLead(id, body);
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
    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json(
      { success: false, error: "리드 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
