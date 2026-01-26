"use client";

import { ChevronDown } from "lucide-react";
import type { FormField } from "@/types";

interface LandingFormFieldsProps {
  fields: FormField[];
  formData: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onCheckboxChange?: (fieldId: string, value: string, checked: boolean) => void;
  kakaoEmail?: string | null;
  isPreview?: boolean;
  getInputType?: (fieldId: string) => string;
  getInputMode?: (fieldId: string) => "text" | "numeric" | "tel" | "email" | undefined;
  isPhoneComplete?: (phone: string) => boolean;
}

export function LandingFormFields({
  fields,
  formData,
  onChange,
  onCheckboxChange,
  kakaoEmail,
  isPreview = false,
  getInputType,
  getInputMode,
  isPhoneComplete,
}: LandingFormFieldsProps) {
  const defaultGetInputType = (fieldId: string) => {
    if (fieldId === "email") return "email";
    if (fieldId === "phone") return "tel";
    return "text";
  };

  const defaultGetInputMode = (fieldId: string): "text" | "numeric" | "tel" | "email" | undefined => {
    if (fieldId === "phone") return "tel";
    if (fieldId === "email") return "email";
    return "text";
  };

  const inputType = getInputType || defaultGetInputType;
  const inputMode = getInputMode || defaultGetInputMode;

  return (
    <>
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === "textarea" && (
            <textarea
              id={field.id}
              required={!isPreview && field.required}
              value={formData[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              readOnly={isPreview}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          {field.type === "select" && (
            <div className="relative">
              <select
                id={field.id}
                required={!isPreview && field.required}
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                disabled={isPreview}
                className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">{field.placeholder || "선택하세요"}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {field.type === "radio" && (
            <div className="space-y-1.5 mt-1">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={formData[field.id] === opt.value}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    disabled={isPreview}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm sm:text-base text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === "checkbox" && (
            <div className="space-y-1.5 mt-1">
              {field.options?.map((opt) => {
                const selected = formData[field.id]?.split(",").filter(Boolean) || [];
                return (
                  <label key={opt.value} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={selected.includes(opt.value)}
                      onChange={(e) => onCheckboxChange?.(field.id, opt.value, e.target.checked)}
                      disabled={isPreview}
                      className="h-4 w-4 rounded text-blue-600"
                    />
                    <span className="text-sm sm:text-base text-gray-700">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {!["textarea", "select", "radio", "checkbox"].includes(field.type) && (
            <input
              type={inputType(field.id)}
              id={field.id}
              required={!isPreview && field.required}
              value={formData[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              inputMode={inputMode(field.id)}
              autoComplete={field.id === "phone" ? "tel" : field.id === "email" ? "email" : field.id === "name" ? "name" : undefined}
              readOnly={isPreview || ((field.id === "email" || field.type === "email") && !!kakaoEmail)}
              className={`w-full rounded-lg border px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none ${
                (field.id === "email" || field.type === "email") && kakaoEmail
                  ? "border-yellow-300 bg-yellow-50 text-gray-700 cursor-not-allowed"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
          )}

          {!isPreview && (field.id === "phone" || field.type === "phone") && formData[field.id] && isPhoneComplete && !isPhoneComplete(formData[field.id]) && (
            <p className="mt-1 text-xs text-gray-500">010-0000-0000 형식으로 입력해주세요</p>
          )}
        </div>
      ))}
    </>
  );
}

interface PrivacyCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isPreview?: boolean;
}

export function PrivacyCheckbox({ checked, onChange, isPreview = false }: PrivacyCheckboxProps) {
  return (
    <div className="pt-2">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={isPreview}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">
          {isPreview ? (
            <span className="text-blue-600 underline">개인정보 이용약관</span>
          ) : (
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-700"
            >
              개인정보 이용약관
            </a>
          )}
          에 동의합니다. <span className="text-red-500">*</span>
        </span>
      </label>
    </div>
  );
}

export function FormDisclaimer() {
  return (
    <div className="text-xs text-gray-500 text-center space-y-1">
      <p>본 접수정보는 상담접수에만 이용되며 상담 후 폐기됩니다.</p>
      <p>카카오 로그인은 친구추가, 채널추가, 메세지발송에 활용되지 않으며,<br />접수자 인증목적으로만 사용됩니다.</p>
    </div>
  );
}
