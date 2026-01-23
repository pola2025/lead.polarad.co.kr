"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, Smartphone, Monitor, Tablet, MousePointerClick } from "lucide-react";
import Script from "next/script";

interface HeatmapData {
  points: { x: number; y: number; value: number }[];
  elements: { selector: string; clicks: number }[];
  total: number;
}

export default function HeatmapPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [device, setDevice] = useState<"all" | "mobile" | "desktop" | "tablet">("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heatmapReady, setHeatmapReady] = useState(false);
  const [landingUrl, setLandingUrl] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const heatmapContainerRef = useRef<HTMLDivElement>(null);
  const heatmapInstanceRef = useRef<unknown>(null);

  // 클라이언트 정보 조회
  useEffect(() => {
    setLandingUrl(`${window.location.origin}/l/${slug}`);
  }, [slug]);

  // 히트맵 데이터 조회
  const fetchHeatmap = useCallback(async () => {
    setLoading(true);
    try {
      const periodParam = period === "custom"
        ? `period=custom&startDate=${customDateRange.start}&endDate=${customDateRange.end}`
        : `period=${period}`;
      const deviceParam = device !== "all" ? `&device=${device}` : "";

      const res = await fetch(`/api/portal/${slug}/heatmap?${periodParam}${deviceParam}`);
      const data = await res.json();

      if (data.success) {
        setHeatmapData(data.data);
      }
    } catch (err) {
      console.error("Heatmap fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, period, customDateRange, device]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  // heatmap.js 로드 후 렌더링
  useEffect(() => {
    if (!heatmapReady || !heatmapData || !heatmapContainerRef.current || !iframeLoaded) return;

    // 기존 히트맵 인스턴스 제거
    if (heatmapInstanceRef.current) {
      heatmapContainerRef.current.innerHTML = '';
    }

    // @ts-expect-error h337 is loaded via CDN
    const h337 = window.h337;
    if (!h337) return;

    const container = heatmapContainerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // 히트맵 인스턴스 생성
    const heatmapInstance = h337.create({
      container,
      radius: Math.max(20, width * 0.03),
      maxOpacity: 0.7,
      minOpacity: 0.1,
      blur: 0.85,
      gradient: {
        0.2: 'blue',
        0.4: 'cyan',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    });

    // 데이터 변환 (퍼센트 → 픽셀)
    const points = heatmapData.points.map(p => ({
      x: Math.round((p.x / 100) * width),
      y: Math.round((p.y / 100) * height),
      value: p.value
    }));

    const maxValue = Math.max(...points.map(p => p.value), 1);

    heatmapInstance.setData({
      max: maxValue,
      data: points
    });

    heatmapInstanceRef.current = heatmapInstance;
  }, [heatmapReady, heatmapData, iframeLoaded]);

  const getPeriodLabel = () => {
    if (period === "custom") {
      return `${customDateRange.start} ~ ${customDateRange.end}`;
    }
    return period === "7d" ? "7일" : period === "30d" ? "30일" : "90일";
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/heatmap.js@2.0.5/build/heatmap.min.js"
        onLoad={() => setHeatmapReady(true)}
      />

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">클릭 히트맵</h1>
                <p className="text-xs text-gray-500">{getPeriodLabel()} 기준</p>
              </div>
            </div>

            {/* 총 클릭 수 */}
            {heatmapData && (
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
                <MousePointerClick className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  {heatmapData.total.toLocaleString()}회 클릭
                </span>
              </div>
            )}
          </div>
        </header>

        {/* 필터 바 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
            {/* 기간 필터 */}
            <div className="flex items-center gap-1">
              {(["7d", "30d", "90d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setShowDatePicker(false); }}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    period === p
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p === "7d" ? "7일" : p === "30d" ? "30일" : "90일"}
                </button>
              ))}
              <button
                onClick={() => { setPeriod("custom"); setShowDatePicker(!showDatePicker); }}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  period === "custom"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Calendar className="h-3 w-3" />
                기간선택
              </button>
            </div>

            {/* 디바이스 필터 */}
            <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
              {([
                { value: "all", icon: null, label: "전체" },
                { value: "mobile", icon: Smartphone, label: "모바일" },
                { value: "desktop", icon: Monitor, label: "데스크톱" },
                { value: "tablet", icon: Tablet, label: "태블릿" },
              ] as const).map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDevice(d.value)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
                    device === d.value
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {d.icon && <d.icon className="h-3 w-3" />}
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* 커스텀 날짜 선택 */}
          {showDatePicker && (
            <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2">
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
                onClick={() => { fetchHeatmap(); setShowDatePicker(false); }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                적용
              </button>
            </div>
          )}
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* 히트맵 영역 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="h-[80vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="relative h-[80vh] overflow-y-auto">
                    {/* 랜딩페이지 iframe - 전체 높이 표시 */}
                    <div className="relative" style={{ height: '200vh' }}>
                      <iframe
                        src={landingUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        title="Landing Page Preview"
                        onLoad={() => setIframeLoaded(true)}
                        style={{ pointerEvents: 'none' }}
                      />

                      {/* 히트맵 오버레이 */}
                      <div
                        ref={heatmapContainerRef}
                        className="absolute inset-0 pointer-events-none"
                        style={{ zIndex: 10 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 범례 */}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>클릭 밀도:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 rounded" style={{ background: 'linear-gradient(to right, blue, cyan, lime, yellow, red)' }} />
                  <span>낮음</span>
                  <span className="mx-1">→</span>
                  <span>높음</span>
                </div>
              </div>
            </div>

            {/* 사이드바 - 클릭 TOP 요소 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">클릭 TOP 요소</h3>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : heatmapData && heatmapData.elements.length > 0 ? (
                  <div className="space-y-3">
                    {heatmapData.elements.slice(0, 10).map((el, idx) => {
                      const percentage = heatmapData.total > 0
                        ? Math.round((el.clicks / heatmapData.total) * 100)
                        : 0;

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 truncate flex-1 mr-2" title={el.selector}>
                              {idx + 1}. {el.selector}
                            </span>
                            <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
                              {el.clicks.toLocaleString()}회
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 text-right">{percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">
                    클릭 데이터가 없습니다
                  </p>
                )}
              </div>

              {/* 통계 요약 */}
              {heatmapData && (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">통계 요약</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">총 클릭 수</span>
                      <span className="text-sm font-bold text-indigo-600">
                        {heatmapData.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">클릭 영역 수</span>
                      <span className="text-sm font-bold text-purple-600">
                        {heatmapData.points.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">요소 종류</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {heatmapData.elements.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
