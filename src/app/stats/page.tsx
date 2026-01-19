"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { Lead, Client } from "@/types";

interface Stats {
  totalLeads: number;
  thisMonthLeads: number;
  lastMonthLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  spamLeads: number;
  conversionRate: number;
  leadsByClient: { clientId: string; clientName: string; count: number }[];
  leadsByDate: { date: string; count: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [leadsRes, clientsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/clients"),
      ]);

      const leadsData = await leadsRes.json();
      const clientsData = await clientsRes.json();

      if (leadsData.success && clientsData.success) {
        const leads: Lead[] = leadsData.data;
        const clients: Client[] = clientsData.data;

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthLeads = leads.filter(
          (l) => new Date(l.createdAt) >= thisMonthStart
        );
        const lastMonthLeads = leads.filter(
          (l) =>
            new Date(l.createdAt) >= lastMonthStart &&
            new Date(l.createdAt) <= lastMonthEnd
        );

        // 상태별 카운트
        const newLeads = leads.filter((l) => l.status === "new").length;
        const contactedLeads = leads.filter((l) => l.status === "contacted").length;
        const convertedLeads = leads.filter((l) => l.status === "converted").length;
        const spamLeads = leads.filter((l) => l.status === "spam").length;

        // 전환율
        const validLeads = leads.filter((l) => l.status !== "spam").length;
        const conversionRate = validLeads > 0 ? (convertedLeads / validLeads) * 100 : 0;

        // 클라이언트별 카운트
        const leadsByClientMap = new Map<string, number>();
        leads.forEach((l) => {
          leadsByClientMap.set(l.clientId, (leadsByClientMap.get(l.clientId) || 0) + 1);
        });
        const leadsByClient = Array.from(leadsByClientMap.entries()).map(
          ([clientId, count]) => ({
            clientId,
            clientName: clients.find((c) => c.id === clientId)?.name || "알 수 없음",
            count,
          })
        );

        // 일별 카운트 (최근 30일)
        const leadsByDateMap = new Map<string, number>();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        leads
          .filter((l) => new Date(l.createdAt) >= thirtyDaysAgo)
          .forEach((l) => {
            const date = new Date(l.createdAt).toISOString().split("T")[0];
            leadsByDateMap.set(date, (leadsByDateMap.get(date) || 0) + 1);
          });

        // 최근 30일 날짜 채우기
        const leadsByDate: { date: string; count: number }[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          leadsByDate.push({
            date: dateStr,
            count: leadsByDateMap.get(dateStr) || 0,
          });
        }

        setStats({
          totalLeads: leads.length,
          thisMonthLeads: thisMonthLeads.length,
          lastMonthLeads: lastMonthLeads.length,
          newLeads,
          contactedLeads,
          convertedLeads,
          spamLeads,
          conversionRate,
          leadsByClient: leadsByClient.sort((a, b) => b.count - a.count),
          leadsByDate,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthChange = stats
    ? stats.lastMonthLeads > 0
      ? ((stats.thisMonthLeads - stats.lastMonthLeads) / stats.lastMonthLeads) * 100
      : stats.thisMonthLeads > 0
      ? 100
      : 0
    : 0;

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">통계</h1>
            <p className="mt-1 text-sm text-gray-500">
              리드 접수 현황과 전환율을 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
              <option value="year">올해</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : stats ? (
          <>
            {/* 주요 통계 카드 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">전체 리드</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalLeads.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">이번 달 리드</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.thisMonthLeads.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {monthChange >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={monthChange >= 0 ? "text-green-600" : "text-red-600"}
                  >
                    {Math.abs(monthChange).toFixed(1)}%
                  </span>
                  <span className="ml-1 text-gray-500">vs 지난 달</span>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">전환율</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {stats.convertedLeads}명 전환 / {stats.totalLeads - stats.spamLeads}명
                  유효
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">상태별 현황</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="badge badge-new mr-2">신규</span>
                        {stats.newLeads}
                      </p>
                      <p>
                        <span className="badge badge-contacted mr-2">연락완료</span>
                        {stats.contactedLeads}
                      </p>
                      <p>
                        <span className="badge badge-converted mr-2">전환</span>
                        {stats.convertedLeads}
                      </p>
                      <p>
                        <span className="badge badge-spam mr-2">스팸</span>
                        {stats.spamLeads}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 일별 추이 */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  일별 접수 추이 (최근 30일)
                </h3>
                <div className="h-64 flex items-end gap-1">
                  {stats.leadsByDate.map((d, i) => {
                    const maxCount = Math.max(...stats.leadsByDate.map((x) => x.count));
                    const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={d.date}
                        className="flex-1 group relative"
                        title={`${d.date}: ${d.count}건`}
                      >
                        <div
                          className="bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        {i % 7 === 0 && (
                          <p className="text-[10px] text-gray-400 mt-1 truncate">
                            {d.date.slice(5)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 클라이언트별 현황 */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  클라이언트별 리드
                </h3>
                {stats.leadsByClient.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">데이터 없음</p>
                ) : (
                  <div className="space-y-3">
                    {stats.leadsByClient.slice(0, 5).map((item) => {
                      const percentage =
                        stats.totalLeads > 0
                          ? (item.count / stats.totalLeads) * 100
                          : 0;
                      return (
                        <div key={item.clientId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">
                              {item.clientName}
                            </span>
                            <span className="text-gray-500">{item.count}건</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-12 text-gray-500">
            통계 데이터를 불러올 수 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
