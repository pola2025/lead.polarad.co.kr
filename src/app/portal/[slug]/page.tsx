"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  LogOut,
  Eye,
  Settings,
  MessageSquare,
  Bell,
  ExternalLink,
  Clock,
  BarChart3,
  Users,
  MousePointerClick,
  TrendingUp,
  ClipboardList,
  Phone,
  Mail,
  MoreVertical,
  ShieldBan,
} from "lucide-react";
import type { FormField, Lead, LeadStatus } from "@/types";
import { DEFAULT_FORM_FIELDS } from "@/types";

// 상태 레이블 (관리자와 동일)
const statusLabels: Record<LeadStatus, { label: string; class: string }> = {
  kakao_login: { label: "카카오만", class: "bg-yellow-100 text-yellow-800" },
  new: { label: "신규", class: "bg-blue-100 text-blue-800" },
  contacted: { label: "연락완료", class: "bg-purple-100 text-purple-800" },
  converted: { label: "전환", class: "bg-green-100 text-green-800" },
  spam: { label: "스팸", class: "bg-red-100 text-red-800" },
};
import { formatOperatingHours } from "@/lib/operating-hours";
import FormFieldsEditor from "@/components/FormFieldsEditor";

interface AnalyticsData {
  today: { users: number; pageviews: number };
  week: { users: number; pageviews: number };
  month: { users: number; pageviews: number };
  daily: { date: string; users: number; pageviews: number }[];
  sources: { source: string; users: number }[];
}

interface ClientData {
  id: string;
  name: string;
  slug: string;
  landingTitle?: string;
  landingDescription?: string;
  primaryColor?: string;
  logoUrl?: string;
  ctaButtonText?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  formFields: FormField[];
  // SMS/이메일 알림 설정
  smsEnabled?: boolean;
  smsTemplate?: string;
  emailEnabled?: boolean;
  emailSubject?: string;
  emailTemplate?: string;
  // 운영시간 설정
  operatingDays?: 'weekdays' | 'everyday';
  operatingStartTime?: string;
  operatingEndTime?: string;
}

