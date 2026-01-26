import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateClient, deleteClient } from "@/lib/airtable";
import { sendClientUpdatedNotification } from "@/lib/slack";
import { syncFormFieldsToAirtable } from "@/lib/form-fields";
import type { FormField } from "@/types";

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

// 변경 항목 레이블
const FIELD_LABELS: Record<string, string> = {
  name: "클라이언트명",
  slug: "슬러그",
  status: "상태",
  landingTitle: "랜딩 제목",
  landingDescription: "랜딩 설명",
  primaryColor: "테마 색상",
  logoUrl: "로고",
  ctaButtonText: "CTA 버튼",
  thankYouTitle: "완료 제목",
  thankYouMessage: "완료 메시지",
  formFields: "폼 필드",
  productFeatures: "상품 특징",
  telegramChatId: "텔레그램 ID",
  contractStart: "계약 시작일",
  contractEnd: "계약 종료일",
};

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

    // 기존 데이터 조회 (변경 감지용)
    const oldClient = await getClientById(id);

    // 폼 필드 변경 시 Airtable Leads 테이블 스키마 동기화
    if (body.formFields && oldClient?.leadsTableId) {
      const newFields = body.formFields as FormField[];
      const oldFields = oldClient.formFields || [];
      await syncFormFieldsToAirtable(oldClient.leadsTableId, oldFields, newFields);
    }

    const client = await updateClient(id, body);

    // 변경된 항목 감지
    const changes: string[] = [];
    if (oldClient) {
      for (const key of Object.keys(body)) {
        const label = FIELD_LABELS[key];
        if (label) {
          changes.push(label);
        }
      }
    }

    // 슬랙 알림 (비동기 - 실패해도 수정은 성공)
    sendClientUpdatedNotification(client, changes).catch((err) => {
      console.error("[Slack] 클라이언트 수정 알림 실패:", err);
    });

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("Failed to update client:", error);
    // 에러 상세 정보 로깅
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
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
