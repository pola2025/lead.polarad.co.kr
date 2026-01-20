"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Loader2 } from "lucide-react";

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
}

export default function LandingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (slug) {
      fetchClient();
    }
  }, [slug]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/by-slug/${slug}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "페이지를 찾을 수 없습니다.");
        return;
      }

      setClient(data.data);
    } catch (err) {
      console.error(err);
      setError("페이지를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/leads/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "신청에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = client?.primaryColor || "#3b82f6";

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 에러
  if (error || !client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // 제출 완료
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircle className="h-8 w-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {client.thankYouTitle || "신청이 완료되었습니다"}
          </h1>
          <p className="text-gray-600">
            {client.thankYouMessage || "빠른 시일 내에 연락드리겠습니다. 감사합니다!"}
          </p>
        </div>
      </div>
    );
  }

  // 랜딩 폼
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">
        {/* 로고 */}
        {client.logoUrl && (
          <div className="flex justify-center mb-8">
            <div className="relative h-16 w-40">
              <Image
                src={client.logoUrl}
                alt={client.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {client.landingTitle || client.name}
        </h1>

        {/* 설명 */}
        {client.landingDescription && (
          <p className="text-gray-600 text-center mb-8 whitespace-pre-line">
            {client.landingDescription}
          </p>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="홍길동"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              연락처 *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg px-4 py-3 text-base font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                처리 중...
              </span>
            ) : (
              client.ctaButtonText || "상담 신청하기"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            개인정보는 상담 목적으로만 사용됩니다.
          </p>
        </form>
      </div>
    </div>
  );
}
