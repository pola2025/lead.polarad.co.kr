import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientBySlug, updateLead } from "@/lib/airtable";

/**
 * 클라이언트 포털 - 리드 상태 업데이트
 * PUT /api/portal/[slug]/leads/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;

  // 인증 확인
  const cookieStore = await cookies();
  const authToken = cookieStore.get(`portal_auth_${slug}`);

  if (!authToken) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "상태값이 필요합니다." },
        { status: 400 }
      );
    }

    // 클라이언트 조회
    const client = await getClientBySlug(slug);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!client.leadsTableId) {
      return NextResponse.json(
        { success: false, error: "리드 테이블이 설정되지 않았습니다." },
        { status: 400 }
      );
    }

    // 리드 업데이트
    const updatedLead = await updateLead(id, client.leadsTableId, client.id, {
      status,
    });

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    console.error("Portal lead update error:", error);
    return NextResponse.json(
      { success: false, error: "리드 상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}
