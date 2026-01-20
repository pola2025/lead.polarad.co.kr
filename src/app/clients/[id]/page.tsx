"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import type { Client } from "@/types";

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

  const [formData, setFormData] = useState<Omit<Client, "id" | "createdAt">>({
    name: "",
    slug: "",
    status: "pending",
    kakaoClientId: "",
    kakaoClientSecret: "",
    telegramChatId: "",
    landingTitle: "",
    landingDescription: "",
    primaryColor: "#3b82f6",
    logoUrl: "",
    contractStart: "",
    contractEnd: "",
    ctaButtonText: "",
    thankYouTitle: "",
    thankYouMessage: "",
  });

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
        landingTitle: client.landingTitle || "",
        landingDescription: client.landingDescription || "",
        primaryColor: client.primaryColor || "#3b82f6",
        logoUrl: client.logoUrl || "",
        contractStart: client.contractStart?.split("T")[0] || "",
        contractEnd: client.contractEnd?.split("T")[0] || "",
        ctaButtonText: client.ctaButtonText || "",
        thankYouTitle: client.thankYouTitle || "",
        thankYouMessage: client.thankYouMessage || "",
      });
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
        body: JSON.stringify(formData),
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
                    pattern="^[a-z0-9-]+$"
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
