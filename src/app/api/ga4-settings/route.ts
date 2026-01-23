import { NextRequest, NextResponse } from "next/server";
import { getGA4Settings, saveGA4Settings } from "@/lib/airtable";

// GET: GA4 설정 조회
export async function GET() {
  try {
    const settings = await getGA4Settings();

    return NextResponse.json({
      success: true,
      data: settings || {
        ga4PropertyId: "",
        ga4ServiceAccountEmail: "",
        ga4PrivateKey: "",
      },
    });
  } catch (error) {
    console.error("GA4 설정 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "GA4 설정을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: GA4 설정 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ga4PropertyId, ga4ServiceAccountEmail, ga4PrivateKey } = body;

    const settings = await saveGA4Settings({
      ga4PropertyId: ga4PropertyId || "",
      ga4ServiceAccountEmail: ga4ServiceAccountEmail || "",
      ga4PrivateKey: ga4PrivateKey || "",
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GA4 설정 저장 오류:", error);
    return NextResponse.json(
      { success: false, error: "GA4 설정 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
