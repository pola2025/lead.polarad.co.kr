import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientBySlug, getLeadsByClient } from "@/lib/airtable";

/**
 * 클라이언트 포털 - 접수내역 조회
 * GET /api/portal/[slug]/leads
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

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

    // 리드 조회
    const leads = await getLeadsByClient(client.id, client.leadsTableId, {
      limit: 500,
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("Portal leads fetch error:", error);
    return NextResponse.json(
      { success: false, error: "접수내역을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
