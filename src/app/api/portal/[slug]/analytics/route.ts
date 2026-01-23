import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { cookies } from "next/headers";

// GA4 클라이언트 초기화
function getAnalyticsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Google Analytics 인증 정보가 없습니다.");
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 인증 확인
  const cookieStore = await cookies();
  const authToken = cookieStore.get(`portal_auth_${slug}`)?.value;

  if (!authToken) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return NextResponse.json(
      { success: false, error: "GA4 속성 ID가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const client = getAnalyticsClient();
    const landingPath = `/l/${slug}`;

    // 오늘 날짜
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // 7일 전
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 30일 전
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // 오늘 방문자 수
    const [todayReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: landingPath,
          },
        },
      },
    });

    // 7일간 방문자 수
    const [weekReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(weekAgo), endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: landingPath,
          },
        },
      },
    });

    // 30일간 방문자 수 (일별)
    const [monthReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(monthAgo), endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: landingPath,
          },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // 유입 경로 (소스/매체)
    const [sourceReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(monthAgo), endDate: "today" }],
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: landingPath,
          },
        },
      },
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 5,
    });

    // 데이터 파싱
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseMetric = (row: any, index: number) => {
      return parseInt(row?.metricValues?.[index]?.value || "0", 10);
    };

    const todayRow = todayReport.rows?.[0];
    const weekRow = weekReport.rows?.[0];

    // 일별 데이터 파싱
    const dailyData = (monthReport.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
      pageviews: parseInt(row.metricValues?.[1]?.value || "0", 10),
    }));

    // 유입 경로 데이터
    const sources = (sourceReport.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "알 수 없음",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    // 월간 합계
    const monthlyUsers = dailyData.reduce((sum, d) => sum + d.users, 0);
    const monthlyPageviews = dailyData.reduce((sum, d) => sum + d.pageviews, 0);

    return NextResponse.json({
      success: true,
      data: {
        today: {
          users: parseMetric(todayRow, 0),
          pageviews: parseMetric(todayRow, 1),
        },
        week: {
          users: parseMetric(weekRow, 0),
          pageviews: parseMetric(weekRow, 1),
        },
        month: {
          users: monthlyUsers,
          pageviews: monthlyPageviews,
        },
        daily: dailyData,
        sources,
      },
    });
  } catch (error) {
    console.error("GA4 API Error:", error);
    return NextResponse.json(
      { success: false, error: "통계 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
