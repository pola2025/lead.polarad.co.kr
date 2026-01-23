# PRD: Pola Lead 보안 및 안정성 개선

## 문서 정보
- **버전**: 1.2.0
- **작성일**: 2026-01-20
- **최종 수정**: 2026-01-20
- **상태**: Phase 1 완료, Phase 2 Priority 1 완료

---

## 1. 배경 및 문제 정의

### 1.1 현재 상황
Pola Lead는 소상공인 대상 리드 수집 자동화 SaaS로, 관리자가 클라이언트를 등록하면 커스터마이즈된 랜딩 페이지가 생성되고 고객 폼 제출 데이터가 Airtable에 저장되는 시스템입니다.

### 1.2 발견된 문제점

#### 🔴 Critical (보안)
| ID | 문제 | 위치 | 위험도 | 상태 |
|----|------|------|--------|------|
| SEC-001 | 토큰 검증 없음 | `middleware.ts` | Critical | ✅ 해결 |
| SEC-002 | 토큰 예측 가능 | `login/route.ts` | Critical | ✅ 해결 |
| SEC-003 | 로그인 시도 무제한 | `login/route.ts` | High | ✅ 해결 |
| SEC-004 | Airtable 쿼리 인젝션 | `airtable.ts:177` | Medium | ✅ 해결 |

#### 🟠 High (비즈니스 로직)
| ID | 문제 | 위치 | 영향 | 상태 |
|----|------|------|------|------|
| BIZ-001 | 리드 중복 제출 허용 | `submit/route.ts` | 스팸/어뷰징 | ✅ 해결 |
| BIZ-002 | slug 중복 미검사 | `clients/route.ts` | 데이터 충돌 | ✅ 해결 |
| BIZ-003 | 텔레그램 알림 미구현 | `submit/route.ts` | 운영 불편 | ✅ 해결 |
| BIZ-004 | IP 블랙리스트 우회 가능 | `submit/route.ts` | 차단 무력화 | ⏳ 대기 |

#### 🟡 Medium (데이터/UX)
| ID | 문제 | 위치 | 영향 | 상태 |
|----|------|------|------|------|
| DATA-001 | 전화번호 형식 미검증 | `l/[slug]/page.tsx` | 잘못된 데이터 | ✅ 해결 |
| DATA-002 | 이름 공백 허용 | `l/[slug]/page.tsx` | 무의미한 데이터 | ✅ 해결 |
| DATA-003 | 고아 테이블 발생 가능 | `airtable.ts:253` | 데이터 불일치 | ⏳ 대기 |
| PERF-001 | 전체 리드 조회 O(n) | `airtable.ts:306` | 성능 저하 | ⏳ 대기 |

---

## 2. 구현 완료 현황

### 2.1 Phase 1 완료 (2026-01-20)

#### 생성된 모듈
| 파일 | 기능 |
|------|------|
| `src/lib/auth.ts` | 토큰 생성/검증, Rate Limiting |
| `src/lib/validation.ts` | 전화번호/이름 검증, 중복 체크 |
| `src/lib/client.ts` | Slug 유일성 검사, 이스케이프 |

#### 수정된 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/middleware.ts` | 토큰 유효성 검증 추가 |
| `src/app/api/auth/login/route.ts` | Rate Limiting, crypto.randomUUID() |
| `src/app/api/leads/submit/route.ts` | 검증, 중복방지, 텔레그램 알림 |
| `src/app/api/clients/route.ts` | Slug 중복 검사 |

#### 테스트
- **54개 테스트 통과**
- `src/__tests__/lib/auth.test.ts` (14개)
- `src/__tests__/lib/validation.test.ts` (19개)
- `src/__tests__/lib/client.test.ts` (9개)
- `src/__tests__/api/leads-submit.test.ts` (12개)

### 2.2 성공 지표 달성
| 지표 | 이전 | 현재 | 목표 |
|------|------|------|------|
| 토큰 검증 | 없음 | ✅ 100% | 100% |
| 중복 리드 | 무제한 | ✅ 5분 차단 | 5분 차단 |
| 로그인 시도 | 무제한 | ✅ 5회/분 | 5회/분 |
| 전화번호 유효성 | 0% | ✅ 100% | 100% |
| 알림 누락 | 100% | ✅ 0% | 0% |

### 2.3 Phase 2 Priority 1 완료 (2026-01-20)

#### 생성된 파일
| 파일 | 기능 |
|------|------|
| `src/app/api/auth/logout/route.ts` | 로그아웃 API |
| `src/__tests__/api/auth-logout.test.ts` | 로그아웃 테스트 (4개) |

