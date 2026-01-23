import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSlugUnique, escapeAirtableFormula } from '@/lib/client';

// Airtable 모킹
vi.mock('@/lib/airtable', () => ({
  getClientBySlug: vi.fn(),
}));

import { getClientBySlug } from '@/lib/airtable';
const mockedGetClientBySlug = vi.mocked(getClientBySlug);

describe('Client Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isSlugUnique', () => {
    it('should return true when slug does not exist', async () => {
      mockedGetClientBySlug.mockResolvedValue(null);

      const result = await isSlugUnique('new-client');

      expect(result).toBe(true);
      expect(mockedGetClientBySlug).toHaveBeenCalledWith('new-client');
    });

    it('should return false when slug already exists', async () => {
      mockedGetClientBySlug.mockResolvedValue({
        id: 'existing-id',
        name: 'Existing Client',
        slug: 'existing-slug',
        status: 'active',
        createdAt: '2024-01-01',
      });

      const result = await isSlugUnique('existing-slug');

      expect(result).toBe(false);
    });

    it('should return true when updating same client (excludeId)', async () => {
      const existingClient = {
        id: 'client-123',
        name: 'My Client',
        slug: 'my-slug',
        status: 'active' as const,
        createdAt: '2024-01-01',
      };
      mockedGetClientBySlug.mockResolvedValue(existingClient);

      // 같은 클라이언트 수정 시에는 자신의 slug는 허용
      const result = await isSlugUnique('my-slug', 'client-123');

      expect(result).toBe(true);
    });

    it('should return false when slug exists for different client', async () => {
      const existingClient = {
        id: 'client-456',
        name: 'Other Client',
        slug: 'taken-slug',
        status: 'active' as const,
        createdAt: '2024-01-01',
      };
      mockedGetClientBySlug.mockResolvedValue(existingClient);

      // 다른 클라이언트의 slug는 사용 불가
      const result = await isSlugUnique('taken-slug', 'client-123');

      expect(result).toBe(false);
    });
  });

  describe('escapeAirtableFormula', () => {
    it('should escape double quotes', () => {
      expect(escapeAirtableFormula('test"value')).toBe('test\\"value');
    });

    it('should escape backslashes', () => {
      expect(escapeAirtableFormula('test\\value')).toBe('test\\\\value');
    });

    it('should handle multiple special characters', () => {
      expect(escapeAirtableFormula('a"b\\c"d')).toBe('a\\"b\\\\c\\"d');
    });

    it('should return original for safe strings', () => {
      expect(escapeAirtableFormula('safe-slug-123')).toBe('safe-slug-123');
    });

    it('should handle empty string', () => {
      expect(escapeAirtableFormula('')).toBe('');
    });

    it('should prevent injection attempts', () => {
      // 시도: {slug} = "" OR 1=1 OR {slug} = ""
      const maliciousInput = '" OR 1=1 OR {slug} = "';
      const escaped = escapeAirtableFormula(maliciousInput);
      // 이스케이프 후: \" OR 1=1 OR {slug} = \"
      expect(escaped).toBe('\\" OR 1=1 OR {slug} = \\"');
      // 쿼리에 삽입되면: {slug} = "\" OR 1=1 OR {slug} = \""
      // 문자열 리터럴로 처리됨
    });

    it('should handle null/undefined gracefully', () => {
      expect(escapeAirtableFormula(null as unknown as string)).toBe('');
      expect(escapeAirtableFormula(undefined as unknown as string)).toBe('');
    });

    it('should handle formula injection attempts', () => {
      // Airtable formula 함수 삽입 시도
      const formulaInjection = 'test", RECORD_ID(), "';
      const escaped = escapeAirtableFormula(formulaInjection);
      expect(escaped).toBe('test\\", RECORD_ID(), \\"');
    });
  });
});
