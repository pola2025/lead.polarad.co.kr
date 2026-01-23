import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientBySlug, getHeatmapAggregated } from "@/lib/airtable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(`portal_auth_${slug}`);

    // 인증 확인
    if (!authCookie) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 클라이언트 확인
    const client = await getClientBySlug(slug);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 클라이언트입니다." },
        { status: 404 }
      );
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as "7d" | "30d" | "90d" | "custom" | null;
    const deviceType = searchParams.get("device") as "mobile" | "desktop" | "tablet" | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 히트맵 데이터 조회
    const heatmapData = await getHeatmapAggregated(slug, {
      period: period || "7d",
      deviceType: deviceType || undefined,
      startDate: period === "custom" && startDate ? startDate : undefined,
      endDate: period === "custom" && endDate ? endDate : undefined,
    });

    return NextResponse.json({
      success: true,
      data: heatmapData,
    });
  } catch (error) {
    console.error("히트맵 조회 실패:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
