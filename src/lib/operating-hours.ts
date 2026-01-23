/**
 * 운영시간 관련 유틸리티 함수
 */

export type OperatingDays = 'weekdays' | 'everyday';

export interface OperatingHours {
  operatingDays?: OperatingDays;
  operatingStartTime?: string;
  operatingEndTime?: string;
}

const DEFAULT_OPERATING_DAYS: OperatingDays = 'weekdays';
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '18:00';

/**
 * 기본 운영시간 객체 반환
 */
export function getDefaultOperatingHours(): Required<OperatingHours> {
  return {
    operatingDays: DEFAULT_OPERATING_DAYS,
    operatingStartTime: DEFAULT_START_TIME,
    operatingEndTime: DEFAULT_END_TIME,
  };
}

/**
 * 운영요일 포맷팅
 * @param days - 'weekdays' | 'everyday'
 * @returns "평일" | "연중무휴"
 */
export function formatOperatingDays(days?: OperatingDays): string {
  const d = days || DEFAULT_OPERATING_DAYS;
  return d === 'everyday' ? '연중무휴' : '평일';
}

/**
 * 운영시간 포맷팅
 * @param startTime - 시작시간 (HH:mm)
 * @param endTime - 종료시간 (HH:mm)
 * @returns "09:00~18:00"
 */
export function formatOperatingTime(startTime?: string, endTime?: string): string {
  const start = startTime || DEFAULT_START_TIME;
  const end = endTime || DEFAULT_END_TIME;
  return `${start}~${end}`;
}

/**
 * 전체 운영시간 문자열 포맷팅
 * @param hours - 운영시간 객체
 * @returns "평일 09:00~18:00 (공휴일 휴무)" 또는 "연중무휴 09:00~18:00"
 */
export function formatOperatingHours(hours: OperatingHours): string {
  const days = hours.operatingDays || DEFAULT_OPERATING_DAYS;
  const time = formatOperatingTime(hours.operatingStartTime, hours.operatingEndTime);
  const daysText = formatOperatingDays(days);

  if (days === 'weekdays') {
    return `${daysText} ${time} (공휴일 휴무)`;
  }
  return `${daysText} ${time}`;
}

/**
 * 시간 형식 유효성 검사
 * @param time - 검사할 시간 문자열
 * @returns 유효하면 true
 */
export function validateOperatingTime(time: string): boolean {
  if (!time || typeof time !== 'string') {
    return false;
  }

  // HH:mm 형식 검사
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

/**
 * SMS/이메일에 추가할 운영시간 안내 문구 생성
 * @param hours - 운영시간 객체
 * @returns 운영시간 안내 문구
 */
export function getOperatingHoursNotice(hours: OperatingHours): string {
  const days = hours.operatingDays || DEFAULT_OPERATING_DAYS;
  const time = formatOperatingTime(hours.operatingStartTime, hours.operatingEndTime);

  const suffix = days === 'weekdays' ? '(토/공휴일 휴무)' : '(연중무휴)';

  return `[운영시간]\n${time}${suffix}`;
}
