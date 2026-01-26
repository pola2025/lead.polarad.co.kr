"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  GripVertical,
  Plus,
  Trash2,
  Settings,
  X,
  Check,
} from "lucide-react";
import type { FormField, FormFieldOption, FormFieldInputType } from "@/types";
import { PRESET_BASIC_FIELDS, PRESET_OPTIONAL_FIELDS } from "@/types";

interface FormFieldsEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

// 필드 타입 한글 이름
const FIELD_TYPE_NAMES: Record<FormFieldInputType, string> = {
  text: "단문 텍스트",
  textarea: "장문 텍스트",
  phone: "전화번호",
  email: "이메일",
  number: "숫자",
  date: "날짜",
  select: "드롭다운",
  radio: "라디오 버튼",
  checkbox: "체크박스",
};

// 새 커스텀 필드용 기본값
const NEW_FIELD_TEMPLATE: Omit<FormField, "id" | "order"> = {
  type: "text",
  label: "",
  placeholder: "",
  required: false,
  enabled: true,
};

// Portal로 렌더링하는 Modal 래퍼
function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

export default function FormFieldsEditor({ fields, onChange }: FormFieldsEditorProps) {
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState<FormField | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  // 활성화된 필드만 순서대로
  const enabledFields = fields
    .filter((f) => f.enabled)
    .sort((a, b) => a.order - b.order);

  // 비활성화된 프리셋 필드 (이메일 제외 - 이메일은 삭제 불가)
  const disabledPresets = PRESET_OPTIONAL_FIELDS.filter(
    (preset) => preset.id !== "email" && !fields.find((f) => f.id === preset.id)?.enabled
  );

  // 필드 활성화/비활성화 토글
  const toggleField = useCallback(
    (fieldId: string) => {
      const newFields = fields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, enabled: !f.enabled };
        }
        return f;
      });
      onChange(newFields);
    },
    [fields, onChange]
  );

  // 필수 여부 토글
  const toggleRequired = useCallback(
    (fieldId: string) => {
      const newFields = fields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, required: !f.required };
        }
        return f;
      });
      onChange(newFields);
    },
    [fields, onChange]
  );

  // 드래그 앤 드롭으로 필드 순서 변경
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, fieldId: string) => {
    setDraggedId(fieldId);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    // 드래그 시작 시 약간의 딜레이 후 스타일 적용
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = "0.5";
      }
    }, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = "1";
      dragNodeRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>, fieldId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== fieldId) {
      setDragOverId(fieldId);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // 자식 요소로 이동할 때는 무시
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sorted = [...enabledFields];
    const draggedIndex = sorted.findIndex((f) => f.id === draggedId);
    const targetIndex = sorted.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // 드래그한 아이템을 빼서 타겟 위치에 삽입
    const [draggedItem] = sorted.splice(draggedIndex, 1);
    sorted.splice(targetIndex, 0, draggedItem);

    // order 재할당
    const newFields = fields.map((f) => {
      const newOrder = sorted.findIndex((s) => s.id === f.id);
      if (newOrder !== -1) {
        return { ...f, order: newOrder };
      }
      return f;
    });

    onChange(newFields);
    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, enabledFields, fields, onChange]);

  // 프리셋 필드 추가
  const addPresetField = useCallback(
    (presetId: string) => {
      const preset = PRESET_OPTIONAL_FIELDS.find((p) => p.id === presetId);
      if (!preset) return;

      const maxOrder = Math.max(...fields.map((f) => f.order), -1);

      // 이미 있는 필드면 활성화, 없으면 추가
      const existing = fields.find((f) => f.id === presetId);
      if (existing) {
        const newFields = fields.map((f) =>
          f.id === presetId ? { ...f, enabled: true, order: maxOrder + 1 } : f
        );
        onChange(newFields);
      } else {
        onChange([...fields, { ...preset, enabled: true, order: maxOrder + 1 }]);
      }
    },
    [fields, onChange]
  );

  // 커스텀 필드 추가
  const addCustomField = useCallback(
    (field: Omit<FormField, "id" | "order">) => {
      const maxOrder = Math.max(...fields.map((f) => f.order), -1);
      const newId = `custom_${Date.now()}`;
      onChange([...fields, { ...field, id: newId, order: maxOrder + 1 }]);
      setShowAddModal(false);
    },
    [fields, onChange]
  );

  // 필드 삭제 (커스텀 필드만)
  const deleteField = useCallback(
    (fieldId: string) => {
      // 기본 필드는 삭제 불가
      if (PRESET_BASIC_FIELDS.some((p) => p.id === fieldId)) {
        alert("기본 필드(이름, 연락처)는 삭제할 수 없습니다.");
        return;
      }

      // 프리셋 필드는 비활성화만
      if (PRESET_OPTIONAL_FIELDS.some((p) => p.id === fieldId)) {
        toggleField(fieldId);
        return;
      }

      // 커스텀 필드는 완전 삭제
      onChange(fields.filter((f) => f.id !== fieldId));
    },
    [fields, onChange, toggleField]
  );

  // 필드 수정 저장
  const saveFieldEdit = useCallback(
    (updatedField: FormField) => {
      const newFields = fields.map((f) =>
        f.id === updatedField.id ? updatedField : f
      );
      onChange(newFields);
      setEditingField(null);
    },
    [fields, onChange]
  );

  // 옵션 수정 저장
  const saveOptions = useCallback(
    (fieldId: string, options: FormFieldOption[]) => {
      const newFields = fields.map((f) =>
        f.id === fieldId ? { ...f, options } : f
      );
      onChange(newFields);
      setShowOptionsModal(null);
    },
    [fields, onChange]
  );

  return (
    <div className="space-y-5">
      {/* 활성화된 필드 목록 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">활성화된 필드</h3>
        <div className="space-y-2">
          {enabledFields.map((field) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleDragStart(e, field.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, field.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, field.id)}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white border rounded-lg transition-all ${
                dragOverId === field.id
                  ? "border-blue-400 bg-blue-50 shadow-md"
                  : draggedId === field.id
                  ? "border-gray-300 opacity-50"
                  : "border-gray-200"
              }`}
            >
              {/* 드래그 핸들 */}
              <div className="cursor-grab active:cursor-grabbing p-0.5 sm:p-1 -m-0.5 sm:-m-1 hover:bg-gray-100 rounded flex-shrink-0">
                <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>

              {/* 필드 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="font-medium text-sm sm:text-base text-gray-900 truncate">{field.label}</span>
                  <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {FIELD_TYPE_NAMES[field.type]}
                  </span>
                  {field.condition && (
                    <span className="text-[10px] sm:text-xs text-blue-600 bg-blue-50 px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap">
                      조건부
                    </span>
                  )}
                </div>
                {field.placeholder && (
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate">{field.placeholder}</p>
                )}
              </div>

              {/* 필수 여부 토글 */}
              <label className="flex items-center gap-1 sm:gap-1.5 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={() => toggleRequired(field.id)}
                  disabled={PRESET_BASIC_FIELDS.some((p) => p.id === field.id) || field.id === "email"}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-[11px] sm:text-xs text-gray-600 whitespace-nowrap">필수</span>
              </label>

              {/* 선다형 옵션 편집 버튼 */}
              {["select", "radio", "checkbox"].includes(field.type) && (
                <button
                  type="button"
                  onClick={() => setShowOptionsModal(field)}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded flex-shrink-0"
                  title="옵션 편집"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}

              {/* 삭제 버튼 (이름, 연락처, 이메일은 삭제 불가) */}
              {!PRESET_BASIC_FIELDS.some((p) => p.id === field.id) && field.id !== "email" && (
                <button
                  type="button"
                  onClick={() => deleteField(field.id)}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 추가 가능한 프리셋 필드 */}
      {disabledPresets.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">추가 가능한 필드</h3>
          <div className="flex flex-wrap gap-2">
            {disabledPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addPresetField(preset.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 커스텀 필드 추가 버튼 */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        커스텀 필드 추가
      </button>

      {/* 커스텀 필드 추가 모달 - Portal로 렌더링하여 form 중첩 방지 */}
      {showAddModal && (
        <ModalPortal>
          <AddFieldModal
            onSave={addCustomField}
            onClose={() => setShowAddModal(false)}
            existingFields={fields}
          />
        </ModalPortal>
      )}

      {/* 옵션 편집 모달 - Portal로 렌더링하여 form 중첩 방지 */}
      {showOptionsModal && (
        <ModalPortal>
          <OptionsModal
            field={showOptionsModal}
            onSave={(options) => saveOptions(showOptionsModal.id, options)}
            onClose={() => setShowOptionsModal(null)}
          />
        </ModalPortal>
      )}
    </div>
  );
}

// 커스텀 필드 추가 모달
function AddFieldModal({
  onSave,
  onClose,
  existingFields,
}: {
  onSave: (field: Omit<FormField, "id" | "order">) => void;
  onClose: () => void;
  existingFields: FormField[];
}) {
  const [formData, setFormData] = useState<Omit<FormField, "id" | "order">>({
    ...NEW_FIELD_TEMPLATE,
  });
  const [options, setOptions] = useState<FormFieldOption[]>([]);
  const [conditionEnabled, setConditionEnabled] = useState(false);
  const [conditionDependsOn, setConditionDependsOn] = useState("");
  const [conditionShowWhen, setConditionShowWhen] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      alert("라벨을 입력해주세요.");
      return;
    }

    const field: Omit<FormField, "id" | "order"> = {
      ...formData,
      options: ["select", "radio", "checkbox"].includes(formData.type) ? options : undefined,
      condition: conditionEnabled && conditionDependsOn && conditionShowWhen
        ? { dependsOn: conditionDependsOn, showWhen: conditionShowWhen }
        : undefined,
    };

    onSave(field);
  };

  // 조건부 필드의 의존 필드 목록 (select, radio만)
  const dependableFields = existingFields.filter(
    (f) => f.enabled && ["select", "radio"].includes(f.type) && f.options?.length
  );

  // 선택된 의존 필드의 옵션 목록
  const dependOnField = dependableFields.find((f) => f.id === conditionDependsOn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">커스텀 필드 추가</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 필드 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              필드 타입 *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                type: e.target.value as FormFieldInputType,
              }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(FIELD_TYPE_NAMES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 라벨 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              라벨 (표시 이름) *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="예: 희망 상담일"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 플레이스홀더 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              플레이스홀더
            </label>
            <input
              type="text"
              value={formData.placeholder || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, placeholder: e.target.value }))}
              placeholder="예: 원하시는 상담 날짜를 선택해주세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 필수 여부 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData((prev) => ({ ...prev, required: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">필수 입력</span>
          </label>

          {/* 선다형 옵션 */}
          {["select", "radio", "checkbox"].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선택 옵션
              </label>
              <OptionsEditor options={options} onChange={setOptions} />
            </div>
          )}

          {/* 조건부 표시 */}
          {dependableFields.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={conditionEnabled}
                  onChange={(e) => setConditionEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">조건부 표시</span>
              </label>

              {conditionEnabled && (
                <div className="space-y-3 pl-6">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      다음 필드의 값에 따라 표시:
                    </label>
                    <select
                      value={conditionDependsOn}
                      onChange={(e) => {
                        setConditionDependsOn(e.target.value);
                        setConditionShowWhen("");
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">필드 선택...</option>
                      {dependableFields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {conditionDependsOn && dependOnField && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        다음 값일 때 표시:
                      </label>
                      <select
                        value={conditionShowWhen}
                        onChange={(e) => setConditionShowWhen(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">값 선택...</option>
                        {dependOnField.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 옵션 편집 모달
function OptionsModal({
  field,
  onSave,
  onClose,
}: {
  field: FormField;
  onSave: (options: FormFieldOption[]) => void;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<FormFieldOption[]>(field.options || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {field.label} - 옵션 편집
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <OptionsEditor options={options} onChange={setOptions} />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 옵션 목록 에디터
function OptionsEditor({
  options,
  onChange,
}: {
  options: FormFieldOption[];
  onChange: (options: FormFieldOption[]) => void;
}) {
  const addOption = () => {
    onChange([...options, { value: "", label: "" }]);
  };

  const updateOption = (index: number, key: keyof FormFieldOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {options.map((opt, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={opt.value}
            onChange={(e) => updateOption(index, "value", e.target.value)}
            placeholder="값 (저장용)"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={opt.label}
            onChange={(e) => updateOption(index, "label", e.target.value)}
            placeholder="표시 텍스트"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => removeOption(index)}
            className="p-2 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        옵션 추가
      </button>
    </div>
  );
}
