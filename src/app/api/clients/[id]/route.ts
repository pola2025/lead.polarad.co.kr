import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateClient, deleteClient } from "@/lib/airtable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientById(id);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return NextResponse.json(
      { success: false, error: "클라이언트를 가져오는데 실패했습니다." },
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

    // 슬러그 형식 검증
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
        },
        { status: 400 }
      );
    }

    const client = await updateClient(id, body);
    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("Failed to update client:", error);
    return NextResponse.json(
      { success: false, error: "클라이언트 수정에 실패했습니다." },
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
    await deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete client:", error);
    return NextResponse.json(
      { success: false, error: "클라이언트 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
