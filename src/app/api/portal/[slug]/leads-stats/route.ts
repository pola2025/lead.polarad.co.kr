import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientBySlug, getLeadsByClient } from "@/lib/airtable";
import type { Lead } from "@/types";

interface LeadStatsResponse {
  today: {
    leads: number;
    submissions: number;
  };
  week: {
    leads: number;
    submissions: number;
  };
  month: {
    leads: number;
    submissions: number;
  };
  funnel: {
    logins: number;      // 카카오 로그인 수
    submissions: number; // 접수 완료 수
  };
  daily: {
    date: string; // YYYYMMDD 형식
    leads: number;
    submissions: number;
  }[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  // 기간 파라미터 (기본값: 30d)
  const period = searchParams.get("period") || "30d";
  const customStart = searchParams.get("startDate");
  const customEnd = searchParams.get("endDate");

  // 인증 확인
  const cookieStore = await cookies();
  const authToken = cookieStore.get(`portal_${slug}`)?.value;

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

    // 리드 조회 (최근 90일)
    const leads = await getLeadsByClient(client.id, client.leadsTableId, {
      limit: 1000, // 충분히 많이 조회
    });

    // 날짜 계산
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // 기간에 따른 시작일 계산
    let periodDays = 30;
    if (period === "7d") periodDays = 7;
    else if (period === "30d") periodDays = 30;
    else if (period === "90d") periodDays = 90;

    const periodAgo = new Date(today);
    periodAgo.setDate(periodAgo.getDate() - periodDays);

    // 커스텀 기간 또는 기본 기간 사용
    const rangeStart = (period === "custom" && customStart) ? new Date(customStart) : periodAgo;
    const rangeEnd = (period === "custom" && customEnd) ? new Date(customEnd) : now;

    // 기간별 필터링
    const todayLeads = leads.filter(l => new Date(l.createdAt) >= today);
    const weekLeads = leads.filter(l => new Date(l.createdAt) >= weekAgo);
    const monthLeads = leads.filter(l => new Date(l.createdAt) >= monthAgo);

    // 선택된 기간 필터링
    const rangeLeads = leads.filter(l => {
      const createdAt = new Date(l.createdAt);
      return createdAt >= rangeStart && createdAt <= rangeEnd;
    });

    // 접수 완료 필터 (status !== 'kakao_login' && status !== 'spam')
    const isSubmitted = (l: Lead) =>
      l.status !== 'kakao_login' && l.status !== 'spam';

    // 일별 집계 (선택된 기간)
    const dailyMap = new Map<string, { leads: number; submissions: number }>();
    rangeLeads.forEach(lead => {
      const date = formatDate(new Date(lead.createdAt));
      const current = dailyMap.get(date) || { leads: 0, submissions: 0 };
      current.leads += 1;
      if (isSubmitted(lead)) {
        current.submissions += 1;
      }
      dailyMap.set(date, current);
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const data: LeadStatsResponse = {
      today: {
        leads: todayLeads.length,
        submissions: todayLeads.filter(isSubmitted).length,
      },
      week: {
        leads: weekLeads.length,
        submissions: weekLeads.filter(isSubmitted).length,
      },
      month: {
        leads: monthLeads.length,
        submissions: monthLeads.filter(isSubmitted).length,
      },
      funnel: {
        logins: rangeLeads.length, // 카카오 로그인 = 전체 리드 (모든 리드가 카카오 로그인 필수)
        submissions: rangeLeads.filter(isSubmitted).length,
      },
      daily,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("리드 통계 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "리드 통계를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// YYYYMMDD 형식으로 날짜 포맷팅
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
