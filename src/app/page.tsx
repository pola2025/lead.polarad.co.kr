"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import type { Lead, Client } from "@/types";

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalLeads: number;
  monthlyLeads: number;
  lastMonthLeads: number;
  conversionRate: number;
  blacklistCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [leadsRes, clientsRes, blacklistRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/clients"),
        fetch("/api/blacklist"),
      ]);

      const leadsData = await leadsRes.json();
      const clientsData = await clientsRes.json();
      const blacklistData = await blacklistRes.json();

      if (leadsData.success && clientsData.success && blacklistData.success) {
        const leads: Lead[] = leadsData.data;
        const clients: Client[] = clientsData.data;
        const blacklist = blacklistData.data;

        // 통계 계산
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const monthlyLeads = leads.filter(
          (l) => new Date(l.createdAt) >= thisMonthStart
        ).length;

        const lastMonthLeads = leads.filter(
          (l) =>
            new Date(l.createdAt) >= lastMonthStart &&
            new Date(l.createdAt) <= lastMonthEnd
        ).length;

        const convertedLeads = leads.filter((l) => l.status === "converted").length;
        const validLeads = leads.filter((l) => l.status !== "blacklist").length;
        const conversionRate = validLeads > 0 ? (convertedLeads / validLeads) * 100 : 0;

        setStats({
          totalClients: clients.length,
          activeClients: clients.filter((c) => c.status === "active").length,
          totalLeads: leads.length,
          monthlyLeads,
          lastMonthLeads,
          conversionRate,
          blacklistCount: blacklist.length,
        });

        // 최근 리드 5개
        setRecentLeads(leads.slice(0, 5));

        // 활성 클라이언트
        setActiveClients(clients.filter((c) => c.status === "active").slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthChange = stats
    ? stats.lastMonthLeads > 0
      ? ((stats.monthlyLeads - stats.lastMonthLeads) / stats.lastMonthLeads) * 100
      : stats.monthlyLeads > 0
      ? 100
      : 0
    : 0;

  const statCards = stats
    ? [
        {
          name: "전체 클라이언트",
          value: stats.totalClients.toString(),
          subValue: `${stats.activeClients}개 활성`,
          icon: Users,
          color: "bg-blue-500",
        },
        {
          name: "이번 달 리드",
          value: stats.monthlyLeads.toString(),
          change: monthChange,
          icon: FileText,
          color: "bg-green-500",
        },
        {
          name: "전환율",
          value: `${stats.conversionRate.toFixed(1)}%`,
          subValue: `전체 ${stats.totalLeads}건 중`,
          icon: TrendingUp,
          color: "bg-purple-500",
        },
        {
          name: "블랙리스트",
          value: stats.blacklistCount.toString(),
          subValue: "차단된 항목",
          icon: AlertTriangle,
          color: "bg-red-500",
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-keep">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500 break-keep">
            polarlead 리드 관리 현황을 확인하세요.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="card">
                    <div className="flex items-start md:items-center">
                      <div
                        className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg flex-shrink-0 ${stat.color}`}
                      >
                        <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="ml-3 md:ml-4 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-500 break-keep">
                          {stat.name}
                        </p>
                        <p className="text-lg md:text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-4 text-xs md:text-sm">
                      {stat.change !== undefined ? (
                        <div className="flex items-center flex-wrap">
                          {stat.change >= 0 ? (
                            <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                          )}
                          <span
                            className={
                              stat.change >= 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {Math.abs(stat.change).toFixed(1)}%
                          </span>
                          <span className="ml-1 text-gray-500 hidden md:inline">vs 지난 달</span>
                        </div>
                      ) : stat.subValue ? (
                        <span className="text-gray-500 break-keep">{stat.subValue}</span>
                      ) : (
                        <span className="text-gray-400">데이터 없음</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 최근 리드 섹션 */}
            <div className="mt-6 md:mt-8">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 break-keep">
                  최근 접수된 리드
                </h2>
                <Link
                  href="/leads"
                  className="text-sm text-primary-600 hover:text-primary-700 break-keep"
                >
                  전체 보기 →
                </Link>
              </div>
              <div className="card">
                {recentLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mb-4 text-gray-300" />
                    <p>아직 접수된 리드가 없습니다.</p>
                    <p className="text-sm mt-1">
                      클라이언트를 등록하고 리드 수집을 시작하세요.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            이름
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            연락처
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            상태
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            접수일
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {lead.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {lead.phone}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`badge ${
                                  lead.status === "new"
                                    ? "badge-new"
                                    : lead.status === "contacted"
                                    ? "badge-contacted"
                                    : lead.status === "converted"
                                    ? "badge-converted"
                                    : "badge-blacklist"
                                }`}
                              >
                                {lead.status === "new"
                                  ? "신규"
                                  : lead.status === "contacted"
                                  ? "연락완료"
                                  : lead.status === "converted"
                                  ? "전환"
                                  : "블랙리스트"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(lead.createdAt).toLocaleDateString("ko-KR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* 활성 클라이언트 섹션 */}
            <div className="mt-6 md:mt-8">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 break-keep">
                  활성 클라이언트
                </h2>
                <Link
                  href="/clients"
                  className="text-sm text-primary-600 hover:text-primary-700 break-keep"
                >
                  전체 보기 →
                </Link>
              </div>
              <div className="card">
                {activeClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mb-4 text-gray-300" />
                    <p>등록된 클라이언트가 없습니다.</p>
                    <Link
                      href="/clients/new"
                      className="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                    >
                      클라이언트 등록하기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {client.logoUrl ? (
                          <img
                            src={client.logoUrl}
                            alt={client.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-medium"
                            style={{
                              backgroundColor: client.primaryColor || "#3b82f6",
                            }}
                          >
                            {client.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {client.landingTitle || client.slug}
                          </p>
                        </div>
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://polarlead.mkt9834.workers.dev/${client.slug}`, '_blank');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
