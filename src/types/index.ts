// 클라이언트 상태
export type ClientStatus = "active" | "inactive" | "pending";

// 리드 상태
export type LeadStatus = "kakao_login" | "new" | "contacted" | "converted" | "blacklist";

// 블랙리스트 타입
export type BlacklistType = "phone" | "kakaoId" | "ip" | "keyword";

// 폼 필드 입력 타입
export type FormFieldInputType = "text" | "phone" | "email" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox";

// 선택 옵션 (select, radio, checkbox용)
export interface FormFieldOption {
  value: string;
  label: string;
  triggersFields?: string[];  // 이 옵션 선택 시 표시할 필드 ID 목록
}

// 조건부 표시 설정
export interface FormFieldCondition {
  dependsOn: string;           // 의존하는 필드 ID
  showWhen: string | string[]; // 해당 값일 때 표시
}

// 상품 특징/혜택 항목
export interface ProductFeature {
  id: string;
  icon?: string;    // 이모지 또는 체크 아이콘 (기본: ✓)
  text: string;     // 특징 텍스트
}

// 폼 필드 설정
export interface FormField {
  id: string;
  type: FormFieldInputType;
  label: string;
  placeholder?: string;
  required: boolean;
  enabled: boolean;
  order: number;
  options?: FormFieldOption[];      // select, radio, checkbox용
  condition?: FormFieldCondition;   // 조건부 표시
}

// ==================== 프리셋 필드 (자주 쓰는 필드) ====================

// 기본 필드 (항상 표시)
export const PRESET_BASIC_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "이름", placeholder: "홍길동", required: true, enabled: true, order: 0 },
  { id: "phone", type: "phone", label: "연락처", placeholder: "010-1234-5678", required: true, enabled: true, order: 1 },
];

// 선택 가능한 프리셋 필드
export const PRESET_OPTIONAL_FIELDS: FormField[] = [
  { id: "email", type: "email", label: "이메일", placeholder: "example@email.com", required: false, enabled: false, order: 10 },
  { id: "businessName", type: "text", label: "회사/사업자명", placeholder: "회사명 입력", required: false, enabled: false, order: 11 },
  { id: "businessNumber", type: "text", label: "사업자등록번호", placeholder: "000-00-00000", required: false, enabled: false, order: 12 },
  { id: "address", type: "text", label: "주소", placeholder: "주소를 입력하세요", required: false, enabled: false, order: 13 },
  { id: "birthdate", type: "date", label: "생년월일", placeholder: "1990-01-01", required: false, enabled: false, order: 14 },
  { id: "gender", type: "radio", label: "성별", required: false, enabled: false, order: 15, options: [
    { value: "male", label: "남성" },
    { value: "female", label: "여성" },
  ]},
  { id: "age", type: "select", label: "연령대", required: false, enabled: false, order: 16, options: [
    { value: "20s", label: "20대" },
    { value: "30s", label: "30대" },
    { value: "40s", label: "40대" },
    { value: "50s", label: "50대" },
    { value: "60+", label: "60대 이상" },
  ]},
  { id: "budget", type: "select", label: "예산", required: false, enabled: false, order: 17, options: [
    { value: "under-100", label: "100만원 미만" },
    { value: "100-500", label: "100~500만원" },
    { value: "500-1000", label: "500~1000만원" },
    { value: "1000+", label: "1000만원 이상" },
  ]},
  { id: "referral", type: "select", label: "유입 경로", required: false, enabled: false, order: 18, options: [
    { value: "search", label: "검색" },
    { value: "sns", label: "SNS" },
    { value: "ad", label: "광고" },
    { value: "referral", label: "지인 추천" },
    { value: "other", label: "기타" },
  ]},
  { id: "memo", type: "textarea", label: "문의사항", placeholder: "문의 내용을 입력하세요", required: false, enabled: false, order: 99 },
];

// 전체 기본 필드 (기존 호환용)
export const DEFAULT_FORM_FIELDS: FormField[] = [
  ...PRESET_BASIC_FIELDS,
  { id: "email", type: "email", label: "이메일", placeholder: "example@email.com", required: true, enabled: true, order: 2 },
  { id: "businessName", type: "text", label: "회사/사업자명", placeholder: "회사명 입력", required: false, enabled: false, order: 3 },
  { id: "address", type: "text", label: "주소", placeholder: "주소를 입력하세요", required: false, enabled: false, order: 4 },
  { id: "birthdate", type: "date", label: "생년월일", placeholder: "1990-01-01", required: false, enabled: false, order: 5 },
  { id: "memo", type: "textarea", label: "문의사항", placeholder: "문의 내용을 입력하세요", required: false, enabled: false, order: 6 },
];

