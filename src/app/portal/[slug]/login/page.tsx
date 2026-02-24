"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

type Step = "initial" | "sent";

export default function PortalLoginPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [step, setStep] = useState<Step>("initial");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  async function handleSend() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "send" }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "발송 중 오류가 발생했습니다.");
        return;
      }
      setStep("sent");
      setCode("");
    } catch {
      setError("발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "verify", code }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "인증에 실패했습니다.");
        if (data.lockedUntil) setLockedUntil(data.lockedUntil);
        return;
      }
      router.push(`/portal/${slug}`);
    } catch {
      setError("인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

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

          {step === "initial" && (
            <div>
              <p className="text-sm text-gray-600 text-center mb-6">
                등록된 텔레그램으로 인증코드를 발송합니다.
              </p>
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full rounded-lg bg-primary-600 px-4 py-3 text-base font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    발송 중...
                  </span>
                ) : (
                  "텔레그램으로 인증코드 받기"
                )}
              </button>
            </div>
          )}

          {step === "sent" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                텔레그램으로 발송된 6자리 코드를 입력하세요.
                <br />
                <span className="text-xs text-gray-400">유효시간 5분</span>
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                disabled={isLocked}
              />
              <button
                type="submit"
                disabled={loading || code.length !== 6 || isLocked}
                className="w-full rounded-lg bg-primary-600 px-4 py-3 text-base font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    확인 중...
                  </span>
                ) : (
                  "확인"
                )}
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                코드 재발송
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
