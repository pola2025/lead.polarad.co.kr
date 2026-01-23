"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import FormFieldsEditor from "@/components/FormFieldsEditor";
import { ArrowLeft, Save, Upload, X, Key, ExternalLink, Copy, Check, Send } from "lucide-react";
import Link from "next/link";
import type { Client, FormField, ProductFeature } from "@/types";
import { DEFAULT_FORM_FIELDS } from "@/types";
import { Plus, Trash2, GripVertical, Clock } from "lucide-react";
import { formatOperatingHours } from "@/lib/operating-hours";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sendingPassword, setSendingPassword] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>(DEFAULT_FORM_FIELDS);
  const [productFeatures, setProductFeatures] = useState<ProductFeature[]>([]);

  const [formData, setFormData] = useState<Omit<Client, "id" | "createdAt">>({
    name: "",
    slug: "",
    status: "pending",
    kakaoClientId: "",
    kakaoClientSecret: "",
    telegramChatId: "",
    slackChannelId: "",
    landingTitle: "",
    landingDescription: "",
    primaryColor: "#3b82f6",
    logoUrl: "",
    contractStart: "",
    contractEnd: "",
    ctaButtonText: "",
    thankYouTitle: "",
    thankYouMessage: "",
    // 고객 알림 설정
    smsEnabled: false,
    smsTemplate: "",
    emailEnabled: false,
    emailSubject: "",
    emailTemplate: "",
    // NCP SENS 설정
    ncpAccessKey: "",
    ncpSecretKey: "",
    ncpServiceId: "",
    ncpSenderPhone: "",
    // 운영시간 설정
    operatingDays: "weekdays",
    operatingStartTime: "09:00",
    operatingEndTime: "18:00",
    // 에어테이블 공유 URL
    airtableShareUrl: "",
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sendPasswordToSlack = async () => {
    if (!confirm("새 비밀번호를 생성하여 슬랙으로 전송하시겠습니까?")) {
      return;
    }

    setSendingPassword(true);
    setPasswordSent(false);
    try {
      const res = await fetch(`/api/portal/generate-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: formData.slug }),
      });

      const data = await res.json();
      if (data.success) {
        setPasswordSent(true);
        setTimeout(() => setPasswordSent(false), 5000);
      } else {
        setError(data.error || "비밀번호 전송에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("비밀번호 전송 중 오류가 발생했습니다.");
    } finally {
      setSendingPassword(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();

      if (!data.success) {
        setError("클라이언트를 찾을 수 없습니다.");
        return;
      }

      const client = data.data;
      setFormData({
        name: client.name || "",
        slug: client.slug || "",
        status: client.status || "pending",
        kakaoClientId: client.kakaoClientId || "",
        kakaoClientSecret: client.kakaoClientSecret || "",
        telegramChatId: client.telegramChatId || "",
        slackChannelId: client.slackChannelId || "",
        landingTitle: client.landingTitle || "",
        landingDescription: client.landingDescription || "",
        primaryColor: client.primaryColor || "#3b82f6",
        logoUrl: client.logoUrl || "",
        contractStart: client.contractStart?.split("T")[0] || "",
        contractEnd: client.contractEnd?.split("T")[0] || "",
        ctaButtonText: client.ctaButtonText || "",
        thankYouTitle: client.thankYouTitle || "",
        thankYouMessage: client.thankYouMessage || "",
        // 고객 알림 설정
        smsEnabled: client.smsEnabled || false,
        smsTemplate: client.smsTemplate || "",
        emailEnabled: client.emailEnabled || false,
        emailSubject: client.emailSubject || "",
        emailTemplate: client.emailTemplate || "",
        // NCP SENS 설정
        ncpAccessKey: client.ncpAccessKey || "",
        ncpSecretKey: client.ncpSecretKey || "",
        ncpServiceId: client.ncpServiceId || "",
        ncpSenderPhone: client.ncpSenderPhone || "",
        // 운영시간 설정
        operatingDays: client.operatingDays || "weekdays",
        operatingStartTime: client.operatingStartTime || "09:00",
        operatingEndTime: client.operatingEndTime || "18:00",
        // 에어테이블 공유 URL
        airtableShareUrl: client.airtableShareUrl || "",
      });

      // 폼 필드 로드
      setFormFields(client.formFields || DEFAULT_FORM_FIELDS);
      // 상품 특징 로드
      setProductFeatures(client.productFeatures || []);
    } catch (err) {
      console.error(err);
      setError("클라이언트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      } else {
        setError(data.error || "로고 업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("로고 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, formFields, productFeatures }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "수정에 실패했습니다.");
        return;
      }

      router.push("/clients");
    } catch (err) {
      console.error(err);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            클라이언트 목록
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">클라이언트 수정</h1>
          <p className="mt-1 text-sm text-gray-500">{formData.name}</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 기본 정보 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  클라이언트명 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 (URL용) *
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">polarlead.kr/</span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    pattern="^[a-z0-9\-]+$"
                    value={formData.slug}
                    onChange={handleChange}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="pending">대기</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
            </div>
          </div>

          {/* 랜딩 페이지 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">랜딩 페이지 설정</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="landingTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  랜딩 페이지 제목
                </label>
                <input
                  type="text"
                  id="landingTitle"
                  name="landingTitle"
                  value={formData.landingTitle}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="landingDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  랜딩 페이지 설명
                </label>
                <textarea
                  id="landingDescription"
                  name="landingDescription"
                  value={formData.landingDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드 컬러
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    로고
                  </label>
                  <div className="flex items-start gap-4">
                    {formData.logoUrl ? (
                      <div className="relative">
                        <img
                          src={formData.logoUrl}
                          alt="로고"
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, logoUrl: "" }))}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Upload className="h-4 w-4" />
                        {uploading ? "업로드 중..." : "로고 업로드"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF (최대 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 상품 특징/혜택 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">서비스 특징</h2>
            <p className="text-sm text-gray-500 mb-4">
              랜딩 페이지에 표시될 서비스 특징/혜택을 설정합니다.
            </p>

            <div className="space-y-3">
              {productFeatures.map((feature, index) => (
                <div key={feature.id} className="flex items-center gap-3 group">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <input
                    type="text"
                    value={feature.icon || "✓"}
                    onChange={(e) => {
                      const updated = [...productFeatures];
                      updated[index] = { ...feature, icon: e.target.value };
                      setProductFeatures(updated);
                    }}
                    className="w-12 text-center rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="✓"
                  />
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => {
                      const updated = [...productFeatures];
                      updated[index] = { ...feature, text: e.target.value };
                      setProductFeatures(updated);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="특징 내용 입력"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProductFeatures(productFeatures.filter((_, i) => i !== index));
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {productFeatures.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  등록된 특징이 없습니다. 아래 버튼으로 추가하세요.
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setProductFeatures([
                    ...productFeatures,
                    { id: `feat-${Date.now()}`, icon: "✓", text: "" },
                  ]);
                }}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                특징 추가
              </button>
            </div>
          </div>

          {/* 응답 메시지 커스터마이징 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">응답 메시지 설정</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="ctaButtonText" className="block text-sm font-medium text-gray-700 mb-1">
                  CTA 버튼 텍스트
                </label>
                <input
                  type="text"
                  id="ctaButtonText"
                  name="ctaButtonText"
                  value={formData.ctaButtonText}
                  onChange={handleChange}
                  placeholder="상담 신청하기"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="thankYouTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  완료 페이지 제목
                </label>
                <input
                  type="text"
                  id="thankYouTitle"
                  name="thankYouTitle"
                  value={formData.thankYouTitle}
                  onChange={handleChange}
                  placeholder="신청이 완료되었습니다"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="thankYouMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  완료 페이지 메시지
                </label>
                <textarea
                  id="thankYouMessage"
                  name="thankYouMessage"
                  value={formData.thankYouMessage}
                  onChange={handleChange}
                  rows={3}
                  placeholder="빠른 시일 내에 연락드리겠습니다. 감사합니다!"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* 폼 필드 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">폼 필드 설정</h2>
            <p className="text-sm text-gray-500 mb-4">
              랜딩 페이지에서 수집할 정보를 설정합니다. 필드를 추가/제거하고 순서를 변경할 수 있습니다.
            </p>
            <FormFieldsEditor fields={formFields} onChange={setFormFields} />
          </div>

          {/* 카카오 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">카카오 로그인 설정</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="kakaoClientId" className="block text-sm font-medium text-gray-700 mb-1">
                  카카오 REST API 키
                </label>
                <input
                  type="text"
                  id="kakaoClientId"
                  name="kakaoClientId"
                  value={formData.kakaoClientId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="kakaoClientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                  카카오 Client Secret
                </label>
                <input
                  type="password"
                  id="kakaoClientSecret"
                  name="kakaoClientSecret"
                  value={formData.kakaoClientSecret}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* 슬랙 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">슬랙 알림 설정</h2>

            <div>
              <label htmlFor="slackChannelId" className="block text-sm font-medium text-gray-700 mb-1">
                슬랙 채널 ID
              </label>
              <input
                type="text"
                id="slackChannelId"
                name="slackChannelId"
                value={formData.slackChannelId}
                onChange={handleChange}
                placeholder="C0123456789"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                비밀번호 및 설정 변경 알림이 이 채널로 전송됩니다.
              </p>
            </div>
          </div>

          {/* 텔레그램 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">텔레그램 알림 설정</h2>

            <div>
              <label htmlFor="telegramChatId" className="block text-sm font-medium text-gray-700 mb-1">
                텔레그램 채팅 ID
              </label>
              <input
                type="text"
                id="telegramChatId"
                name="telegramChatId"
                value={formData.telegramChatId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                리드 접수 알림이 이 채널로 전송됩니다.
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="airtableShareUrl" className="block text-sm font-medium text-gray-700 mb-1">
                에어테이블 공유 URL
              </label>
              <input
                type="url"
                id="airtableShareUrl"
                name="airtableShareUrl"
                value={formData.airtableShareUrl}
                onChange={handleChange}
                placeholder="https://airtable.com/appXXX/shrYYY"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                텔레그램 알림에 포함될 에어테이블 공유 링크입니다.
              </p>
            </div>
          </div>

          {/* NCP SENS 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">NCP SENS 설정</h2>
            <p className="text-sm text-gray-500 mb-4">
              SMS 발송을 위한 NCP SENS API 설정입니다. 설정하지 않으면 기본 계정으로 발송됩니다.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ncpAccessKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Access Key
                  </label>
                  <input
                    type="text"
                    id="ncpAccessKey"
                    name="ncpAccessKey"
                    value={formData.ncpAccessKey}
                    onChange={handleChange}
                    placeholder="ncp_iam_BPAMKR..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="ncpSecretKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    id="ncpSecretKey"
                    name="ncpSecretKey"
                    value={formData.ncpSecretKey}
                    onChange={handleChange}
                    placeholder="ncp_iam_BPKMKR..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ncpServiceId" className="block text-sm font-medium text-gray-700 mb-1">
                    Service ID
                  </label>
                  <input
                    type="text"
                    id="ncpServiceId"
                    name="ncpServiceId"
                    value={formData.ncpServiceId}
                    onChange={handleChange}
                    placeholder="ncp:sms:kr:..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="ncpSenderPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    발신번호
                  </label>
                  <input
                    type="text"
                    id="ncpSenderPhone"
                    name="ncpSenderPhone"
                    value={formData.ncpSenderPhone}
                    onChange={handleChange}
                    placeholder="01012345678"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                NCP 콘솔 → Simple & Easy Notification Service → Project에서 확인할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 운영시간 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                운영시간 설정
              </span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              SMS/이메일 알림에 운영시간 안내가 자동으로 추가됩니다.
            </p>

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
                      checked={formData.operatingDays === "weekdays"}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">주중 (월~금)</span>
                    {formData.operatingDays === "weekdays" && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        ⚠️ 공휴일도 휴무입니다
                      </span>
                    )}
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="operatingDays"
                      value="everyday"
                      checked={formData.operatingDays === "everyday"}
                      onChange={handleChange}
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
                    name="operatingStartTime"
                    value={formData.operatingStartTime}
                    onChange={handleChange}
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
                    name="operatingEndTime"
                    value={formData.operatingEndTime}
                    onChange={handleChange}
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
                    operatingDays: formData.operatingDays,
                    operatingStartTime: formData.operatingStartTime,
                    operatingEndTime: formData.operatingEndTime,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* 고객 SMS/이메일 알림 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">고객 SMS/이메일 알림</h2>
            <p className="text-sm text-gray-500 mb-4">
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
                      checked={formData.smsEnabled || false}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, smsEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {formData.smsEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* 왼쪽: 메시지 작성 */}
                    <div>
                      <label htmlFor="smsTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                        SMS 템플릿
                      </label>
                      <textarea
                        id="smsTemplate"
                        name="smsTemplate"
                        value={formData.smsTemplate}
                        onChange={handleChange}
                        rows={5}
                        placeholder="안녕하세요 {name}님, {clientName} 상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        변수: {"{name}"}, {"{clientName}"}, {"{date}"}
                      </p>
                    </div>
                    {/* 오른쪽: 미리보기 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        미리보기
                      </label>
                      <div className="bg-gray-900 rounded-2xl p-4 h-[140px] flex items-center justify-center">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-[200px] shadow-sm">
                          <p className="text-xs text-gray-800 whitespace-pre-wrap">
                            {(formData.smsTemplate || `[${formData.name}] {name}님, 상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. 감사합니다.`)
                              .replace(/\{name\}/g, '홍길동')
                              .replace(/\{clientName\}/g, formData.name || '업체명')
                              .replace(/\{date\}/g, new Date().toLocaleDateString('ko-KR'))}
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
                      checked={formData.emailEnabled || false}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, emailEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {formData.emailEnabled && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    {/* 이메일 미리보기 헤더 */}
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500">이메일 미리보기</span>
                      <a
                        href="/email-preview.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        전체 화면
                      </a>
                    </div>
                    {/* 이메일 미리보기 내용 */}
                    <div className="bg-gray-100 p-4">
                      <div className="bg-white rounded-lg shadow-sm max-w-[320px] mx-auto overflow-hidden">
                        {/* 상단 로고 영역 */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="로고" className="h-6 object-contain" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-400">로고</div>
                          )}
                          <span className="text-xs text-gray-600 font-medium">{formData.landingTitle || formData.name}</span>
                        </div>
                        {/* 헤더 */}
                        <div
                          className="p-4 text-center"
                          style={{ background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.primaryColor}dd 100%)` }}
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-2">
                            <span className="text-white text-lg">✓</span>
                          </div>
                          <p className="text-white font-semibold text-sm">접수 완료</p>
                        </div>
                        {/* 본문 */}
                        <div className="p-4">
                          <p className="text-gray-800 text-sm font-medium mb-2">안녕하세요, 홍길동님!</p>
                          <p className="text-gray-600 text-xs mb-3">
                            상담 신청이 정상적으로 접수되었습니다.<br />
                            빠른 시일 내에 담당자가 연락드리겠습니다.
                          </p>
                          <div className="bg-gray-50 rounded p-2 text-xs">
                            <p className="text-gray-500 mb-1" style={{ color: formData.primaryColor }}>접수 내용</p>
                            <p className="text-gray-700">이름: 홍길동</p>
                            <p className="text-gray-700">연락처: 010-6624-6615</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 계약 정보 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">계약 정보</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contractStart" className="block text-sm font-medium text-gray-700 mb-1">
                  계약 시작일
                </label>
                <input
                  type="date"
                  id="contractStart"
                  name="contractStart"
                  value={formData.contractStart}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="contractEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  계약 종료일
                </label>
                <input
                  type="date"
                  id="contractEnd"
                  name="contractEnd"
                  value={formData.contractEnd}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* 클라이언트 포털 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                클라이언트 포털
              </span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              클라이언트가 직접 랜딩 페이지 설정을 관리할 수 있는 포털입니다.
            </p>

            <div className="space-y-4">
              {/* 포털 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  포털 URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${formData.slug}/login`}
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/portal/${formData.slug}/login`, 'url')}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 transition-colors"
                  >
                    {copiedField === 'url' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <a
                    href={`/portal/${formData.slug}/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </a>
                </div>
              </div>

              {/* 비밀번호 생성 및 슬랙 전송 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  포털 비밀번호
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500">
                    환경변수: <code className="font-mono">lead_{formData.slug}_PW</code>
                  </span>
                  <button
                    type="button"
                    onClick={sendPasswordToSlack}
                    disabled={sendingPassword}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                      passwordSent
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {passwordSent ? (
                      <>
                        <Check className="h-4 w-4" />
                        전송 완료
                      </>
                    ) : sendingPassword ? (
                      <>
                        <Send className="h-4 w-4 animate-pulse" />
                        전송 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        슬랙으로 비밀번호 전송
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  비밀번호 생성 후 슬랙으로 전송됩니다. 환경변수에 추가한 뒤 배포하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4">
            <Link
              href="/clients"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