// ==================== 업종별 폼 템플릿 ====================

// 경영컨설팅 템플릿 (정책자금, 기업컨설팅 등)
export const CONSULTING_FORM_TEMPLATE: FormField[] = [
  { id: "name", type: "text", label: "이름", placeholder: "홍길동", required: true, enabled: true, order: 0 },
  { id: "phone", type: "phone", label: "연락처", placeholder: "010-1234-5678", required: true, enabled: true, order: 1 },
  { id: "email", type: "email", label: "이메일", placeholder: "example@email.com", required: true, enabled: true, order: 2 },
  { id: "custom_industry", type: "text", label: "업종", placeholder: "업종을 작성해주세요", required: true, enabled: true, order: 3 },
  { id: "custom_businessNumber", type: "text", label: "사업자등록번호", placeholder: "제조업일 경우 필수 작성", required: false, enabled: true, order: 4 },
  { id: "custom_annualRevenue", type: "text", label: "직전년도매출", placeholder: "전년도매출을 작성해주세요", required: true, enabled: true, order: 5 },
  { id: "custom_requiredFund", type: "text", label: "필요자금", placeholder: "필요하신 자금 규모", required: true, enabled: true, order: 6 },
  { id: "custom_preferredTime", type: "text", label: "상담희망시간", placeholder: "원하시는 시간을 남겨주세요", required: true, enabled: true, order: 7 },
  // 비활성화 상태의 선택 가능한 필드들
  { id: "businessName", type: "text", label: "회사/사업자명", placeholder: "회사명 입력", required: false, enabled: false, order: 10 },
  { id: "address", type: "text", label: "주소", placeholder: "주소를 입력하세요", required: false, enabled: false, order: 11 },
  { id: "birthdate", type: "date", label: "생년월일", placeholder: "1990-01-01", required: false, enabled: false, order: 12 },
  { id: "memo", type: "textarea", label: "문의사항", placeholder: "문의 내용을 입력하세요", required: false, enabled: false, order: 99 },
];

// 폼 템플릿 목록
export const FORM_TEMPLATES = {
  default: { name: "기본", fields: DEFAULT_FORM_FIELDS },
  consulting: { name: "경영컨설팅", fields: CONSULTING_FORM_TEMPLATE },
} as const;

export type FormTemplateKey = keyof typeof FORM_TEMPLATES;

// 클라이언트
export interface Client {
  id: string;
  name: string;
  slug: string;
  status: ClientStatus;
  kakaoClientId?: string;
  kakaoClientSecret?: string;
  telegramChatId?: string;
  slackChannelId?: string; // 클라이언트별 슬랙 채널 ID
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
  // 폼 필드 설정 (JSON 문자열로 저장)
  formFields?: FormField[];
  // 상품 특징/혜택 리스트
  productFeatures?: ProductFeature[];
  // 고객 알림 설정
  smsEnabled?: boolean; // SMS 알림 활성화
  smsTemplate?: string; // SMS 템플릿 ({name}, {clientName}, {date} 변수 사용)
  emailEnabled?: boolean; // 이메일 알림 활성화
  emailSubject?: string; // 이메일 제목
  emailTemplate?: string; // 이메일 본문 템플릿
  // NCP SENS 설정 (클라이언트별)
  ncpAccessKey?: string;
  ncpSecretKey?: string;
  ncpServiceId?: string;
  ncpSenderPhone?: string;
  // 운영시간 설정
  operatingDays?: 'weekdays' | 'everyday'; // 주중 또는 연중무휴
  operatingStartTime?: string; // 시작시간 (HH:mm)
  operatingEndTime?: string; // 종료시간 (HH:mm)
  // OG 이미지 URL
  ogImageUrl?: string;
  // 포털 비밀번호 (해시 저장)
  portalPassword?: string;
  // 푸터 사업자 정보
  footerCompanyName?: string; // 회사명/사업자명
  footerCeo?: string; // 대표자명
  footerBusinessNumber?: string; // 사업자등록번호
  footerEcommerceNumber?: string; // 통신판매업 번호
  footerAddress?: string; // 주소
  footerPhone?: string; // 전화번호
  footerEmail?: string; // 이메일
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
  address?: string;
  birthdate?: string;
  status: LeadStatus;
  memo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  // 커스텀 필드 (custom_로 시작하는 필드들)
  customFields?: Record<string, string>;
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