#### 수정된 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/lib/airtable.ts` | `escapeAirtableFormula` 적용 (SEC-004 해결) |
| `src/lib/validation.ts` | `formatPhoneInput`, `isPhoneComplete` 함수 추가 |
| `src/app/l/[slug]/page.tsx` | 실시간 전화번호 포맷팅, 폼 유효성 검사 |
| `src/__tests__/lib/client.test.ts` | 이스케이프 인젝션 테스트 추가 (3개) |
| `src/__tests__/lib/validation.test.ts` | 포맷팅 테스트 추가 (10개) |

#### 테스트
- **71개 테스트 통과** (Phase 1: 54개 → Phase 2: 71개)

---

## 3. Phase 2 요구사항

### 3.1 즉시 필요 (Priority 1) ✅ 완료

#### FR-009: 로그아웃 API ✅
- **설명**: 토큰 무효화 및 쿠키 삭제
- **수락 기준**:
  - [x] POST `/api/auth/logout` 엔드포인트
  - [x] 토큰 저장소에서 토큰 삭제
  - [x] 쿠키 삭제
  - [x] 로그인 페이지로 리다이렉트

#### FR-010: Airtable 쿼리 이스케이프 적용 ✅
- **설명**: 쿼리 인젝션 방지
- **수락 기준**:
  - [x] `getClientBySlug`에 `escapeAirtableFormula` 적용
  - [x] `getBlacklist`에도 적용
  - [x] 특수문자 입력 테스트

#### FR-011: 랜딩 페이지 전화번호 실시간 포맷팅 ✅
- **설명**: 입력 중 자동 하이픈 추가
- **수락 기준**:
  - [x] 숫자만 입력 허용
  - [x] 010-1234-5678 형식 자동 포맷
  - [x] 유효하지 않으면 제출 버튼 비활성화

### 3.2 단기 필요 (Priority 2)

#### FR-012: Redis 토큰 저장소
- **설명**: 서버 재시작에도 세션 유지
- **수락 기준**:
  - [ ] Vercel KV 또는 Upstash 연동
  - [ ] 토큰 CRUD 함수 수정
  - [ ] 환경변수 설정 가이드

#### FR-013: E2E 테스트
- **설명**: 전체 사용자 흐름 테스트
- **수락 기준**:
  - [ ] Playwright 설정
  - [ ] 로그인 → 클라이언트 생성 → 리드 제출 시나리오
  - [ ] CI/CD 연동

#### FR-014: 에러 바운더리
- **설명**: React 에러 처리 개선
- **수락 기준**:
  - [ ] 전역 Error Boundary 컴포넌트
  - [ ] 에러 발생 시 친절한 UI
  - [ ] 에러 로깅 (선택)

### 3.3 중기 필요 (Priority 3)

#### FR-015: 전체 리드 조회 최적화
- **설명**: 대시보드 성능 개선
- **수락 기준**:
  - [ ] 클라이언트 목록 캐싱 (1분)
  - [ ] 페이지네이션 적용
  - [ ] 3초 이내 응답

#### FR-016: Sentry 모니터링
- **설명**: 프로덕션 에러 추적
- **수락 기준**:
  - [ ] Sentry SDK 설정
  - [ ] 에러 자동 리포팅
  - [ ] 소스맵 업로드

---

## 4. 테스트 계획 (Phase 2)

### 4.1 단위 테스트 추가
| 테스트 ID | 대상 | 테스트 케이스 |
|-----------|------|---------------|
| UT-008 | logout | 토큰 무효화 검증 |
| UT-009 | escapeAirtableFormula | 특수문자 이스케이프 |
| UT-010 | formatPhoneInput | 실시간 포맷팅 |

### 4.2 E2E 테스트
| 테스트 ID | 시나리오 |
|-----------|----------|
| E2E-001 | 로그인 → 대시보드 → 로그아웃 |
| E2E-002 | 클라이언트 생성 → 랜딩 확인 |
| E2E-003 | 리드 제출 → 목록 확인 |
| E2E-004 | 중복 제출 → 에러 메시지 |

---

## 5. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2026-01-20 | 초안 작성 | Claude |
| 1.1.0 | 2026-01-20 | Phase 1 완료, Phase 2 요구사항 추가 | Claude |
| 1.2.0 | 2026-01-20 | Phase 2 Priority 1 완료 (FR-009, FR-010, FR-011) | Claude |
