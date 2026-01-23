import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { cookies } from "next/headers";
import { getGA4Settings } from "@/lib/airtable";

// GA4 클라이언트 초기화 (공통 설정 사용)
function getAnalyticsClient(clientEmail: string, privateKeyOrJson: string) {
  let privateKey = privateKeyOrJson;

  // JSON 형식인 경우 private_key 추출
  try {
    const parsed = JSON.parse(privateKeyOrJson);
    if (parsed.private_key) {
      privateKey = parsed.private_key;
    }
  } catch {
    // JSON이 아니면 원본 사용
  }

  // 개인키의 \n을 실제 줄바꿈으로 변환
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: formattedPrivateKey,
    },
  });
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
    // 공통 GA4 설정 조회
    const ga4Settings = await getGA4Settings();

    if (!ga4Settings || !ga4Settings.ga4PropertyId || !ga4Settings.ga4ServiceAccountEmail || !ga4Settings.ga4PrivateKey) {
      return NextResponse.json(
        { success: false, error: "GA4 설정이 완료되지 않았습니다. 관리자에게 문의하세요.", code: "GA4_NOT_CONFIGURED" },
        { status: 400 }
      );
    }

    const propertyId = ga4Settings.ga4PropertyId;
    const client = getAnalyticsClient(ga4Settings.ga4ServiceAccountEmail, ga4Settings.ga4PrivateKey);
    const landingPath = `/l/${slug}`;

    // 오늘 날짜
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // 기간에 따른 시작일 계산
    let periodDays = 30;
    if (period === "7d") periodDays = 7;
    else if (period === "30d") periodDays = 30;
    else if (period === "90d") periodDays = 90;
    else if (period === "custom" && customStart && customEnd) {
      // 커스텀 기간 사용
    }

    // 7일 전
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 30일 전 (기본)
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // 기간에 따른 시작일
    const periodAgo = new Date(today);
    periodAgo.setDate(periodAgo.getDate() - periodDays);

    // 커스텀 기간 또는 기본 기간 사용
    const rangeStart = (period === "custom" && customStart) ? customStart : formatDate(periodAgo);
    const rangeEnd = (period === "custom" && customEnd) ? customEnd : "today";

    // 리포트에서 사용할 기간
    const reportStartDate = rangeStart;
    const reportEndDate = rangeEnd;

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
      dateRanges: [{ startDate: reportStartDate, endDate: reportEndDate }],
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
      dateRanges: [{ startDate: reportStartDate, endDate: reportEndDate }],
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

    // 기기별 방문자 (30일간)
    const [deviceReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: reportStartDate, endDate: reportEndDate }],
      dimensions: [{ name: "deviceCategory" }],
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
    });

    // 지역별 방문자 (30일간)
    const [regionReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: reportStartDate, endDate: reportEndDate }],
      dimensions: [{ name: "city" }],
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
      limit: 10,
    });

    // OS별 방문자 (모바일에서 Android/iOS 분류용)
    const [osReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: reportStartDate, endDate: reportEndDate }],
      dimensions: [{ name: "operatingSystem" }, { name: "deviceCategory" }],
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

    // 기기별 데이터
    const deviceData = (deviceReport.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    // 기기별 비율 계산
    const totalDeviceUsers = deviceData.reduce((sum, d) => sum + d.users, 0) || 1;
    const devices = deviceData.map((d) => ({
      device: d.device,
      users: d.users,
      percentage: Math.round((d.users / totalDeviceUsers) * 100),
    }));

    // 지역별 데이터
    const regionData = (regionReport.rows || []).map((row) => ({
      city: row.dimensionValues?.[0]?.value || "알 수 없음",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    // 지역별 비율 계산
    const totalRegionUsers = regionData.reduce((sum, r) => sum + r.users, 0) || 1;
    const regions = regionData.map((r) => ({
      city: r.city === "(not set)" ? "알 수 없음" : r.city,
      users: r.users,
      percentage: Math.round((r.users / totalRegionUsers) * 100),
    }));

    // OS별 데이터 파싱 (기기별로 그룹화)
    interface DeviceOsData {
      mobile: { [os: string]: number };
      desktop: { [os: string]: number };
      tablet: { [os: string]: number };
    }
    const deviceOsData: DeviceOsData = {
      mobile: {},
      desktop: {},
      tablet: {},
    };

    (osReport.rows || []).forEach((row) => {
      const os = row.dimensionValues?.[0]?.value || "unknown";
      const device = row.dimensionValues?.[1]?.value || "unknown";
      const users = parseInt(row.metricValues?.[0]?.value || "0", 10);

      // 기기 타입별로 OS 집계
      const deviceKey = device.toLowerCase() as keyof DeviceOsData;
      if (deviceKey in deviceOsData) {
        deviceOsData[deviceKey][os] = (deviceOsData[deviceKey][os] || 0) + users;
      }
    });

    // OS 비율 계산
    const calculateOsPercentages = (osData: { [os: string]: number }) => {
      const total = Object.values(osData).reduce((sum, users) => sum + users, 0) || 1;
      return Object.entries(osData)
        .map(([os, users]) => ({
          os,
          users,
          percentage: Math.round((users / total) * 100),
        }))
        .sort((a, b) => b.users - a.users);
    };

    const deviceOs = {
      mobile: calculateOsPercentages(deviceOsData.mobile),
      desktop: calculateOsPercentages(deviceOsData.desktop),
      tablet: calculateOsPercentages(deviceOsData.tablet),
    };

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
        devices,
        deviceOs,
        regions,
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
