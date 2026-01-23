import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { getClientById, getGA4Settings, getLeadsByClient } from "@/lib/airtable";

// GA4 클라이언트 초기화
function getAnalyticsClient(clientEmail: string, privateKeyOrJson: string) {
  let privateKey = privateKeyOrJson;

  try {
    const parsed = JSON.parse(privateKeyOrJson);
    if (parsed.private_key) {
      privateKey = parsed.private_key;
    }
  } catch {
    // JSON이 아니면 원본 사용
  }

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  // 기간 파라미터
  const period = searchParams.get("period") || "30d";
  const customStart = searchParams.get("startDate");
  const customEnd = searchParams.get("endDate");

  try {
    // 클라이언트 정보 조회
    const client = await getClientById(id);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const slug = client.slug;

    // GA4 설정 조회
    const ga4Settings = await getGA4Settings();

    if (!ga4Settings || !ga4Settings.ga4PropertyId || !ga4Settings.ga4ServiceAccountEmail || !ga4Settings.ga4PrivateKey) {
      return NextResponse.json(
        { success: false, error: "GA4 설정이 완료되지 않았습니다.", code: "GA4_NOT_CONFIGURED" },
        { status: 400 }
      );
    }

    const propertyId = ga4Settings.ga4PropertyId;
    const analyticsClient = getAnalyticsClient(ga4Settings.ga4ServiceAccountEmail, ga4Settings.ga4PrivateKey);
    const landingPath = `/l/${slug}`;

    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // 기간 계산
    let periodDays = 30;
    if (period === "7d") periodDays = 7;
    else if (period === "30d") periodDays = 30;
    else if (period === "90d") periodDays = 90;

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const periodAgo = new Date(today);
    periodAgo.setDate(periodAgo.getDate() - periodDays);

    const rangeStart = (period === "custom" && customStart) ? customStart : formatDate(periodAgo);
    const rangeEnd = (period === "custom" && customEnd) ? customEnd : "today";

    // GA4 리포트 조회
    const [todayReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
        },
      },
    });

    const [weekReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(weekAgo), endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
        },
      },
    });

    const [monthReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: rangeStart, endDate: rangeEnd }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const [sourceReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: rangeStart, endDate: rangeEnd }],
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
        },
      },
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 5,
    });

    const [deviceReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: rangeStart, endDate: rangeEnd }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
        },
      },
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    });

    const [regionReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: rangeStart, endDate: rangeEnd }],
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
        },
      },
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    const [osReport] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: rangeStart, endDate: rangeEnd }],
      dimensions: [{ name: "operatingSystem" }, { name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: landingPath },
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

    const dailyData = (monthReport.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
      pageviews: parseInt(row.metricValues?.[1]?.value || "0", 10),
    }));

    const sources = (sourceReport.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "알 수 없음",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    const deviceData = (deviceReport.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    const totalDeviceUsers = deviceData.reduce((sum, d) => sum + d.users, 0) || 1;
    const devices = deviceData.map((d) => ({
      device: d.device,
      users: d.users,
      percentage: Math.round((d.users / totalDeviceUsers) * 100),
    }));

    const regionData = (regionReport.rows || []).map((row) => ({
      city: row.dimensionValues?.[0]?.value || "알 수 없음",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    const totalRegionUsers = regionData.reduce((sum, r) => sum + r.users, 0) || 1;
    const regions = regionData.map((r) => ({
      city: r.city === "(not set)" ? "알 수 없음" : r.city,
      users: r.users,
      percentage: Math.round((r.users / totalRegionUsers) * 100),
    }));

    // OS별 데이터
    interface DeviceOsData {
      mobile: { [os: string]: number };
      desktop: { [os: string]: number };
      tablet: { [os: string]: number };
    }
    const deviceOsData: DeviceOsData = { mobile: {}, desktop: {}, tablet: {} };

    (osReport.rows || []).forEach((row) => {
      const os = row.dimensionValues?.[0]?.value || "unknown";
      const device = row.dimensionValues?.[1]?.value || "unknown";
      const users = parseInt(row.metricValues?.[0]?.value || "0", 10);

      const deviceKey = device.toLowerCase() as keyof DeviceOsData;
      if (deviceKey in deviceOsData) {
        deviceOsData[deviceKey][os] = (deviceOsData[deviceKey][os] || 0) + users;
      }
    });

    const calculateOsPercentages = (osData: { [os: string]: number }) => {
      const total = Object.values(osData).reduce((sum, users) => sum + users, 0) || 1;
      return Object.entries(osData)
        .map(([os, users]) => ({ os, users, percentage: Math.round((users / total) * 100) }))
        .sort((a, b) => b.users - a.users);
    };

    const deviceOs = {
      mobile: calculateOsPercentages(deviceOsData.mobile),
      desktop: calculateOsPercentages(deviceOsData.desktop),
      tablet: calculateOsPercentages(deviceOsData.tablet),
    };

    const monthlyUsers = dailyData.reduce((sum, d) => sum + d.users, 0);
    const monthlyPageviews = dailyData.reduce((sum, d) => sum + d.pageviews, 0);

    // 리드 통계 (퍼널)
    const leads = client.leadsTableId ? await getLeadsByClient(id, client.leadsTableId) : [];
    const logins = leads.filter((l) => l.status === "kakao_login" || l.kakaoId).length;
    const submissions = leads.filter((l) => l.status !== "kakao_login" && l.name).length;

    return NextResponse.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          slug: client.slug,
        },
        analytics: {
          today: { users: parseMetric(todayRow, 0), pageviews: parseMetric(todayRow, 1) },
          week: { users: parseMetric(weekRow, 0), pageviews: parseMetric(weekRow, 1) },
          month: { users: monthlyUsers, pageviews: monthlyPageviews },
          daily: dailyData,
          sources,
          devices,
          deviceOs,
          regions,
        },
        leadsStats: {
          funnel: { logins, submissions },
          total: leads.length,
        },
      },
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json(
      { success: false, error: "통계 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
