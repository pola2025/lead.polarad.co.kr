"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import type { Lead, Client } from "@/types";

interface Stats {
  totalLeads: number;
  thisMonthLeads: number;
  lastMonthLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  blacklistLeads: number;
  conversionRate: number;
  leadsByClient: { clientId: string; clientName: string; count: number }[];
  leadsByDate: { date: string; count: number }[];
}

// KST 기준 날짜 문자열 생성 (YYYY-MM-DD 형식)
function formatDateKST(date: Date): string {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
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
        const blacklistLeads = leads.filter((l) => l.status === "blacklist").length;

        // 전환율
        const validLeads = leads.filter((l) => l.status !== "blacklist").length;
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

        // 일별 카운트 (최근 30일) - KST 기준으로 날짜 비교
        const leadsByDateMap = new Map<string, number>();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        leads
          .filter((l) => new Date(l.createdAt) >= thirtyDaysAgo)
          .forEach((l) => {
            // KST 기준으로 날짜 변환
            const dateKST = formatDateKST(new Date(l.createdAt));
            leadsByDateMap.set(dateKST, (leadsByDateMap.get(dateKST) || 0) + 1);
          });

        // 최근 30일 날짜 채우기 - KST 기준
        const leadsByDate: { date: string; count: number }[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = formatDateKST(d);
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
          blacklistLeads,
          conversionRate,
          leadsByClient: leadsByClient.sort((a, b) => b.count - a.count),
          leadsByDate,
        });
        setClients(clients);
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

      <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-keep">통계</h1>
            <p className="mt-1 text-sm text-gray-500 break-keep">
              리드 접수 현황과 전환율을 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")}
              className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 mb-6 md:mb-8">
              <div className="card">
                <div className="flex items-start md:items-center">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-blue-500 flex-shrink-0">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-500 break-keep">전체 리드</p>
                    <p className="text-lg md:text-2xl font-semibold text-gray-900">
                      {stats.totalLeads.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start md:items-center">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-green-500 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-500 break-keep">이번 달</p>
                    <p className="text-lg md:text-2xl font-semibold text-gray-900">
                      {stats.thisMonthLeads.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
                  {monthChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                  )}
                  <span
                    className={monthChange >= 0 ? "text-green-600" : "text-red-600"}
                  >
                    {Math.abs(monthChange).toFixed(1)}%
                  </span>
                  <span className="ml-1 text-gray-500 hidden md:inline">vs 지난 달</span>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start md:items-center">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-purple-500 flex-shrink-0">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-500 break-keep">전환율</p>
                    <p className="text-lg md:text-2xl font-semibold text-gray-900">
                      {stats.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500 break-keep">
                  {stats.convertedLeads}건 / {stats.totalLeads - stats.blacklistLeads}건
                </div>
              </div>

              <div className="card">
                <p className="text-xs md:text-sm font-medium text-gray-500 mb-2 break-keep">상태별 현황</p>
                <div className="grid grid-cols-2 gap-1 text-xs md:text-sm">
                  <p className="flex items-center gap-1">
                    <span className="badge badge-new">신규</span>
                    <span>{stats.newLeads}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="badge badge-contacted">연락</span>
                    <span>{stats.contactedLeads}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="badge badge-converted">전환</span>
                    <span>{stats.convertedLeads}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="badge badge-blacklist">블랙리스트</span>
                    <span>{stats.blacklistLeads}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* 일별 추이 */}
              <div className="card">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 break-keep">
                  일별 접수 추이 (최근 30일)
                </h3>
                <div className="h-48 md:h-64 flex items-end gap-0.5 md:gap-1">
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
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 break-keep">
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
                        <Link
                          key={item.clientId}
                          href={`/clients/${item.clientId}/stats`}
                          className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 hover:text-primary-600">
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
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 클라이언트 통계 바로가기 */}
            <div className="mt-6 md:mt-8">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 break-keep">
                  클라이언트 통계 바로가기
                </h2>
                <Link
                  href="/clients"
                  className="text-sm text-primary-600 hover:text-primary-700 break-keep"
                >
                  전체 보기 →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {clients.length === 0 ? (
                  <div className="col-span-full card flex flex-col items-center justify-center py-8 text-gray-500">
                    <Users className="h-10 w-10 mb-3 text-gray-300" />
                    <p>등록된 클라이언트가 없습니다.</p>
                    <Link
                      href="/clients/new"
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                    >
                      클라이언트 등록하기 →
                    </Link>
                  </div>
                ) : (
                  clients.map((client) => {
                    const leadCount = stats.leadsByClient.find(
                      (l) => l.clientId === client.id
                    )?.count || 0;
                    return (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}/stats`}
                        className="card flex items-center gap-3 hover:border-primary-300 hover:shadow-md transition-all group"
                      >
                        {client.logoUrl ? (
                          <img
                            src={client.logoUrl}
                            alt={client.name}
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-medium flex-shrink-0"
                            style={{
                              backgroundColor: client.primaryColor || "#3b82f6",
                            }}
                          >
                            {client.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            리드 {leadCount}건
                          </p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                      </Link>
                    );
                  })
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
