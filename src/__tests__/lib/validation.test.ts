import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validatePhone,
  normalizePhone,
  formatPhone,
  formatPhoneInput,
  isPhoneComplete,
  validateName,
  checkDuplicateLead,
  clearDuplicateCache,
} from '@/lib/validation';

describe('Validation Module', () => {
  describe('validatePhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhone('01012345678')).toBe(true);
      expect(validatePhone('010-1234-5678')).toBe(true);
      expect(validatePhone('010.1234.5678')).toBe(true);
      expect(validatePhone('010 1234 5678')).toBe(true);
    });

    it('should return true for all valid prefixes', () => {
      expect(validatePhone('01012345678')).toBe(true);  // 010
      expect(validatePhone('01112345678')).toBe(true);  // 011
      expect(validatePhone('01612345678')).toBe(true);  // 016
      expect(validatePhone('01712345678')).toBe(true);  // 017
      expect(validatePhone('01812345678')).toBe(true);  // 018
      expect(validatePhone('01912345678')).toBe(true);  // 019
    });

    it('should return false for invalid phone numbers', () => {
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('01012345')).toBe(false);  // 너무 짧음
      expect(validatePhone('010123456789')).toBe(false);  // 너무 김
      expect(validatePhone('02012345678')).toBe(false);  // 잘못된 prefix
      expect(validatePhone('')).toBe(false);
    });

    it('should return false for phone with special characters only', () => {
      expect(validatePhone('---')).toBe(false);
      expect(validatePhone('...')).toBe(false);
    });
  });

  describe('normalizePhone', () => {
    it('should remove all non-digit characters', () => {
      expect(normalizePhone('010-1234-5678')).toBe('01012345678');
      expect(normalizePhone('010.1234.5678')).toBe('01012345678');
      expect(normalizePhone('010 1234 5678')).toBe('01012345678');
      expect(normalizePhone('(010) 1234-5678')).toBe('01012345678');
    });

    it('should handle already normalized phone', () => {
      expect(normalizePhone('01012345678')).toBe('01012345678');
    });

    it('should handle empty string', () => {
      expect(normalizePhone('')).toBe('');
    });
  });

  describe('formatPhone', () => {
    it('should format phone with hyphens', () => {
      expect(formatPhone('01012345678')).toBe('010-1234-5678');
      expect(formatPhone('0101234567')).toBe('010-123-4567');  // 10자리
    });

    it('should handle already formatted phone', () => {
      expect(formatPhone('010-1234-5678')).toBe('010-1234-5678');
    });

    it('should return original for invalid length', () => {
      expect(formatPhone('123')).toBe('123');
      expect(formatPhone('')).toBe('');
    });
  });

  describe('formatPhoneInput', () => {
    it('should not add hyphen for 3 or fewer digits', () => {
      expect(formatPhoneInput('0')).toBe('0');
      expect(formatPhoneInput('01')).toBe('01');
      expect(formatPhoneInput('010')).toBe('010');
    });

    it('should add hyphen after 3 digits', () => {
      expect(formatPhoneInput('0101')).toBe('010-1');
      expect(formatPhoneInput('01012')).toBe('010-12');
      expect(formatPhoneInput('010123')).toBe('010-123');
      expect(formatPhoneInput('0101234')).toBe('010-1234');
    });

    it('should add second hyphen after 7 digits', () => {
      expect(formatPhoneInput('01012345')).toBe('010-1234-5');
      expect(formatPhoneInput('010123456')).toBe('010-1234-56');
      expect(formatPhoneInput('0101234567')).toBe('010-1234-567');
      expect(formatPhoneInput('01012345678')).toBe('010-1234-5678');
    });

    it('should limit to 11 digits', () => {
      expect(formatPhoneInput('010123456789999')).toBe('010-1234-5678');
    });

    it('should strip non-digit characters', () => {
      expect(formatPhoneInput('010-12')).toBe('010-12');
      expect(formatPhoneInput('010.1234.5678')).toBe('010-1234-5678');
      expect(formatPhoneInput('abc010def1234')).toBe('010-1234');
    });

    it('should handle empty string', () => {
      expect(formatPhoneInput('')).toBe('');
    });
  });

  describe('isPhoneComplete', () => {
    it('should return true for valid complete phones', () => {
      expect(isPhoneComplete('01012345678')).toBe(true);
      expect(isPhoneComplete('0101234567')).toBe(true);  // 10자리도 유효
      expect(isPhoneComplete('010-1234-5678')).toBe(true);
    });

    it('should return false for incomplete phones', () => {
      expect(isPhoneComplete('010')).toBe(false);
      expect(isPhoneComplete('010-1234')).toBe(false);
      expect(isPhoneComplete('010123456')).toBe(false);  // 9자리
    });

    it('should return false for invalid prefixes', () => {
      expect(isPhoneComplete('02012345678')).toBe(false);
      expect(isPhoneComplete('00012345678')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPhoneComplete('')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should return true for valid names', () => {
      expect(validateName('홍길동')).toBe(true);
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('김철수')).toBe(true);
    });

    it('should return false for empty or whitespace only', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
      expect(validateName('\t\n')).toBe(false);
    });

    it('should return false for too short names', () => {
      expect(validateName('a')).toBe(false);
      expect(validateName('김')).toBe(false);
    });

    it('should trim and validate', () => {
      expect(validateName('  홍길동  ')).toBe(true);
    });
  });

  describe('checkDuplicateLead', () => {
    const clientId = 'client-123';
    const phone = '01012345678';

    beforeEach(() => {
      vi.useFakeTimers();
      clearDuplicateCache();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return false for first submission', () => {
      expect(checkDuplicateLead(clientId, phone)).toBe(false);
    });

    it('should return true for duplicate within 5 minutes', () => {
      checkDuplicateLead(clientId, phone);

      // 4분 후 재시도
      vi.advanceTimersByTime(4 * 60 * 1000);

      expect(checkDuplicateLead(clientId, phone)).toBe(true);
    });

    it('should return false after 5 minutes', () => {
      checkDuplicateLead(clientId, phone);

      // 5분 + 1초 후
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

      expect(checkDuplicateLead(clientId, phone)).toBe(false);
    });

    it('should track different clients separately', () => {
      const client1 = 'client-1';
      const client2 = 'client-2';

      checkDuplicateLead(client1, phone);

      // 같은 번호지만 다른 클라이언트는 허용
      expect(checkDuplicateLead(client2, phone)).toBe(false);
    });

    it('should track different phones separately', () => {
      const phone1 = '01012345678';
      const phone2 = '01087654321';

      checkDuplicateLead(clientId, phone1);

      // 같은 클라이언트지만 다른 번호는 허용
      expect(checkDuplicateLead(clientId, phone2)).toBe(false);
    });
  });
});
