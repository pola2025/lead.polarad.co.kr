"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, CheckCircle, Loader2, ChevronDown } from "lucide-react";
import { formatPhoneInput, isPhoneComplete, validateName } from "@/lib/validation";
import type { FormField, ProductFeature } from "@/types";

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
}

// 기본 폼 필드
const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "이름", placeholder: "홍길동", required: true, enabled: true, order: 0 },
  { id: "phone", type: "phone", label: "연락처", placeholder: "010-1234-5678", required: true, enabled: true, order: 1 },
];

type Step = "intro" | "form" | "done";

interface LandingClientProps {
  client: ClientData;
}

export default function LandingClient({ client }: LandingClientProps) {
  const [step, setStep] = useState<Step>("intro");
  const [submitting, setSubmitting] = useState(false);
  const [kakaoEmail, setKakaoEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // 폼 데이터 초기화
  const initialFormData = useMemo(() => {
    const data: Record<string, string> = {};
    (client.formFields || DEFAULT_FORM_FIELDS).forEach((field) => {
      data[field.id] = "";
    });
    return data;
  }, [client.formFields]);

  const [formData, setFormData] = useState<Record<string, string>>(initialFormData);

  // 카카오 이메일 자동 채우기
  useEffect(() => {
    const email = searchParams.get("kakao_email");
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

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    window.location.href = `/api/auth/kakao?slug=${client.slug}`;
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
  }, [formData, visibleFields]);

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/leads/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, ...formData }),
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
      <div className="min-h-screen bg-gray-50">
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
              {client.landingDescription}
            </p>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">서비스 특징</h2>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature.id} className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {feature.icon === "✓" || !feature.icon ? <Check className="w-4 h-4" /> : <span>{feature.icon}</span>}
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </li>
              ))}
            </ul>
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
              <p className="text-xs text-gray-500 text-center mt-2">카카오 로그인 후에 상담진행이 가능합니다.</p>
            </div>
          )}


          {/* 사업자 정보 푸터 */}
          <footer className="mt-12 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-400 space-y-0.5">
              <p className="font-medium text-gray-500">폴라애드</p>
              <p>대표: 이재호 | 사업자등록번호: 808-03-00327</p>
              <p>통신판매업: 제2025-서울금천-1908호</p>
              <p>주소: 서울특별시 금천구 가산디지털2로 98, 롯데 IT 캐슬 2동 11층 1107</p>
              <p>전화: 032-345-9834 | 이메일: mkt@polarad.co.kr</p>
              <p className="pt-3">
                <a href="/privacy" target="_blank" className="text-gray-500 hover:text-gray-600 underline">개인정보처리방침</a>
              </p>
              <p className="pt-2">© {new Date().getFullYear()} PolarAd. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
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

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {visibleFields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "textarea" && (
                <textarea
                  id={field.id}
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              {field.type === "select" && (
                <div className="relative">
                  <select
                    id={field.id}
                    required={field.required}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">{field.placeholder || "선택하세요"}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              )}

              {field.type === "radio" && (
                <div className="space-y-2 mt-1">
                  {field.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value={opt.value}
                        checked={formData[field.id] === opt.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "checkbox" && (
                <div className="space-y-2 mt-1">
                  {field.options?.map((opt) => {
                    const selected = formData[field.id]?.split(",").filter(Boolean) || [];
                    return (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={selected.includes(opt.value)}
                          onChange={(e) => handleCheckboxChange(field.id, opt.value, e.target.checked)}
                          className="h-4 w-4 rounded text-blue-600"
                        />
                        <span className="text-gray-700">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {!["textarea", "select", "radio", "checkbox"].includes(field.type) && (
                <input
                  type={getInputType(field.id)}
                  id={field.id}
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  inputMode={getInputMode(field.id)}
                  autoComplete={field.id === "phone" ? "tel" : field.id === "email" ? "email" : field.id === "name" ? "name" : undefined}
                  readOnly={(field.id === "email" || field.type === "email") && !!kakaoEmail}
                  className={`w-full rounded-lg border px-4 py-3 text-base focus:outline-none ${
                    (field.id === "email" || field.type === "email") && kakaoEmail
                      ? "border-yellow-300 bg-yellow-50 text-gray-700 cursor-not-allowed"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
              )}

              {(field.id === "phone" || field.type === "phone") && formData[field.id] && !isPhoneComplete(formData[field.id]) && (
                <p className="mt-1 text-xs text-gray-500">010-0000-0000 형식으로 입력해주세요</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="w-full rounded-lg px-4 py-3 text-base font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-xs text-gray-400 text-center">개인정보는 상담 목적으로만 사용됩니다.</p>
        </form>
      </div>
    </div>
  );
}
