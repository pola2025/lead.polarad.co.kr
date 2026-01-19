# polarlead 어드민 시스템

## 프로젝트 개요

**목적**: 리드 수집 랜딩 페이지 상품의 관리 시스템

**상품 정보**:
- 가격: 39만6천원 (VAT 포함)
- 포함: 1년간 접수 자동화
- 수정비: 건당 3.3만원
- 타겟: 소상공인

## 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Airtable |
| Auth | NextAuth.js (추후) |
| Deploy | Vercel |

## 경로 및 URL

| 항목 | 값 |
|------|-----|
| **로컬 경로** | `F:\polasales\lead.polarad.co.kr` |
| **도메인** | `lead.polarad.co.kr` |
| **GitHub** | (생성 예정) |
| **Vercel** | `mkt9834-4301s-projects/lead-polarad-co-kr` |

## Airtable 설정

| 항목 | 값 |
|------|-----|
| **Base ID** | `appyvTlolbRo05LrN` |
| **Base URL** | https://airtable.com/appyvTlolbRo05LrN |

### 테이블 구조

#### 1. Clients (클라이언트 관리)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Auto | 자동 생성 ID |
| name | Text | 클라이언트명 (상호) |
| slug | Text | URL용 슬러그 |
| status | Select | `active` / `inactive` / `pending` |
| kakaoClientId | Text | 카카오 앱 Client ID |
| kakaoClientSecret | Text | 카카오 앱 Client Secret |
| telegramChatId | Text | 텔레그램 채팅 ID |
| landingTitle | Text | 랜딩 페이지 제목 |
| landingDescription | Text | 랜딩 페이지 설명 |
| primaryColor | Text | 브랜드 컬러 (HEX) |
| logoUrl | URL | 로고 이미지 URL |
| contractStart | Date | 계약 시작일 |
| contractEnd | Date | 계약 종료일 |
| createdAt | DateTime | 등록일 |

#### 2. Leads (접수 내역)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Auto | 자동 생성 ID |
| clientId | Link | Clients 테이블 연결 |
| name | Text | 접수자 이름 |
| phone | Text | 연락처 |
| email | Email | 이메일 |
| businessName | Text | 상호명 |
| industry | Text | 업종 |
| kakaoId | Text | 카카오 고유 ID |
| status | Select | `new` / `contacted` / `converted` / `spam` |
| memo | Long Text | 관리자 메모 |
| ipAddress | Text | 접수 IP |
| userAgent | Text | 브라우저 정보 |
| createdAt | DateTime | 접수일시 |

#### 3. Blacklist (차단 목록)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | Auto | 자동 생성 ID |
| clientId | Link | Clients 연결 (null=전역) |
| type | Select | `phone` / `kakaoId` / `ip` / `keyword` |
| value | Text | 차단할 값 |
| reason | Text | 차단 사유 |
| createdAt | DateTime | 등록일 |

## 환경변수

```env
# Airtable
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=appyvTlolbRo05LrN

# 테이블 ID (Airtable에서 생성 후 입력)
AIRTABLE_CLIENTS_TABLE_ID=
AIRTABLE_LEADS_TABLE_ID=
AIRTABLE_BLACKLIST_TABLE_ID=

# Telegram (어드민 알림용)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
```

## 어드민 기능

### 1. 클라이언트 관리
- 클라이언트 목록 조회
- 클라이언트 등록/수정/삭제
- 활성화/비활성화 토글
- 카카오 앱 설정
- 텔레그램 알림 설정
- 랜딩 페이지 설정 (제목, 설명, 컬러, 로고)

### 2. 리드 관리
- 리드 목록 조회 (필터: 클라이언트, 상태, 날짜)
- 리드 상세 보기/수정
- 상태 변경 (new → contacted → converted / spam)
- 메모 추가
- 블랙리스트 추가

### 3. 블랙리스트 관리
- 차단 목록 조회
- 차단 추가/삭제
- 전역/클라이언트별 차단

### 4. 통계 대시보드
- 전체 리드 현황
- 클라이언트별 리드 현황
- 일별/주별/월별 추이
- 전환율 통계

## 관련 프로젝트

| 프로젝트 | 경로 | 설명 |
|---------|------|------|
| 고객용 리드 랜딩 | `F:\polasales\workers\polarlead` | Cloudflare Workers |
| 상품 판매 랜딩 | (예정) | 상품 홍보/판매 페이지 |

---

**생성일**: 2025-01-19
**마지막 수정**: 2025-01-19
