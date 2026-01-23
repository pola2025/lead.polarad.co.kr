/**
 * Validation Module
 * 전화번호, 이름 검증, 중복 체크, 욕설 필터 기능
 */

// 욕설/비속어 목록 (한글 + 영어)
const PROFANITY_LIST = [
  // 한글 욕설
  '시발', '씨발', '씨팔', '시팔', '씹', '좆', '존나', '졸라', '개새끼', '새끼',
  '병신', '븅신', '빙신', '지랄', '염병', '엿', '꺼져', '닥쳐', '죽어', '뒤져',
  '미친', '또라이', '찐따', 'ㅅㅂ', 'ㅆㅂ', 'ㅂㅅ', 'ㅈㄹ', 'ㅄ', 'ㄲㅈ',
  '개같', '개년', '걸레', '창녀', '보지', '자지', '섹스', '야동',
  // 영어 욕설
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'dick', 'cock', 'pussy',
  // 변형
  'tlqkf', '씨ㅂ', '시ㅂ', 'ㅅㅂㄹㅁ', '시1발', '씨1발',
];

// 중복 방지 캐시 (메모리 기반)
interface DuplicateData {
  clientId: string;
  submittedAt: number;
}

const duplicateCache = new Map<string, DuplicateData>();

// 설정값
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5분

// 한국 전화번호 패턴 (010, 011, 016, 017, 018, 019)
const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019'];
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

/**
 * 전화번호 유효성 검증
 * 한국 휴대폰 번호 형식만 허용
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const normalized = normalizePhone(phone);

  if (!normalized || normalized.length < 10 || normalized.length > 11) {
    return false;
  }

  return PHONE_PATTERN.test(normalized);
}

/**
 * 전화번호 정규화
 * 모든 비숫자 문자 제거
 */
export function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  return phone.replace(/\D/g, '');
}

/**
 * 전화번호 포맷팅
 * 010-1234-5678 형식으로 변환
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);

  if (normalized.length === 11) {
    // 010-1234-5678
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7)}`;
  } else if (normalized.length === 10) {
    // 010-123-4567
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }

  return phone;
}

/**
 * 실시간 전화번호 입력 포맷팅
 * 입력 중에 자동으로 하이픈 추가
 */
export function formatPhoneInput(value: string): string {
  // 숫자만 추출
  const digits = value.replace(/\D/g, '');

  // 최대 11자리로 제한
  const limited = digits.slice(0, 11);

  // 길이에 따라 포맷팅
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
  }
}

/**
 * 전화번호 유효성 검사 (제출 가능 여부)
 * 010으로 시작하고 10-11자리인지 확인
 */
export function isPhoneComplete(phone: string): boolean {
  const digits = normalizePhone(phone);

  // 010으로 시작하고 10-11자리
  if (!digits.startsWith('01')) {
    return false;
  }

  return digits.length >= 10 && digits.length <= 11;
}

/**
 * 이름 유효성 검증
 * 공백만 있는 경우, 너무 짧은 경우 거부
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();

  // 최소 2자 이상
  if (trimmed.length < 2) {
    return false;
  }

  return true;
}

/**
 * 이름 정규화
 * 앞뒤 공백 제거
 */
export function normalizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  return name.trim();
}

/**
 * 리드 중복 체크
 * 같은 클라이언트 + 같은 전화번호 5분 내 중복 방지
 *
 * @returns true면 중복 (차단해야 함), false면 신규 (허용)
 */
export function checkDuplicateLead(clientId: string, phone: string): boolean {
  const normalizedPhone = normalizePhone(phone);
  const key = `${clientId}:${normalizedPhone}`;
  const now = Date.now();

  const existing = duplicateCache.get(key);

  if (existing) {
    // 5분 이내면 중복
    if (now - existing.submittedAt < DUPLICATE_WINDOW_MS) {
      return true;
    }
  }

  // 신규 또는 5분 경과 - 캐시 업데이트
  duplicateCache.set(key, {
    clientId,
    submittedAt: now,
  });

  return false;
}

/**
 * 중복 캐시 초기화 (테스트용)
 */
export function clearDuplicateCache(): void {
  duplicateCache.clear();
}

/**
 * 만료된 중복 캐시 정리 (주기적 정리용)
 */
export function cleanupDuplicateCache(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, data] of duplicateCache.entries()) {
    if (now - data.submittedAt >= DUPLICATE_WINDOW_MS) {
      duplicateCache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * 이메일 유효성 검증 (선택적 필드용)
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}

/**
 * 사업자명 유효성 검증 (선택적 필드용)
 */
export function validateBusinessName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return true; // 선택적 필드이므로 빈 값 허용
  }

  const trimmed = name.trim();
  return trimmed.length === 0 || trimmed.length >= 2;
}

/**
 * 욕설/비속어 검사
 * @returns true면 욕설 포함 (차단해야 함)
 */
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const lowerText = text.toLowerCase().replace(/\s/g, '');

  for (const word of PROFANITY_LIST) {
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * 여러 필드에서 욕설 검사
 * @returns 욕설이 포함된 첫 번째 필드명, 없으면 null
 */
export function checkProfanityInFields(fields: Record<string, string | undefined>): string | null {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (value && containsProfanity(value)) {
      return fieldName;
    }
  }
  return null;
}
