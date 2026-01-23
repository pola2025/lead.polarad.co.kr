import { NextRequest, NextResponse } from "next/server";
import { getClientBySlug } from "@/lib/airtable";
import { DEFAULT_FORM_FIELDS } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = await getClientBySlug(slug);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비활성 클라이언트는 공개하지 않음
    if (client.status !== "active") {
      return NextResponse.json(
        { success: false, error: "현재 이용할 수 없는 페이지입니다." },
        { status: 404 }
      );
    }

    // 활성화된 폼 필드만 반환 (순서대로 정렬)
    const formFields = (client.formFields || DEFAULT_FORM_FIELDS)
      .filter((f) => f.enabled)
      .sort((a, b) => a.order - b.order);

    // 민감한 정보 제거
    const publicClient = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      landingTitle: client.landingTitle,
      landingDescription: client.landingDescription,
      primaryColor: client.primaryColor,
      logoUrl: client.logoUrl,
      ctaButtonText: client.ctaButtonText,
      thankYouTitle: client.thankYouTitle,
      thankYouMessage: client.thankYouMessage,
      formFields: formFields,
    };

    return NextResponse.json({ success: true, data: publicClient });
  } catch (error) {
    console.error("Failed to fetch client by slug:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
