import { describe, it, expect, vi, beforeEach } from 'vitest';

// 모킹 설정
vi.mock('@/lib/airtable', () => ({
  getClientById: vi.fn(),
  createLead: vi.fn(),
  isBlacklisted: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  validatePhone: vi.fn(),
  normalizePhone: vi.fn((phone) => phone.replace(/\D/g, '')),
  validateName: vi.fn(),
  checkDuplicateLead: vi.fn(),
}));

import { getClientById, createLead, isBlacklisted } from '@/lib/airtable';
import { validatePhone, normalizePhone, validateName, checkDuplicateLead } from '@/lib/validation';

const mockedGetClientById = vi.mocked(getClientById);
const mockedCreateLead = vi.mocked(createLead);
const mockedIsBlacklisted = vi.mocked(isBlacklisted);
const mockedValidatePhone = vi.mocked(validatePhone);
const mockedValidateName = vi.mocked(validateName);
const mockedCheckDuplicateLead = vi.mocked(checkDuplicateLead);

// submitLead 함수 시뮬레이션 (실제 route 로직과 동일하게 구현)
interface SubmitLeadParams {
  clientId: string;
  name: string;
  phone: string;
  ip?: string;
  userAgent?: string;
}

interface SubmitLeadResult {
  success: boolean;
  error?: string;
  status?: number;
}

async function submitLead(params: SubmitLeadParams): Promise<SubmitLeadResult> {
  const { clientId, name, phone, ip = 'unknown', userAgent = 'unknown' } = params;

  // 필수 필드 검증
  if (!clientId || !name || !phone) {
    return { success: false, error: '필수 정보가 누락되었습니다.', status: 400 };
  }

  // 이름 검증
  if (!validateName(name)) {
    return { success: false, error: '유효한 이름을 입력해주세요.', status: 400 };
  }

  // 전화번호 검증
  if (!validatePhone(phone)) {
    return { success: false, error: '유효한 전화번호를 입력해주세요.', status: 400 };
  }

  const normalizedPhone = normalizePhone(phone);

  // 클라이언트 조회
  const client = await getClientById(clientId);
  if (!client) {
    return { success: false, error: '유효하지 않은 요청입니다.', status: 400 };
  }

  // 비활성 클라이언트 체크
  if (client.status !== 'active') {
    return { success: false, error: '현재 신청을 받지 않고 있습니다.', status: 400 };
  }

  // leadsTableId 체크
  if (!client.leadsTableId) {
    return { success: false, error: '서비스 설정이 완료되지 않았습니다.', status: 500 };
  }

  // 중복 체크
  if (checkDuplicateLead(clientId, normalizedPhone)) {
    return { success: false, error: '이미 신청하셨습니다. 잠시 후 다시 시도해주세요.', status: 429 };
  }

  // 블랙리스트 체크
  const blacklisted = await isBlacklisted(clientId, { phone: normalizedPhone, ip });
  if (blacklisted) {
    // 블랙리스트에 있어도 사용자에게는 성공처럼 보이게
    return { success: true };
  }

  // 리드 생성
  await createLead(client.leadsTableId, clientId, {
    name: name.trim(),
    phone: normalizedPhone,
    status: 'new',
    ipAddress: ip,
    userAgent: userAgent.substring(0, 500),
  });

  return { success: true };
}

describe('Lead Submit API', () => {
  const validClient = {
    id: 'client-123',
    name: 'Test Client',
    slug: 'test-client',
    status: 'active' as const,
    leadsTableId: 'tblLeads123',
    createdAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 기본 모킹 설정
    mockedGetClientById.mockResolvedValue(validClient);
    mockedValidatePhone.mockReturnValue(true);
    mockedValidateName.mockReturnValue(true);
    mockedIsBlacklisted.mockResolvedValue(false);
    mockedCheckDuplicateLead.mockReturnValue(false);
    mockedCreateLead.mockResolvedValue({
      id: 'lead-1',
      clientId: 'client-123',
      name: '홍길동',
      phone: '01012345678',
      status: 'new',
      createdAt: '2024-01-01',
    });
  });

  describe('Required fields validation', () => {
    it('should reject when clientId is missing', async () => {
      const result = await submitLead({
        clientId: '',
        name: '홍길동',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should reject when name is missing', async () => {
      const result = await submitLead({
        clientId: 'client-123',
        name: '',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should reject when phone is missing', async () => {
      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
  });

  describe('Name validation', () => {
    it('should reject invalid name', async () => {
      mockedValidateName.mockReturnValue(false);

      const result = await submitLead({
        clientId: 'client-123',
        name: '   ',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('이름');
    });
  });

  describe('Phone validation', () => {
    it('should reject invalid phone', async () => {
      mockedValidatePhone.mockReturnValue(false);

      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: 'invalid',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('전화번호');
    });
  });

  describe('Client validation', () => {
    it('should reject when client not found', async () => {
      mockedGetClientById.mockResolvedValue(null);

      const result = await submitLead({
        clientId: 'non-existent',
        name: '홍길동',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should reject when client is inactive', async () => {
      mockedGetClientById.mockResolvedValue({ ...validClient, status: 'inactive' });

      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('신청을 받지 않고');
    });

    it('should reject when leadsTableId is missing', async () => {
      mockedGetClientById.mockResolvedValue({ ...validClient, leadsTableId: undefined });

      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
    });
  });

  describe('Duplicate check', () => {
    it('should reject duplicate submission within 5 minutes', async () => {
      mockedCheckDuplicateLead.mockReturnValue(true);

      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '01012345678',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(429);
      expect(result.error).toContain('이미 신청');
    });
  });

  describe('Blacklist check', () => {
    it('should return success even for blacklisted (silent block)', async () => {
      mockedIsBlacklisted.mockResolvedValue(true);

      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '01012345678',
      });

      // 블랙리스트여도 성공처럼 보임
      expect(result.success).toBe(true);
      // 하지만 createLead는 호출되지 않음
      expect(mockedCreateLead).not.toHaveBeenCalled();
    });
  });

  describe('Successful submission', () => {
    it('should create lead with correct data', async () => {
      const result = await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '010-1234-5678',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(result.success).toBe(true);
      expect(mockedCreateLead).toHaveBeenCalledWith(
        'tblLeads123',
        'client-123',
        expect.objectContaining({
          name: '홍길동',
          phone: '01012345678',  // normalized
          status: 'new',
          ipAddress: '192.168.1.1',
        })
      );
    });

    it('should truncate long userAgent', async () => {
      const longUserAgent = 'A'.repeat(600);

      await submitLead({
        clientId: 'client-123',
        name: '홍길동',
        phone: '01012345678',
        userAgent: longUserAgent,
      });

      expect(mockedCreateLead).toHaveBeenCalledWith(
        'tblLeads123',
        'client-123',
        expect.objectContaining({
          userAgent: expect.stringMatching(/^A{500}$/),
        })
      );
    });
  });
});
