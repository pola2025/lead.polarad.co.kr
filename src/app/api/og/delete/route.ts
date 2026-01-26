import { NextRequest, NextResponse } from "next/server";
import { getClientBySlug, updateClient } from "@/lib/airtable";
import { deleteFromR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "slug가 필요합니다." },
        { status: 400 }
      );
    }

    const client = await getClientBySlug(slug);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!client.ogImageUrl) {
      return NextResponse.json(
        { success: false, error: "삭제할 OG 이미지가 없습니다." },
        { status: 400 }
      );
    }

    // R2에서 이미지 삭제
    await deleteFromR2(client.ogImageUrl);

    // Airtable에서 ogImageUrl 제거
    await updateClient(client.id, { ogImageUrl: "" });

    return NextResponse.json({
      success: true,
      message: "OG 이미지가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("OG 이미지 삭제 실패:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { success: false, error: `OG 이미지 삭제 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
