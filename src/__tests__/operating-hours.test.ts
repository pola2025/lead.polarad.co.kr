import { describe, it, expect } from 'vitest';
import {
  formatOperatingHours,
  formatOperatingDays,
  formatOperatingTime,
  getDefaultOperatingHours,
  validateOperatingTime,
} from '@/lib/operating-hours';

describe('운영시간 유틸리티', () => {
  describe('formatOperatingHours', () => {
    it('주중 + 기본시간 → "평일 09:00~18:00 (공휴일 휴무)"', () => {
      const result = formatOperatingHours({
        operatingDays: 'weekdays',
        operatingStartTime: '09:00',
        operatingEndTime: '18:00',
      });
      expect(result).toBe('평일 09:00~18:00 (공휴일 휴무)');
    });

    it('연중무휴 + 기본시간 → "연중무휴 09:00~18:00"', () => {
      const result = formatOperatingHours({
        operatingDays: 'everyday',
        operatingStartTime: '09:00',
        operatingEndTime: '18:00',
      });
      expect(result).toBe('연중무휴 09:00~18:00');
    });

    it('주중 + 커스텀시간 → "평일 10:00~20:00 (공휴일 휴무)"', () => {
      const result = formatOperatingHours({
        operatingDays: 'weekdays',
        operatingStartTime: '10:00',
        operatingEndTime: '20:00',
      });
      expect(result).toBe('평일 10:00~20:00 (공휴일 휴무)');
    });

    it('연중무휴 + 커스텀시간 → "연중무휴 10:00~22:00"', () => {
      const result = formatOperatingHours({
        operatingDays: 'everyday',
        operatingStartTime: '10:00',
        operatingEndTime: '22:00',
      });
      expect(result).toBe('연중무휴 10:00~22:00');
    });

    it('기본값 처리 → undefined일 때 기본값 사용', () => {
      const result = formatOperatingHours({});
      expect(result).toBe('평일 09:00~18:00 (공휴일 휴무)');
    });

    it('부분 값만 있을 때 나머지는 기본값 사용', () => {
      const result = formatOperatingHours({
        operatingDays: 'everyday',
      });
      expect(result).toBe('연중무휴 09:00~18:00');
    });
  });

  describe('formatOperatingDays', () => {
    it('weekdays → "평일"', () => {
      expect(formatOperatingDays('weekdays')).toBe('평일');
    });

    it('everyday → "연중무휴"', () => {
      expect(formatOperatingDays('everyday')).toBe('연중무휴');
    });

    it('undefined → "평일" (기본값)', () => {
      expect(formatOperatingDays(undefined)).toBe('평일');
    });
  });

  describe('formatOperatingTime', () => {
    it('시작~종료 시간 포맷', () => {
      expect(formatOperatingTime('09:00', '18:00')).toBe('09:00~18:00');
    });

    it('undefined일 때 기본값 사용', () => {
      expect(formatOperatingTime(undefined, undefined)).toBe('09:00~18:00');
    });

    it('시작만 있을 때', () => {
      expect(formatOperatingTime('10:00', undefined)).toBe('10:00~18:00');
    });

    it('종료만 있을 때', () => {
      expect(formatOperatingTime(undefined, '20:00')).toBe('09:00~20:00');
    });
  });

  describe('getDefaultOperatingHours', () => {
    it('기본 운영시간 객체 반환', () => {
      const defaults = getDefaultOperatingHours();
      expect(defaults).toEqual({
        operatingDays: 'weekdays',
        operatingStartTime: '09:00',
        operatingEndTime: '18:00',
      });
    });
  });

  describe('validateOperatingTime', () => {
    it('유효한 시간 형식 (HH:mm)', () => {
      expect(validateOperatingTime('09:00')).toBe(true);
      expect(validateOperatingTime('23:59')).toBe(true);
      expect(validateOperatingTime('00:00')).toBe(true);
    });

    it('유효하지 않은 시간 형식', () => {
      expect(validateOperatingTime('9:00')).toBe(false);
      expect(validateOperatingTime('25:00')).toBe(false);
      expect(validateOperatingTime('12:60')).toBe(false);
      expect(validateOperatingTime('abc')).toBe(false);
      expect(validateOperatingTime('')).toBe(false);
    });
  });
});
