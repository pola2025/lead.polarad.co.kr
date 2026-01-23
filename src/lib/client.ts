/**
 * Client Module
 * 클라이언트 관련 유틸리티 함수
 */

import { getClientBySlug } from '@/lib/airtable';

/**
 * Slug 유일성 검사
 *
 * @param slug 검사할 slug
 * @param excludeId 제외할 클라이언트 ID (수정 시 자기 자신 제외)
 * @returns true면 사용 가능, false면 이미 존재
 */
export async function isSlugUnique(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await getClientBySlug(slug);

  if (!existing) {
    return true;
  }

  // 수정 시 자기 자신의 slug는 허용
  if (excludeId && existing.id === excludeId) {
    return true;
  }

  return false;
}

/**
 * Airtable Formula 문자열 이스케이프
 * 쿼리 인젝션 방지
 */
export function escapeAirtableFormula(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // 백슬래시를 먼저 이스케이프 (순서 중요)
  let escaped = value.replace(/\\/g, '\\\\');
  // 쌍따옴표 이스케이프
  escaped = escaped.replace(/"/g, '\\"');

  return escaped;
}

/**
 * Slug 형식 검증
 * 영문 소문자, 숫자, 하이픈만 허용
 */
export function validateSlugFormat(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Slug 생성 (이름에서 자동 생성)
 */
export function generateSlugFromName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 정리
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
}

/**
 * 클라이언트 상태 라벨
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
    pending: '대기',
  };
  return labels[status] || status;
}

/**
 * 클라이언트 상태 색상 (Tailwind)
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
