"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "pending" as const,
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 이름을 슬러그로 자동 변환
    if (name === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하만 가능합니다.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "업로드에 실패했습니다.");
        return;
      }

      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err) {
      console.error(err);
      setError("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "등록에 실패했습니다.");
        return;
      }

      router.push("/clients");
    } catch (err) {
      console.error(err);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">새 클라이언트 등록</h1>
          <p className="mt-1 text-sm text-gray-500">
            새로운 리드 수집 랜딩 페이지 고객을 등록합니다.
          </p>
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
                  placeholder="예: 커피숍 A"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 (URL용) *
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    polarlead.kr/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    pattern="^[a-z0-9\-]+$"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="coffee-shop-a"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  영문 소문자, 숫자, 하이픈(-)만 사용 가능
                </p>
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
                  placeholder="예: 무료 상담 신청"
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
                  placeholder="랜딩 페이지에 표시될 설명을 입력하세요."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

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
                {formData.logoUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                      <Image
                        src={formData.logoUrl}
                        alt="로고 미리보기"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                      삭제
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
                  >
                    {uploading ? (
                      <div className="text-sm text-gray-500">업로드 중...</div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">클릭하여 로고 업로드</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG (최대 5MB)</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
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
                  placeholder="카카오 개발자 앱의 REST API 키"
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
                  placeholder="카카오 개발자 앱의 Client Secret"
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
                placeholder="리드 알림을 받을 텔레그램 채팅 ID"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                @userinfobot에게 메시지를 보내 채팅 ID를 확인할 수 있습니다.
              </p>
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
                placeholder="예: C0A5H99LGBU"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                포털 비밀번호 및 설정 변경 알림을 받을 슬랙 채널 ID입니다.
                채널 우클릭 → 채널 세부정보 보기 → 하단에서 채널 ID를 확인하세요.
              </p>
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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
