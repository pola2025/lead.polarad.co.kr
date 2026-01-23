"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function PortalLoginPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      // 포털 대시보드로 이동
      router.push(`/portal/${slug}`);
    } catch (err) {
      console.error(err);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* 아이콘 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          {/* 제목 */}
          <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
            클라이언트 포털
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            랜딩 페이지 설정을 관리합니다
          </p>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 text-base font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  로그인 중...
                </span>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          {/* 안내 */}
          <p className="mt-6 text-xs text-gray-400 text-center">
            비밀번호를 모르시면 관리자에게 문의하세요
          </p>
        </div>
      </div>
    </div>
  );
}
