/**
 * 클라이언트 포털 리드 통계 API 테스트
 * TDD: 테스트 먼저 작성 → API 구현
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock 모듈
vi.mock('@/lib/airtable', () => ({
  getClientBySlug: vi.fn(),
  getLeadsByClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'portal_test-client') {
        return { value: 'valid-token' };
      }
      return undefined;
    }),
  })),
}));

import { getClientBySlug, getLeadsByClient } from '@/lib/airtable';

describe('Portal Leads Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/portal/[slug]/leads-stats', () => {
    it('인증 없이 접근 시 401 반환', async () => {
      // 인증 없는 쿠키 모킹
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn(() => undefined),
      } as unknown as ReturnType<typeof cookies>);

      // API 호출 시뮬레이션
      const response = await simulateApiCall('no-auth-client');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('인증이 필요합니다.');
    });

    it('클라이언트가 없을 경우 404 반환', async () => {
      vi.mocked(getClientBySlug).mockResolvedValue(null);

      const response = await simulateApiCall('non-existent');

      expect(response.status).toBe(404);
    });

    it('리드 통계를 정상적으로 반환', async () => {
      // Mock 데이터 설정
      const mockClient = {
        id: 'client-1',
        slug: 'test-client',
        leadsTableId: 'tbl123',
      };

      const mockLeads = [
        // 오늘 - 접수 완료
        { id: '1', status: 'new', kakaoId: 'kakao1', createdAt: getTodayISO() },
        // 오늘 - 카카오 로그인만
        { id: '2', status: 'kakao_login', kakaoId: 'kakao2', createdAt: getTodayISO() },
        // 7일 내 - 접수 완료
        { id: '3', status: 'contacted', kakaoId: 'kakao3', createdAt: getDaysAgoISO(3) },
        // 7일 내 - 카카오 로그인만
        { id: '4', status: 'kakao_login', kakaoId: 'kakao4', createdAt: getDaysAgoISO(5) },
        // 30일 내 - 접수 완료
        { id: '5', status: 'converted', kakaoId: 'kakao5', createdAt: getDaysAgoISO(15) },
        // 30일 초과 - 제외됨
        { id: '6', status: 'new', kakaoId: 'kakao6', createdAt: getDaysAgoISO(35) },
      ];

      vi.mocked(getClientBySlug).mockResolvedValue(mockClient as never);
      vi.mocked(getLeadsByClient).mockResolvedValue(mockLeads as never);

      const response = await simulateApiCall('test-client');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const { data } = response.body;

      // 리드 수 검증
      expect(data.today.leads).toBe(2); // id 1, 2
      expect(data.week.leads).toBe(4);  // id 1, 2, 3, 4
      expect(data.month.leads).toBe(5); // id 1, 2, 3, 4, 5

      // 접수 완료 수 검증 (status !== 'kakao_login' && status !== 'spam')
      expect(data.today.submissions).toBe(1); // id 1
      expect(data.week.submissions).toBe(2);  // id 1, 3
      expect(data.month.submissions).toBe(3); // id 1, 3, 5

      // 퍼널 데이터 검증
      expect(data.funnel).toBeDefined();
      expect(data.funnel.logins).toBe(5);      // 30일 내 카카오 로그인 전체
      expect(data.funnel.submissions).toBe(3); // 30일 내 접수 완료
    });

    it('일별 리드 추이 데이터 반환', async () => {
      const mockClient = {
        id: 'client-1',
        slug: 'test-client',
        leadsTableId: 'tbl123',
      };

      const mockLeads = [
        { id: '1', status: 'new', kakaoId: 'k1', createdAt: getTodayISO() },
        { id: '2', status: 'new', kakaoId: 'k2', createdAt: getTodayISO() },
        { id: '3', status: 'new', kakaoId: 'k3', createdAt: getDaysAgoISO(1) },
      ];

      vi.mocked(getClientBySlug).mockResolvedValue(mockClient as never);
      vi.mocked(getLeadsByClient).mockResolvedValue(mockLeads as never);

      const response = await simulateApiCall('test-client');

      expect(response.body.data.daily).toBeDefined();
      expect(Array.isArray(response.body.data.daily)).toBe(true);

      // 일별 데이터가 날짜별로 집계되어야 함
      const todayData = response.body.data.daily.find(
        (d: { date: string }) => d.date === formatDate(new Date())
      );
      expect(todayData?.leads).toBe(2);
    });
  });
});

// 헬퍼 함수들
function getTodayISO(): string {
  return new Date().toISOString();
}

function getDaysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

// API 시뮬레이션 (실제 구현 전 테스트용)
async function simulateApiCall(slug: string): Promise<{
  status: number;
  body: { success: boolean; error?: string; data?: unknown };
}> {
  // 실제 API 구현 후 이 부분을 실제 호출로 교체
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const authToken = cookieStore.get(`portal_${slug}`)?.value;

  if (!authToken) {
    return {
      status: 401,
      body: { success: false, error: '인증이 필요합니다.' },
    };
  }

  const client = await getClientBySlug(slug);
  if (!client) {
    return {
      status: 404,
      body: { success: false, error: '클라이언트를 찾을 수 없습니다.' },
    };
  }

  const leads = await getLeadsByClient(client.id, client.leadsTableId!);

  // 날짜 계산
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  // 기간별 필터링
  const todayLeads = leads.filter(l => new Date(l.createdAt) >= today);
  const weekLeads = leads.filter(l => new Date(l.createdAt) >= weekAgo);
  const monthLeads = leads.filter(l => new Date(l.createdAt) >= monthAgo);

  // 접수 완료 필터 (status !== 'kakao_login' && status !== 'spam')
  const isSubmitted = (l: { status: string }) =>
    l.status !== 'kakao_login' && l.status !== 'spam';

  // 일별 집계
  const dailyMap = new Map<string, number>();
  monthLeads.forEach(lead => {
    const date = formatDate(new Date(lead.createdAt));
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });
  const daily = Array.from(dailyMap.entries())
    .map(([date, leads]) => ({ date, leads }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    status: 200,
    body: {
      success: true,
      data: {
        today: {
          leads: todayLeads.length,
          submissions: todayLeads.filter(isSubmitted).length,
        },
        week: {
          leads: weekLeads.length,
          submissions: weekLeads.filter(isSubmitted).length,
        },
        month: {
          leads: monthLeads.length,
          submissions: monthLeads.filter(isSubmitted).length,
        },
        funnel: {
          logins: monthLeads.length,
          submissions: monthLeads.filter(isSubmitted).length,
        },
        daily,
      },
    },
  };
}
