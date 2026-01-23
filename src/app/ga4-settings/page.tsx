"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { LineChart, Save, Check, Loader2, ExternalLink, AlertCircle } from "lucide-react";

export default function GA4SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ga4PropertyId: "",
    ga4ServiceAccountEmail: "",
    ga4PrivateKey: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/ga4-settings");
      const data = await res.json();

      if (data.success && data.data) {
        setFormData({
          ga4PropertyId: data.data.ga4PropertyId || "",
          ga4ServiceAccountEmail: data.data.ga4ServiceAccountEmail || "",
          ga4PrivateKey: data.data.ga4PrivateKey || "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("설정을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/ga4-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "저장에 실패했습니다.");
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
        <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
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

      <main className="pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-64 md:p-8">
        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 break-keep">
            <LineChart className="h-5 w-5 md:h-6 md:w-6" />
            GA4 설정
          </h1>
          <p className="mt-1 text-sm text-gray-500 break-keep">
            클라이언트 포털의 방문 통계를 위한 Google Analytics 4 연동 설정입니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 md:space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-600 flex items-center gap-2">
              <Check className="h-4 w-4" />
              저장되었습니다.
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">GA4 연동 정보</h2>

            <div className="space-y-4">
              {/* GA4 속성 ID */}
              <div>
                <label htmlFor="ga4PropertyId" className="block text-sm font-medium text-gray-700 mb-1">
                  GA4 속성 ID
                </label>
                <input
                  type="text"
                  id="ga4PropertyId"
                  name="ga4PropertyId"
                  value={formData.ga4PropertyId}
                  onChange={handleChange}
                  placeholder="123456789"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  GA4 관리 → 속성 → 속성 설정에서 확인할 수 있습니다.
                </p>
              </div>

              {/* 서비스 계정 이메일 */}
              <div>
                <label htmlFor="ga4ServiceAccountEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  서비스 계정 이메일
                </label>
                <input
                  type="email"
                  id="ga4ServiceAccountEmail"
                  name="ga4ServiceAccountEmail"
                  value={formData.ga4ServiceAccountEmail}
                  onChange={handleChange}
                  placeholder="service-account@project.iam.gserviceaccount.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Google Cloud Console에서 생성한 서비스 계정의 이메일입니다.
                </p>
              </div>

              {/* 개인키 */}
              <div>
                <label htmlFor="ga4PrivateKey" className="block text-sm font-medium text-gray-700 mb-1">
                  서비스 계정 개인키
                </label>
                <textarea
                  id="ga4PrivateKey"
                  name="ga4PrivateKey"
                  value={formData.ga4PrivateKey}
                  onChange={handleChange}
                  rows={6}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  서비스 계정 JSON 키 파일의 private_key 값입니다.
                </p>
              </div>
            </div>
          </div>

          {/* 안내 카드 */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">GA4 연동 방법</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>
                <a
                  href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline inline-flex items-center gap-1"
                >
                  Google Cloud Console
                  <ExternalLink className="h-3 w-3" />
                </a>
                에서 서비스 계정을 생성합니다.
              </li>
              <li>서비스 계정의 JSON 키 파일을 다운로드합니다.</li>
              <li>
                GA4 관리 → 속성 액세스 관리에서 서비스 계정 이메일에 <strong>뷰어</strong> 권한을 부여합니다.
              </li>
              <li>JSON 파일의 <code className="bg-blue-100 px-1 rounded">client_email</code>과 <code className="bg-blue-100 px-1 rounded">private_key</code>를 위 필드에 입력합니다.</li>
            </ol>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
