"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "initial" | "sent";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("initial");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const router = useRouter();

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  async function handleSend() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = await res.json();
      if (!res.ok) {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "인증에 실패했습니다.");
        if (data.lockedUntil) {
          setLockedUntil(data.lockedUntil);
        }
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">polarlead Admin</h1>
        <p className="text-center text-gray-500 text-sm mb-8">관리자 인증</p>

        {step === "initial" && (
          <div>
            <p className="text-gray-600 text-sm mb-6 text-center">
              등록된 텔레그램으로 인증코드를 발송합니다.
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "발송 중..." : "텔레그램으로 인증코드 받기"}
            </button>
          </div>
        )}

        {step === "sent" && (
          <form onSubmit={handleVerify}>
            <p className="text-gray-600 text-sm mb-6 text-center">
              텔레그램으로 발송된 6자리 코드를 입력하세요.
              <br />
              <span className="text-gray-400 text-xs">유효시간 5분</span>
            </p>
            <div className="mb-4">
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                disabled={isLocked}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || code.length !== 6 || isLocked}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? "확인 중..." : "확인"}
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
  );
}
