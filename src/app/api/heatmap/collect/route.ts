import { NextRequest, NextResponse } from "next/server";
import { getClientBySlug, saveHeatmapClick } from "@/lib/airtable";

interface ClickData {
  xPercent: number;
  yPercent: number;
  viewportWidth: number;
  viewportHeight: number;
  elementSelector?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientSlug, sessionId, clicks } = body as {
      clientSlug: string;
      sessionId: string;
      clicks: ClickData[];
    };

    // 필수 값 검증
    if (!clientSlug || !sessionId || !clicks || !Array.isArray(clicks)) {
      return NextResponse.json(
        { success: false, error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 클라이언트 존재 여부 확인
    const client = await getClientBySlug(clientSlug);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 클라이언트입니다." },
        { status: 400 }
      );
    }

    // 클릭 데이터가 없으면 조기 반환
    if (clicks.length === 0) {
      return NextResponse.json({ success: true, saved: 0 });
    }

    // 배치로 클릭 데이터 저장 (최대 100개)
    const clicksToSave = clicks.slice(0, 100);
    let savedCount = 0;

    for (const click of clicksToSave) {
      // 유효성 검사
      if (
        typeof click.xPercent !== 'number' ||
        typeof click.yPercent !== 'number' ||
        typeof click.viewportWidth !== 'number' ||
        typeof click.viewportHeight !== 'number' ||
        !['mobile', 'desktop', 'tablet'].includes(click.deviceType)
      ) {
        continue; // 유효하지 않은 클릭 데이터 스킵
      }

      try {
        await saveHeatmapClick({
          clientSlug,
          sessionId,
          xPercent: Math.round(click.xPercent * 100) / 100, // 소수점 2자리
          yPercent: Math.round(click.yPercent * 100) / 100,
          viewportWidth: Math.round(click.viewportWidth),
          viewportHeight: Math.round(click.viewportHeight),
          elementSelector: click.elementSelector?.substring(0, 200), // 최대 200자
          deviceType: click.deviceType,
        });
        savedCount++;
      } catch (err) {
        console.error("클릭 저장 실패:", err);
      }
    }

    return NextResponse.json({
      success: true,
      saved: savedCount,
    });
  } catch (error) {
    console.error("히트맵 수집 실패:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
