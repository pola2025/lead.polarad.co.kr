/**
 * 폼 필드 동기화 유틸리티
 * 관리자/클라이언트 포털에서 공통으로 사용
 */

import { addFieldToLeadsTable, deleteFieldFromLeadsTable } from '@/lib/airtable';
import type { FormField } from '@/types';

// 기본 필드 ID (Airtable Leads 테이블에 이미 존재하는 필드)
const DEFAULT_AIRTABLE_FIELD_IDS = [
  'name', 'phone', 'email', 'businessName', 'industry',
  'kakaoId', 'address', 'birthdate', 'status', 'memo',
  'ipAddress', 'userAgent', 'createdAt'
];

/**
 * 폼 필드 변경 시 Airtable Leads 테이블 스키마 동기화
 * - 새 커스텀 필드 추가
 * - 삭제된 커스텀 필드 제거
 */
export async function syncFormFieldsToAirtable(
  leadsTableId: string,
  oldFields: FormField[],
  newFields: FormField[]
): Promise<{ added: string[]; deleted: string[] }> {
  const added: string[] = [];
  const deleted: string[] = [];

  // 기존 커스텀 필드 ID 목록
  const oldCustomFieldIds = oldFields
    .filter(f => !DEFAULT_AIRTABLE_FIELD_IDS.includes(f.id))
    .map(f => f.id);

  // 새 커스텀 필드 ID 목록
  const newCustomFieldIds = newFields
    .filter(f => !DEFAULT_AIRTABLE_FIELD_IDS.includes(f.id))
    .map(f => f.id);

  // 추가된 커스텀 필드
  const addedFieldIds = newCustomFieldIds.filter(id => !oldCustomFieldIds.includes(id));
  for (const fieldId of addedFieldIds) {
    const field = newFields.find(f => f.id === fieldId);
    if (field) {
      const airtableType = field.type === 'textarea' ? 'multilineText' : 'singleLineText';
      const result = await addFieldToLeadsTable(leadsTableId, fieldId, airtableType);
      if (result.success) {
        added.push(fieldId);
        console.log(`✅ Airtable 필드 추가: ${fieldId}`);
      }
    }
  }

  // 삭제된 커스텀 필드
  const deletedFieldIds = oldCustomFieldIds.filter(id => !newCustomFieldIds.includes(id));
  for (const fieldId of deletedFieldIds) {
    const result = await deleteFieldFromLeadsTable(leadsTableId, fieldId);
    if (result.success) {
      deleted.push(fieldId);
      console.log(`🗑️ Airtable 필드 삭제: ${fieldId}`);
    }
  }

  return { added, deleted };
}

/**
 * 폼 필드 변경 여부 확인
 */
export function hasFormFieldsChanged(
  oldFields: FormField[],
  newFields: FormField[]
): boolean {
  if (oldFields.length !== newFields.length) return true;

  const oldIds = new Set(oldFields.map(f => f.id));
  const newIds = new Set(newFields.map(f => f.id));

  // ID 집합이 다르면 변경됨
  if (oldIds.size !== newIds.size) return true;
  for (const id of oldIds) {
    if (!newIds.has(id)) return true;
  }

  return false;
}