export default function PortalDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "leads" | "fields" | "messages" | "notifications">("stats");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 접수내역 관련 상태
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // 폼 필드 상태
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // 응답 메시지 상태
  const [messages, setMessages] = useState({
    ctaButtonText: "",
    thankYouTitle: "",
    thankYouMessage: "",
  });

  // 알림 설정 상태
  const [notifications, setNotifications] = useState({
    smsEnabled: false,
    smsTemplate: "",
    emailEnabled: false,
    emailSubject: "",
    emailTemplate: "",
  });

  // 운영시간 상태
  const [operatingHours, setOperatingHours] = useState({
    operatingDays: "weekdays" as 'weekdays' | 'everyday',
    operatingStartTime: "09:00",
    operatingEndTime: "18:00",
  });

  // 미리보기 단계 상태 (1: 랜딩, 2: 폼, 3: 완료)
  const [previewStep, setPreviewStep] = useState<1 | 2 | 3>(1);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/${slug}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push(`/portal/${slug}/login`);
          return;
        }
        setError(data.error || "데이터를 불러오는데 실패했습니다.");
        return;
      }

      setClient(data.data);
      setFormFields(data.data.formFields || DEFAULT_FORM_FIELDS);
      setMessages({
        ctaButtonText: data.data.ctaButtonText || "",
        thankYouTitle: data.data.thankYouTitle || "",
        thankYouMessage: data.data.thankYouMessage || "",
      });
      setNotifications({
        smsEnabled: data.data.smsEnabled || false,
        smsTemplate: data.data.smsTemplate || "",
        emailEnabled: data.data.emailEnabled || false,
        emailSubject: data.data.emailSubject || "",
        emailTemplate: data.data.emailTemplate || "",
      });
      setOperatingHours({
        operatingDays: data.data.operatingDays || "weekdays",
        operatingStartTime: data.data.operatingStartTime || "09:00",
        operatingEndTime: data.data.operatingEndTime || "18:00",
      });
    } catch (err) {
      console.error(err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/portal/${slug}/analytics`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [slug]);

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch(`/api/portal/${slug}/leads`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error("Leads fetch error:", err);
    } finally {
      setLeadsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  useEffect(() => {
    if (activeTab === "stats") {
      fetchAnalytics();
    } else if (activeTab === "leads") {
      fetchLeads();
    }
  }, [activeTab, fetchAnalytics, fetchLeads]);

  const handleLogout = async () => {
    try {
      await fetch("/api/portal/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      router.push(`/portal/${slug}/login`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!client) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/portal/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields,
          ctaButtonText: messages.ctaButtonText,
          thankYouTitle: messages.thankYouTitle,
          thankYouMessage: messages.thankYouMessage,
          // 알림 설정
          smsEnabled: notifications.smsEnabled,
          smsTemplate: notifications.smsTemplate,
          emailEnabled: notifications.emailEnabled,
          emailSubject: notifications.emailSubject,
          emailTemplate: notifications.emailTemplate,
          // 운영시간 설정
          operatingDays: operatingHours.operatingDays,
          operatingStartTime: operatingHours.operatingStartTime,
          operatingEndTime: operatingHours.operatingEndTime,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "저장에 실패했습니다.");
        return;
      }

      setSuccess("설정이 저장되었습니다.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 리드 상태 업데이트
  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/portal/${slug}/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
        setOpenMenu(null);
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  // 필터링된 리드 목록
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.kakaoId?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // 활성화된 필드만 정렬해서 반환 (미리보기용)
  const sortedEnabledFields = formFields
    .filter((f) => f.enabled)
    .sort((a, b) => a.order - b.order);

  // 이메일 필드가 활성화되어 있는지 확인 (카카오 로그인 표시용)
  const hasEmailField = sortedEnabledFields.some((f) => f.id === "email" || f.type === "email");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h1>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => router.push(`/portal/${slug}/login`)}
          className="text-primary-600 hover:underline"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{client?.name}</h1>
            <p className="text-sm text-gray-500">랜딩 페이지 설정</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              미리보기
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* 알림 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* 탭 제목 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "stats" && "방문 통계"}
            {activeTab === "leads" && "접수내역 관리"}
            {activeTab === "fields" && "수집 정보 설정"}
            {activeTab === "messages" && "응답 메시지 설정"}
            {activeTab === "notifications" && "고객 알림 설정"}
          </h2>
        </div>

        {/* 방문 통계 */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : analytics ? (
              <>
                {/* 요약 카드 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-500">오늘 방문자</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.today.users.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">페이지뷰 {analytics.today.pageviews.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-500">7일간</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.week.users.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">페이지뷰 {analytics.week.pageviews.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <MousePointerClick className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-500">30일간</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.month.users.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">페이지뷰 {analytics.month.pageviews.toLocaleString()}</p>
                  </div>
                </div>

                {/* 일별 추이 차트 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">일별 방문자 추이 (30일)</h3>
                  <div className="h-48 flex items-end gap-1">
                    {analytics.daily.length > 0 ? (
                      analytics.daily.slice(-30).map((day, idx) => {
                        const maxUsers = Math.max(...analytics.daily.map(d => d.users), 1);
                        const height = (day.users / maxUsers) * 100;
                        const date = day.date;
                        const formattedDate = date ? `${date.slice(4, 6)}/${date.slice(6, 8)}` : "";
                        return (
                          <div
                            key={idx}
                            className="flex-1 group relative"
                          >
                            <div
                              className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                              style={{ height: `${Math.max(height, 2)}%` }}
                            />
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                              {formattedDate}: {day.users}명
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        데이터가 없습니다
                      </div>
                    )}
                  </div>
                </div>

                {/* 유입 경로 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">유입 경로 TOP 5</h3>
                  {analytics.sources.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.sources.map((source, idx) => {
                        const maxUsers = analytics.sources[0]?.users || 1;
                        const width = (source.users / maxUsers) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 text-sm text-gray-400">{idx + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                  {source.source === "(direct) / (none)" ? "직접 방문" : source.source}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{source.users}명</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${width}%` }}
                                />
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
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">통계 데이터를 불러올 수 없습니다.</p>
                <button
                  onClick={fetchAnalytics}
                  className="mt-4 text-sm text-primary-600 hover:underline"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        )}

        {/* 접수내역 관리 */}
        {activeTab === "leads" && (
          <div className="space-y-4 pb-20">
            {/* 검색 및 필터 */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="이름, 전화번호, 이메일, 카카오ID 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">전체 상태</option>
                <option value="kakao_login">카카오만 (미접수)</option>
                <option value="new">신규</option>
                <option value="contacted">연락완료</option>
                <option value="converted">전환</option>
                <option value="spam">스팸</option>
              </select>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-yellow-700">{leads.filter(l => l.status === "kakao_login").length}</p>
                <p className="text-xs text-yellow-600">카카오만</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-700">{leads.filter(l => l.status === "new").length}</p>
                <p className="text-xs text-blue-600">신규</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-700">{leads.filter(l => l.status === "contacted").length}</p>
                <p className="text-xs text-purple-600">연락완료</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-700">{leads.filter(l => l.status === "converted").length}</p>
                <p className="text-xs text-green-600">전환</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-red-700">{leads.filter(l => l.status === "spam").length}</p>
                <p className="text-xs text-red-600">스팸</p>
              </div>
            </div>

            {/* 리드 목록 */}
            {leadsLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">접수내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[lead.status].class}`}>
                            {statusLabels[lead.status].label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(lead.createdAt).toLocaleString("ko-KR")}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {lead.name && (
                            <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                          )}
                          {lead.phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </p>
                          )}
                          {lead.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {lead.email}
                            </p>
                          )}
                          {lead.kakaoId && (
                            <p className="text-xs text-yellow-600">카카오ID: {lead.kakaoId}</p>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === lead.id ? null : lead.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                        {openMenu === lead.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "new")}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              신규로 변경
                            </button>
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "contacted")}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              연락완료로 변경
                            </button>
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "converted")}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              전환으로 변경
                            </button>
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "spam")}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              스팸으로 변경
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 수집 정보 설정 */}
        {activeTab === "fields" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              수집할 정보 선택 및 순서 설정
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              활성화할 필드를 선택하고, 드래그하여 순서를 변경하세요.
            </p>
            <FormFieldsEditor fields={formFields} onChange={setFormFields} />
          </div>
        )}

        {/* 응답 메시지 설정 */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              응답 메시지 설정
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              버튼 텍스트와 신청 완료 후 표시될 메시지를 설정하세요.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  신청 버튼 텍스트
                </label>
                <input
                  type="text"
                  value={messages.ctaButtonText}
                  onChange={(e) =>
                    setMessages({ ...messages, ctaButtonText: e.target.value })
                  }
                  placeholder="상담 신청하기"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  완료 페이지 제목
                </label>
                <input
                  type="text"
                  value={messages.thankYouTitle}
                  onChange={(e) =>
                    setMessages({ ...messages, thankYouTitle: e.target.value })
                  }
                  placeholder="신청이 완료되었습니다"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  완료 페이지 메시지
                </label>
                <textarea
                  value={messages.thankYouMessage}
                  onChange={(e) =>
                    setMessages({ ...messages, thankYouMessage: e.target.value })
                  }
                  placeholder="빠른 시일 내에 연락드리겠습니다. 감사합니다!"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 고객 알림 설정 */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              고객 SMS/이메일 알림
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              리드 접수 시 고객에게 자동으로 SMS 또는 이메일을 발송합니다.
            </p>

            <div className="space-y-6">
              {/* SMS 설정 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">SMS 알림</h3>
                    <p className="text-xs text-gray-500">리드 접수 시 고객에게 확인 SMS 발송</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.smsEnabled}
                      onChange={(e) =>
                        setNotifications({ ...notifications, smsEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {notifications.smsEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMS 템플릿
                      </label>
                      <textarea
                        value={notifications.smsTemplate}
                        onChange={(e) =>
                          setNotifications({ ...notifications, smsTemplate: e.target.value })
                        }
                        rows={5}
                        placeholder={`[${client?.name || '업체명'}] {name}님, 상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. 감사합니다.`}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        변수: {"{name}"}, {"{clientName}"}, {"{date}"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        미리보기
                      </label>
                      <div className="bg-gray-900 rounded-2xl p-4 h-[180px] flex items-center justify-center">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-[220px] shadow-sm">
                          <p className="text-xs text-gray-800 whitespace-pre-wrap">
                            {(notifications.smsTemplate || `[${client?.name || '업체명'}] {name}님, 상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. 감사합니다.`)
                              .replace(/\{name\}/g, '홍길동')
                              .replace(/\{clientName\}/g, client?.name || '업체명')
                              .replace(/\{date\}/g, new Date().toLocaleDateString('ko-KR'))}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 whitespace-pre-line">
                            {`[운영시간]\n${operatingHours.operatingStartTime}~${operatingHours.operatingEndTime}${operatingHours.operatingDays === 'weekdays' ? '(토/공휴일 휴무)' : '(연중무휴)'}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 이메일 설정 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">이메일 알림</h3>
                    <p className="text-xs text-gray-500">리드 접수 시 고객에게 확인 이메일 발송</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailEnabled}
                      onChange={(e) =>
                        setNotifications({ ...notifications, emailEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {notifications.emailEnabled && (
                  <div className="space-y-4">
                    {/* 이메일 안내 문구 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일 안내 문구
                      </label>
                      <textarea
                        value={notifications.emailTemplate}
                        onChange={(e) =>
                          setNotifications({ ...notifications, emailTemplate: e.target.value })
                        }
                        rows={3}
                        placeholder="상담 신청이 정상적으로 접수되었습니다. 빠른 시일 내에 담당자가 연락드리겠습니다."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        이메일 본문에 표시될 안내 문구입니다.
                      </p>
                    </div>

                    {/* 이메일 미리보기 */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500">이메일 미리보기</span>
                      </div>
                      <div className="bg-gray-100 p-4">
                        <div className="bg-white rounded-lg shadow-sm max-w-[320px] mx-auto overflow-hidden">
                          {/* 상단 로고 영역 */}
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            {client?.logoUrl ? (
                              <img src={client.logoUrl} alt="로고" className="h-6 object-contain" />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-400">로고</div>
                            )}
                            <span className="text-xs text-gray-600 font-medium">{client?.landingTitle || client?.name}</span>
                          </div>
                          {/* 헤더 */}
                          <div
                            className="p-4 text-center"
                            style={{ background: `linear-gradient(135deg, ${client?.primaryColor || '#3b82f6'} 0%, ${client?.primaryColor || '#3b82f6'}dd 100%)` }}
                          >
                            <div className="w-10 h-10 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-2">
                              <span className="text-white text-xl">✓</span>
                            </div>
                            <p className="text-white font-semibold text-sm">접수 완료</p>
                          </div>
                          {/* 본문 */}
                          <div className="p-4">
                            <p className="text-gray-800 text-sm font-medium mb-2">안녕하세요, 홍길동님!</p>
                            <p className="text-gray-600 text-xs mb-3 whitespace-pre-line">
                              {notifications.emailTemplate || "상담 신청이 정상적으로 접수되었습니다.\n빠른 시일 내에 담당자가 연락드리겠습니다."}
                            </p>
                            <div className="bg-gray-50 rounded p-2 text-xs mb-2">
                              <p className="text-gray-500 mb-1" style={{ color: client?.primaryColor || '#3b82f6' }}>접수 내용</p>
                              <p className="text-gray-700">이름: 홍길동</p>
                              <p className="text-gray-700">연락처: 010-6624-6615</p>
                            </div>
                            <div className="bg-blue-50 rounded p-2 text-xs">
                              <p className="text-blue-600 font-medium mb-0.5">📞 운영시간</p>
                              <p className="text-blue-700">
                                {`${operatingHours.operatingStartTime}~${operatingHours.operatingEndTime}${operatingHours.operatingDays === 'weekdays' ? '(토/공휴일 휴무)' : '(연중무휴)'}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 운영시간 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">운영시간 설정</h3>
                    <p className="text-xs text-gray-500">SMS/이메일 알림에 운영시간 안내가 자동으로 추가됩니다.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 운영요일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      운영요일
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="operatingDays"
                          value="weekdays"
                          checked={operatingHours.operatingDays === "weekdays"}
                          onChange={(e) =>
                            setOperatingHours({ ...operatingHours, operatingDays: e.target.value as 'weekdays' | 'everyday' })
                          }
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">주중 (월~금)</span>
                        {operatingHours.operatingDays === "weekdays" && (
                          <span className="text-xs text-amber-600">⚠️ 공휴일도 휴무입니다</span>
                        )}
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="operatingDays"
                          value="everyday"
                          checked={operatingHours.operatingDays === "everyday"}
                          onChange={(e) =>
                            setOperatingHours({ ...operatingHours, operatingDays: e.target.value as 'weekdays' | 'everyday' })
                          }
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">연중무휴 (휴무없음)</span>
                      </label>
                    </div>
                  </div>

                  {/* 운영시간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      운영시간
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={operatingHours.operatingStartTime}
                        onChange={(e) =>
                          setOperatingHours({ ...operatingHours, operatingStartTime: e.target.value })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <option key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-gray-500">~</span>
                      <select
                        value={operatingHours.operatingEndTime}
                        onChange={(e) =>
                          setOperatingHours({ ...operatingHours, operatingEndTime: e.target.value })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <option key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* 미리보기 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      미리보기
                    </label>
                    <p className="text-sm text-gray-800">
                      {formatOperatingHours({
                        operatingDays: operatingHours.operatingDays,
                        operatingStartTime: operatingHours.operatingStartTime,
                        operatingEndTime: operatingHours.operatingEndTime,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </main>

      {/* 미리보기 모달 - 3단계 고객 여정 시뮬레이션 */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">고객 여정 시뮬레이션</h3>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewStep(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* 3단계 탭 네비게이션 */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setPreviewStep(step as 1 | 2 | 3)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      previewStep === step
                        ? "bg-primary-600 text-white"
                        : previewStep > step
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        previewStep === step
                          ? "bg-white text-primary-600"
                          : previewStep > step
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-white"
                      }`}
                    >
                      {previewStep > step ? "✓" : step}
                    </span>
                    {step === 1 && "랜딩"}
                    {step === 2 && "폼 작성"}
                    {step === 3 && "완료"}
                  </button>
                ))}
              </div>
            </div>

            {/* 미리보기 내용 - Step 1: 랜딩 화면 */}
            {previewStep === 1 && (
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white min-h-[400px] flex flex-col">
                {/* 로고 */}
                {client?.logoUrl ? (
                  <div className="flex justify-center mb-8">
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="h-16 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      로고
                    </div>
                  </div>
                )}

                {/* 제목 */}
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  {client?.landingTitle || client?.name || "랜딩 페이지 제목"}
                </h1>

                {/* 설명 */}
                <p className="text-gray-600 text-center mb-8 text-sm whitespace-pre-line flex-1">
                  {client?.landingDescription || "랜딩 페이지 설명이 여기에 표시됩니다."}
                </p>

                {/* 카카오 로그인 버튼 - 이메일 필드가 있을 때 */}
                {hasEmailField ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setPreviewStep(2)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: "#FEE500", color: "#000000" }}
                    >
                      <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#000000" d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.03 5.995.849 12.168 1.28 18.472 1.28 57.438 0 104-36.713 104-82 0-45.287-46.562-82-104-82z"/>
                      </svg>
                      카카오로 시작하기
                    </button>
                    <p className="text-base text-gray-600 text-center">카카오 <span className="font-semibold text-gray-800">로그인 후 상담접수</span>가 가능합니다.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setPreviewStep(2)}
                    className="w-full rounded-xl px-4 py-4 text-base font-medium text-white shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: client?.primaryColor || "#3b82f6" }}
                  >
                    {messages.ctaButtonText || "상담 신청하기"} →
                  </button>
                )}
              </div>
            )}

            {/* 미리보기 내용 - Step 2: 폼 작성 화면 */}
            {previewStep === 2 && (
              <div className="p-6 bg-gray-50">
                {/* 상단 로고 (작게) */}
                {client?.logoUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="h-8 object-contain"
                    />
                  </div>
                )}

                {/* 폼 */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                  {sortedEnabledFields.length === 0 ? (
                    <p className="text-gray-400 text-center py-8 text-sm">
                      활성화된 필드가 없습니다.
                      <br />
                      수집 정보 설정에서 필드를 추가하세요.
                    </p>
                  ) : (
                    sortedEnabledFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    ))
                  )}

                  {/* 개인정보 이용동의 */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        <span className="text-blue-600 underline">개인정보 이용약관</span>에 동의합니다. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => setPreviewStep(3)}
                    className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white mt-2"
                    style={{ backgroundColor: client?.primaryColor || "#3b82f6" }}
                  >
                    {messages.ctaButtonText || "상담 신청하기"}
                  </button>

                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <p>본 접수정보는 상담접수에만 이용되며 상담 후 폐기됩니다.</p>
                    <p>카카오 로그인은 친구추가, 채널추가, 메세지발송에 활용되지 않으며, 접수자 인증목적으로만 사용됩니다.</p>
                  </div>
                </div>

                {/* 뒤로 가기 */}
                <button
                  onClick={() => setPreviewStep(1)}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
                >
                  ← 처음으로
                </button>
              </div>
            )}

            {/* 미리보기 내용 - Step 3: 완료 화면 */}
            {previewStep === 3 && (
              <div className="p-6 bg-gradient-to-b from-green-50 to-white min-h-[400px] flex flex-col items-center justify-center text-center">
                {/* 체크 아이콘 */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${client?.primaryColor || "#3b82f6"}20` }}
                >
                  <svg
                    className="w-10 h-10"
                    style={{ color: client?.primaryColor || "#3b82f6" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* 완료 제목 */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {messages.thankYouTitle || "신청이 완료되었습니다"}
                </h2>

                {/* 완료 메시지 */}
                <p className="text-gray-600 mb-8 whitespace-pre-line">
                  {messages.thankYouMessage ||
                    "빠른 시일 내에 연락드리겠습니다.\n감사합니다!"}
                </p>

                {/* 처음으로 버튼 */}
                <button
                  onClick={() => setPreviewStep(1)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  처음으로 돌아가기
                </button>
              </div>
            )}

            {/* 실제 랜딩 페이지 링크 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <a
                href={`/l/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-primary-600 hover:underline"
              >
                실제 랜딩 페이지에서 보기 →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === "stats"
                ? "text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            통계
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === "leads"
                ? "text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            접수내역
          </button>
          <button
            onClick={() => setActiveTab("fields")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === "fields"
                ? "text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="h-5 w-5" />
            수집정보
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === "messages"
                ? "text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            메시지
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === "notifications"
                ? "text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell className="h-5 w-5" />
            알림
          </button>
        </div>
      </nav>
    </div>
  );
}
