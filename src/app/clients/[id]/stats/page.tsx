"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface DeviceOsItem {
  os: string;
  users: number;
  percentage: number;
}

interface AnalyticsData {
  today: { users: number; pageviews: number };
  week: { users: number; pageviews: number };
  month: { users: number; pageviews: number };
  daily: { date: string; users: number; pageviews: number }[];
  sources: { source: string; users: number }[];
  devices: { device: string; users: number; percentage: number }[];
  deviceOs: {
    mobile: DeviceOsItem[];
    desktop: DeviceOsItem[];
    tablet: DeviceOsItem[];
  };
  regions: { city: string; users: number; percentage: number }[];
}

interface LeadsStatsData {
  funnel: { logins: number; submissions: number };
  total: number;
}

interface ClientData {
  id: string;
  name: string;
  slug: string;
}

interface StatsData {
  client: ClientData;
  analytics: AnalyticsData;
  leadsStats: LeadsStatsData;
}

export default function AdminStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsPeriod, setStatsPeriod] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState<string | null>("mobile");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const periodParam = statsPeriod === "custom"
        ? `period=custom&startDate=${customDateRange.start}&endDate=${customDateRange.end}`
        : `period=${statsPeriod}`;

      const res = await fetch(`/api/clients/${id}/stats?${periodParam}`);
      const result = await res.json();

      if (!result.success) {
        setError(result.error || "데이터를 불러오는데 실패했습니다.");
        return;
      }

      setData(result.data);
    } catch (err) {
      console.error(err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, statsPeriod, customDateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !data) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:underline"
            >
              돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const analytics = data?.analytics;
  const leadsStats = data?.leadsStats;
  const client = data?.client;

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href={`/clients/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            클라이언트 상세로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {client?.name} 통계
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                포털 통계 화면과 동일한 데이터입니다.
              </p>
            </div>
            <a
              href={`/portal/${client?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <ExternalLink className="h-4 w-4" />
              포털 열기
            </a>
          </div>
        </div>

        {/* 기간 필터 */}
        <div className="flex items-center gap-1 flex-wrap mb-4">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <button
              key={period}
              onClick={() => { setStatsPeriod(period); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                statsPeriod === period
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {period === "7d" ? "7일" : period === "30d" ? "30일" : "90일"}
            </button>
          ))}
          <button
            onClick={() => { setStatsPeriod("custom"); setShowDatePicker(!showDatePicker); }}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
              statsPeriod === "custom"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {statsPeriod === "custom"
              ? `${customDateRange.start} ~ ${customDateRange.end}`
              : "기간선택"}
          </button>
        </div>

        {/* 커스텀 날짜 선택 */}
        {showDatePicker && (
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg mb-4">
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-gray-500 text-xs">~</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => { fetchStats(); setShowDatePicker(false); }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              적용
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : analytics ? (
          <div className="space-y-4">
            {/* 1. 전환율 히어로 */}
            {(() => {
              const visitors = analytics.month.users || 0;
              const logins = leadsStats?.funnel.logins || 0;
              const submissions = leadsStats?.funnel.submissions || 0;
              const conversionRate = visitors > 0 ? Math.round((submissions / visitors) * 100) : 0;
              const loginRate = visitors > 0 ? Math.round((logins / visitors) * 100) : 0;
              const submitRate = logins > 0 ? Math.round((submissions / logins) * 100) : 0;

              return (
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80 mb-0.5">
                        {statsPeriod === "7d" ? "7일" : statsPeriod === "30d" ? "30일" : statsPeriod === "90d" ? "90일" : "선택기간"} 전환율
                      </p>
                      <p className="text-3xl font-bold">{conversionRate}%</p>
                      <p className="text-xs opacity-70 mt-1">
                        {visitors.toLocaleString()} 방문 → {submissions.toLocaleString()} 접수
                      </p>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold">{loginRate}%</p>
                        <p className="text-[10px] opacity-70">로그인율</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{submitRate}%</p>
                        <p className="text-[10px] opacity-70">접수율</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. 전환 퍼널 */}
            {(() => {
              const visitors = analytics.month.users || 0;
              const logins = leadsStats?.funnel.logins || 0;
              const submissions = leadsStats?.funnel.submissions || 0;
              const loginRate = visitors > 0 ? Math.round((logins / visitors) * 100) : 0;
              const submitRate = visitors > 0 ? Math.round((submissions / visitors) * 100) : 0;

              return (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">전환 퍼널</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-xs text-gray-600">방문</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{visitors.toLocaleString()}명</span>
                          <span className="text-[10px] text-gray-500">100%</span>
                        </div>
                        <div className="h-2.5 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-xs text-gray-600">로그인</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{logins.toLocaleString()}명</span>
                          <span className="text-[10px] text-gray-500">{loginRate}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${loginRate}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-xs text-gray-600">접수완료</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{submissions.toLocaleString()}명</span>
                          <span className="text-[10px] text-gray-500">{submitRate}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${submitRate}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. 기기별 방문자 (아코디언) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <h3 className="text-sm font-semibold text-gray-900 p-4 pb-2">기기별 방문자</h3>
              {analytics.devices && analytics.devices.length > 0 ? (
                <div className="border-t border-gray-100">
                  {analytics.devices.map((device) => {
                    const deviceKey = device.device.toLowerCase();
                    const deviceEmoji = deviceKey === "mobile" ? "📱" : deviceKey === "desktop" ? "💻" : "📟";
                    const deviceLabel = deviceKey === "mobile" ? "모바일" : deviceKey === "desktop" ? "데스크톱" : "태블릿";
                    const isExpanded = expandedDevice === deviceKey;
                    const osData = analytics.deviceOs?.[deviceKey as keyof typeof analytics.deviceOs] || [];

                    return (
                      <div key={device.device} className="border-b border-gray-100 last:border-b-0">
                        <button
                          onClick={() => setExpandedDevice(isExpanded ? null : deviceKey)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{deviceEmoji}</span>
                            <span className="text-sm text-gray-700">{deviceLabel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{device.percentage}%</span>
                            <span className="text-xs text-gray-400">({device.users.toLocaleString()}명)</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isExpanded && osData.length > 0 && (
                          <div className="bg-gray-50 px-4 py-2.5 space-y-2">
                            {osData.slice(0, 3).map((os) => (
                              <div key={os.os} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  {os.os === "Android" ? "🤖" : os.os === "iOS" ? "🍎" : os.os === "Windows" ? "🪟" : os.os === "Macintosh" ? "🍎" : "💻"} {os.os}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${os.percentage}%` }}></div>
                                  </div>
                                  <span className="text-xs font-medium w-8">{os.percentage}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">기기 데이터가 없습니다</div>
              )}
            </div>

            {/* 4. 지역별 방문자 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">지역별 방문자</h3>
              {analytics.regions && analytics.regions.length > 0 ? (
                <div className="space-y-2">
                  {analytics.regions.slice(0, 5).map((region, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16 truncate">{region.city}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${region.percentage}%` }}></div>
                      </div>
                      <span className="text-xs font-medium w-8 text-right">{region.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">지역 데이터가 없습니다</p>
              )}
            </div>

            {/* 5. 히트맵 카드 */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">클릭 히트맵</h3>
                  <p className="text-xs opacity-80">터치/클릭 위치 분석</p>
                </div>
                <Link
                  href={`/portal/${client?.slug}/heatmap`}
                  target="_blank"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  전체보기
                </Link>
              </div>
            </div>

            {/* 6. 유입 경로 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">유입 경로 TOP 5</h3>
              {analytics.sources && analytics.sources.length > 0 ? (
                <div className="space-y-2.5">
                  {analytics.sources.map((source, idx) => {
                    const maxUsers = analytics.sources[0]?.users || 1;
                    const width = (source.users / maxUsers) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 text-xs text-gray-400">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-700 truncate max-w-[180px]">
                              {source.source === "(direct) / (none)" ? "직접 방문" : source.source}
                            </span>
                            <span className="text-xs font-medium text-gray-900">{source.users}명</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">유입 데이터가 없습니다</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">GA4 연동이 필요합니다</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
              방문 통계를 확인하려면 Google Analytics 4 설정이 필요합니다.
            </p>
            <Link
              href="/ga4-settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-sm text-white hover:bg-primary-700"
            >
              GA4 설정하기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
