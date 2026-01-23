"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { CheckCircle, Loader2, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatPhoneInput, isPhoneComplete, validateName } from "@/lib/validation";
import type { FormField } from "@/types";

interface ClientData {
  id: string;
  name: string;
  slug: string;
  primaryColor?: string;
  logoUrl?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  formFields?: FormField[];
}

// 기본 폼 필드 (API에서 반환하지 않을 경우 fallback)
const DEFAULT_ENABLED_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "이름", placeholder: "홍길동", required: true, enabled: true, order: 0 },
  { id: "phone", type: "phone", label: "연락처", placeholder: "010-1234-5678", required: true, enabled: true, order: 1 },
];

interface LeadFormProps {
  client: ClientData;
}

export default function LeadForm({ client }: LeadFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 동적 폼 데이터 초기화
  const initialData = useMemo(() => {
    const data: Record<string, string> = {};
    (client.formFields || DEFAULT_ENABLED_FIELDS).forEach((field) => {
      data[field.id] = "";
    });
    return data;
  }, [client.formFields]);

  const [formData, setFormData] = useState<Record<string, string>>(initialData);

  // 전체 폼 필드 (enabled인 것만)
  const allFormFields = useMemo(() => {
    const fields = client.formFields || DEFAULT_ENABLED_FIELDS;
    return fields.filter((f) => f.enabled).sort((a, b) => a.order - b.order);
  }, [client.formFields]);

  // 조건부 필드 표시 여부 체크
  const shouldShowField = useCallback(
    (field: FormField): boolean => {
      if (!field.condition) return true;

      const { dependsOn, showWhen } = field.condition;
      const dependValue = formData[dependsOn] || "";

      if (Array.isArray(showWhen)) {
        return showWhen.includes(dependValue);
      }
      return dependValue === showWhen;
    },
    [formData]
  );

  // 실제로 표시할 필드 (조건부 필터링)
  const visibleFields = useMemo(() => {
    return allFormFields.filter(shouldShowField);
  }, [allFormFields, shouldShowField]);

  // 입력 핸들러 (텍스트, select)
  const handleInputChange = (fieldId: string, value: string) => {
    if (fieldId === "phone") {
      const formatted = formatPhoneInput(value);
      setFormData((prev) => ({ ...prev, [fieldId]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    }
  };

  // checkbox 핸들러 (다중 선택)
  const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[fieldId] ? prev[fieldId].split(",").filter(Boolean) : [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, value].join(",") };
      } else {
        return { ...prev, [fieldId]: current.filter((v) => v !== value).join(",") };
      }
    });
  };

  // 폼 유효성 검사 (보이는 필드만 검사)
  const isFormValid = useMemo(() => {
    for (const field of visibleFields) {
      if (!field.required) continue;

      const value = formData[field.id] || "";

      if (field.id === "name") {
        if (!validateName(value)) return false;
      } else if (field.id === "phone" || field.type === "phone") {
        if (!isPhoneComplete(value)) return false;
      } else if (field.id === "email" || field.type === "email") {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
      } else if (field.type === "checkbox") {
        if (!value.trim()) return false;
      } else {
        if (!value.trim()) return false;
      }
    }
    return true;
  }, [formData, visibleFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const res = await fetch(`/api/leads/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          ...formData,
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

  const primaryColor = client.primaryColor || "#3b82f6";

  // 필드 타입에 따른 input type 반환
  const getInputType = (fieldId: string): string => {
    switch (fieldId) {
      case "email":
        return "email";
      case "phone":
        return "tel";
      case "birthdate":
        return "date";
      default:
        return "text";
    }
  };

  // 필드 타입에 따른 inputMode 반환
  const getInputMode = (fieldId: string): "text" | "tel" | "email" | "numeric" | undefined => {
    switch (fieldId) {
      case "phone":
        return "numeric";
      case "email":
        return "email";
      default:
        return "text";
    }
  };

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

  // 폼 페이지
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link
          href={`/l/${client.slug}`}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          이전으로
        </Link>

        {/* 로고 (작게) */}
        {client.logoUrl && (
          <div className="flex justify-center mb-6">
            <div className="relative h-10 w-28">
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
        <h1 className="text-xl font-bold text-gray-900 text-center mb-6">
          상담 신청
        </h1>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {visibleFields.map((field) => (
            <div
              key={field.id}
              className={`transition-all duration-300 ${
                field.condition ? "animate-in fade-in slide-in-from-top-2" : ""
              }`}
            >
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* textarea (memo, 장문) */}
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

              {/* select (드롭다운) */}
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
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* radio (단일 선택) */}
              {field.type === "radio" && (
                <div className="space-y-2 mt-1">
                  {field.options?.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt.value}
                        checked={formData[field.id] === opt.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* checkbox (다중 선택) */}
              {field.type === "checkbox" && (
                <div className="space-y-2 mt-1">
                  {field.options?.map((opt) => {
                    const selectedValues = formData[field.id]?.split(",").filter(Boolean) || [];
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={selectedValues.includes(opt.value)}
                          onChange={(e) =>
                            handleCheckboxChange(field.id, opt.value, e.target.checked)
                          }
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 일반 input (text, phone, email, number, date) */}
              {!["textarea", "select", "radio", "checkbox"].includes(field.type) && (
                <input
                  type={getInputType(field.id)}
                  id={field.id}
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  inputMode={getInputMode(field.id)}
                  autoComplete={
                    field.type === "phone" || field.id === "phone"
                      ? "tel"
                      : field.type === "email" || field.id === "email"
                      ? "email"
                      : field.id === "name"
                      ? "name"
                      : undefined
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              {/* 전화번호 형식 안내 */}
              {(field.id === "phone" || field.type === "phone") &&
                formData[field.id] &&
                !isPhoneComplete(formData[field.id]) && (
                  <p className="mt-1 text-xs text-gray-500">
                    010-0000-0000 형식으로 입력해주세요
                  </p>
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

          <p className="text-xs text-gray-400 text-center">
            개인정보는 상담 목적으로만 사용됩니다.
          </p>
        </form>
      </div>
    </div>
  );
}
