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
