// 클라이언트 상태
export type ClientStatus = "active" | "inactive" | "pending";

// 리드 상태
export type LeadStatus = "new" | "contacted" | "converted" | "spam";

// 블랙리스트 타입
export type BlacklistType = "phone" | "kakaoId" | "ip" | "keyword";

// 클라이언트
export interface Client {
  id: string;
  name: string;
  slug: string;
  status: ClientStatus;
  kakaoClientId?: string;
  kakaoClientSecret?: string;
  telegramChatId?: string;
  landingTitle?: string;
  landingDescription?: string;
  primaryColor?: string;
  logoUrl?: string;
  contractStart?: string;
  contractEnd?: string;
  leadsTableId?: string; // 클라이언트 전용 Leads 테이블 ID
  // 랜딩 페이지 커스터마이징
  ctaButtonText?: string; // CTA 버튼 텍스트 (기본: "상담 신청하기")
  thankYouTitle?: string; // 완료 페이지 제목 (기본: "신청이 완료되었습니다")
  thankYouMessage?: string; // 완료 페이지 메시지
  createdAt: string;
}

// 리드
export interface Lead {
  id: string;
  clientId: string;
  clientName?: string; // 조인된 데이터
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  industry?: string;
  kakaoId?: string;
  status: LeadStatus;
  memo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// 블랙리스트
export interface Blacklist {
  id: string;
  clientId?: string;
  clientName?: string; // 조인된 데이터
  type: BlacklistType;
  value: string;
  reason?: string;
  createdAt: string;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 페이지네이션
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 목록 응답
export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}

// 통계
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalLeads: number;
  monthlyLeads: number;
  conversionRate: number;
  blacklistCount: number;
}

// 일별 통계
export interface DailyStats {
  date: string;
  leads: number;
  converted: number;
}
