"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { formatPhoneInput, isPhoneComplete, validateName } from "@/lib/validation";
import type { FormField, ProductFeature } from "@/types";
import HeatmapTracker from "@/components/HeatmapTracker";
import { LandingFormFields, PrivacyCheckbox, FormDisclaimer } from "@/components/LandingFormFields";

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
  productFeatures?: ProductFeature[];
  formFields?: FormField[];
  // 푸터 사업자 정보
  footerCompanyName?: string;
  footerCeo?: string;
  footerBusinessNumber?: string;
  footerEcommerceNumber?: string;
  footerAddress?: string;
  footerPhone?: string;
  footerEmail?: string;
}

// 기본 폼 필드
const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "이름", placeholder: "홍길동", required: true, enabled: true, order: 0 },
  { id: "phone", type: "phone", label: "연락처", placeholder: "010-1234-5678", required: true, enabled: true, order: 1 },
];

type Step = "intro" | "form" | "done";

interface LandingClientProps {
  client: ClientData;
  // 광고 링크에서 직접 전달받는 UTM 정보 (URL 파라미터보다 우선)
  utmSource?: string;
  utmAd?: string;
}

export default function LandingClient({ client, utmSource: propUtmSource, utmAd: propUtmAd }: LandingClientProps) {
  const [step, setStep] = useState<Step>("intro");
  const [submitting, setSubmitting] = useState(false);
  const [kakaoEmail, setKakaoEmail] = useState<string | null>(null);
  const [kakaoId, setKakaoId] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showFooter] = useState(true);
  const searchParams = useSearchParams();

  // UTM 파라미터 (광고 추적) - props로 전달된 값 우선, 없으면 URL 파라미터
  const utmSource = propUtmSource || searchParams.get("utm_source") || undefined;
  const utmAd = propUtmAd || searchParams.get("utm_ad") || undefined;


  // 폼 데이터 초기화
  const initialFormData = useMemo(() => {
    const data: Record<string, string> = {};
    (client.formFields || DEFAULT_FORM_FIELDS).forEach((field) => {
      data[field.id] = "";
    });
    return data;
  }, [client.formFields]);

  const [formData, setFormData] = useState<Record<string, string>>(initialFormData);

  // 카카오 이메일/ID 자동 채우기
  useEffect(() => {
    const email = searchParams.get("kakao_email");
    const kakaoIdParam = searchParams.get("kakao_id");
    const error = searchParams.get("kakao_error");

    if (error) {
      console.error("Kakao OAuth error:", error);
      // 에러 메시지는 조용히 처리 (사용자에게 불필요한 에러 노출 방지)
    }

    if (email) {
      setKakaoEmail(email);
      setFormData((prev) => ({ ...prev, email }));
      setStep("form"); // 이메일을 받았으면 바로 폼으로 이동
    }

    if (kakaoIdParam) {
      setKakaoId(kakaoIdParam);
    }
  }, [searchParams]);

  const primaryColor = client.primaryColor || "#3b82f6";

  // 기본 특징
  const features = client.productFeatures && client.productFeatures.length > 0
    ? client.productFeatures
    : [
        { id: "1", icon: "✓", text: "실시간 접수 알림" },
        { id: "2", icon: "✓", text: "간편한 모바일 신청" },
        { id: "3", icon: "✓", text: "빠른 상담 연결" },
      ];

  // 폼 필드 (enabled만)
  const allFormFields = useMemo(() => {
    const fields = client.formFields || DEFAULT_FORM_FIELDS;
    return fields.filter((f) => f.enabled).sort((a, b) => a.order - b.order);
  }, [client.formFields]);

  // 조건부 필드 표시
  const shouldShowField = useCallback(
    (field: FormField): boolean => {
      if (!field.condition) return true;
      const { dependsOn, showWhen } = field.condition;
      const dependValue = formData[dependsOn] || "";
      if (Array.isArray(showWhen)) return showWhen.includes(dependValue);
      return dependValue === showWhen;
    },
    [formData]
  );

  const visibleFields = useMemo(() => {
    return allFormFields.filter(shouldShowField);
  }, [allFormFields, shouldShowField]);

  // 이메일 필드가 있는지 확인
  const hasEmailField = useMemo(() => {
    return allFormFields.some((f) => f.id === "email" || f.type === "email");
  }, [allFormFields]);

  // 카카오 로그인 핸들러 (UTM 정보 포함)
  const handleKakaoLogin = () => {
    const params = new URLSearchParams({ slug: client.slug });
    if (utmSource) params.set("utmSource", utmSource);
    if (utmAd) params.set("utmAd", utmAd);
    window.location.href = `/api/auth/kakao?${params.toString()}`;
  };

  // 입력 핸들러
  const handleInputChange = (fieldId: string, value: string) => {
    if (fieldId === "phone") {
      setFormData((prev) => ({ ...prev, [fieldId]: formatPhoneInput(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[fieldId] ? prev[fieldId].split(",").filter(Boolean) : [];
      if (checked) return { ...prev, [fieldId]: [...current, value].join(",") };
      return { ...prev, [fieldId]: current.filter((v) => v !== value).join(",") };
    });
  };

  // 폼 유효성
  const isFormValid = useMemo(() => {
    // 개인정보 이용동의 필수
    if (!privacyAgreed) return false;

    for (const field of visibleFields) {
      if (!field.required) continue;
      const value = formData[field.id] || "";
      if (field.id === "name" && !validateName(value)) return false;
      if ((field.id === "phone" || field.type === "phone") && !isPhoneComplete(value)) return false;
      if ((field.id === "email" || field.type === "email") && (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return false;
      if (field.type === "checkbox" && !value.trim()) return false;
      if (!["checkbox"].includes(field.type) && !value.trim()) return false;
    }
    return true;
  }, [formData, visibleFields, privacyAgreed]);

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/leads/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, kakaoId, utmSource, utmAd, ...formData }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "신청에 실패했습니다.");
        // 블랙리스트/욕설 차단 시 창 닫기
        if (data.blocked) {
          setTimeout(() => {
            window.close();
            // window.close()가 안 되는 경우 (직접 URL 입력 등) 빈 페이지로 이동
            window.location.href = "about:blank";
          }, 1500);
        }
        return;
      }
      setStep("done");
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInputType = (fieldId: string) => {
    switch (fieldId) {
      case "email": return "email";
      case "phone": return "tel";
      case "birthdate": return "date";
      default: return "text";
    }
  };

  const getInputMode = (fieldId: string): "text" | "tel" | "email" | "numeric" | undefined => {
    switch (fieldId) {
      case "phone": return "numeric";
      case "email": return "email";
      default: return "text";
    }
  };

  // 소개 페이지
  if (step === "intro") {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <HeatmapTracker clientSlug={client.slug} />
        <div className="max-w-md mx-auto px-4 py-12">
          {client.logoUrl && (
            <div className="flex justify-center mb-8">
              <div className="relative h-16 w-40">
                <Image src={client.logoUrl} alt={client.name} fill className="object-contain" unoptimized />
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {client.landingTitle || client.name}
          </h1>

          {client.landingDescription && (
            <p className="text-gray-600 text-center mb-8 whitespace-pre-line">
              {client.landingDescription.trim()}
            </p>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-xs sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 text-center">서비스 특징</h2>
            <div className="flex justify-center">
              <ul className="space-y-1.5 sm:space-y-3 inline-block">
                {features.map((feature) => (
                  <li key={feature.id} className="flex items-center gap-1.5 sm:gap-3">
                    <span className="flex-shrink-0 text-xs sm:text-lg">
                      {feature.icon === "✓" || !feature.icon ? "✓" : feature.icon}
                    </span>
                    <span className="text-[11px] sm:text-base text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 카카오 로그인 버튼 - 이메일 필드가 있을 때만 */}
          {hasEmailField && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleKakaoLogin}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: "#FEE500", color: "#000000" }}
              >
                <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#000000" d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.03 5.995.849 12.168 1.28 18.472 1.28 57.438 0 104-36.713 104-82 0-45.287-46.562-82-104-82z"/>
                </svg>
                카카오로 시작하기
              </button>
              <p className="text-base text-gray-600 text-center mt-3">카카오 <span className="font-semibold text-gray-800">로그인 후 상담접수</span>가 가능합니다.</p>
            </div>
          )}


          {/* 푸터 공간 확보 */}
          <div className="h-20" />
        </div>
      </div>

      {/* 사업자 정보 푸터 */}
      <footer className="bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto text-[10px] text-gray-400 space-y-0.5">
          <p className="font-medium text-gray-500">{client.footerCompanyName || "폴라애드"}</p>
          <p>대표: {client.footerCeo || "이재호"} | 사업자: {client.footerBusinessNumber || "808-03-00327"}</p>
          {(client.footerEcommerceNumber || !client.footerCompanyName) && (
            <p>통신판매: {client.footerEcommerceNumber || "제2025-서울금천-1908호"}</p>
          )}
          <p className="truncate">주소: {client.footerAddress || "서울특별시 금천구 가산디지털2로 98"}</p>
          <div className="flex justify-between items-center pt-1">
            <a href="/privacy" target="_blank" className="text-gray-500 hover:text-gray-600 underline">개인정보처리방침</a>
            <span>© {new Date().getFullYear()} {client.footerCompanyName || "PolarAd"}</span>
          </div>
        </div>
      </footer>
      </>
    );
  }

  // 완료 페이지
  if (step === "done") {
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

  // 폼 페이지
  return (
    <div className="min-h-screen bg-gray-50">
      <HeatmapTracker clientSlug={client.slug} />
      <div className="max-w-md mx-auto px-4 py-8">
        <button
          onClick={() => setStep("intro")}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          이전으로
        </button>

        {client.logoUrl && (
          <div className="flex justify-center mb-6">
            <div className="relative h-10 w-28">
              <Image src={client.logoUrl} alt={client.name} fill className="object-contain" unoptimized />
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-gray-900 text-center mb-6">상담 신청</h1>

        {/* 카카오 인증 완료 표시 */}
        {kakaoEmail && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path fill="#3C1E1E" d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.03 5.995.849 12.168 1.28 18.472 1.28 57.438 0 104-36.713 104-82 0-45.287-46.562-82-104-82z"/>
              </svg>
              카카오 계정으로 이메일이 입력되었습니다
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-3 sm:space-y-4">
          <LandingFormFields
            fields={visibleFields}
            formData={formData}
            onChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            kakaoEmail={kakaoEmail}
            getInputType={getInputType}
            getInputMode={getInputMode}
            isPhoneComplete={isPhoneComplete}
          />

          <PrivacyCheckbox
            checked={privacyAgreed}
            onChange={setPrivacyAgreed}
          />

          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="w-full rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                처리 중...
              </span>
            ) : (
              "신청 완료"
            )}
          </button>

          <FormDisclaimer />
        </form>
      </div>
    </div>
  );
}
