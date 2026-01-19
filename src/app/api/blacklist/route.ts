import { NextRequest, NextResponse } from "next/server";
import { getBlacklist, createBlacklistEntry, deleteBlacklistEntry } from "@/lib/airtable";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || undefined;

    const blacklist = await getBlacklist(clientId);
    return NextResponse.json({ success: true, data: blacklist });
  } catch (error) {
    console.error("Failed to fetch blacklist:", error);
    return NextResponse.json(
      { success: false, error: "블랙리스트를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.type || !body.value) {
      return NextResponse.json(
        { success: false, error: "타입과 값은 필수입니다." },
        { status: 400 }
      );
    }

    const entry = await createBlacklistEntry({
      clientId: body.clientId,
      type: body.type,
      value: body.value,
      reason: body.reason,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to create blacklist entry:", error);
    return NextResponse.json(
      { success: false, error: "블랙리스트 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID가 필요합니다." },
        { status: 400 }
      );
    }

    await deleteBlacklistEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blacklist entry:", error);
    return NextResponse.json(
      { success: false, error: "블랙리스트 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
