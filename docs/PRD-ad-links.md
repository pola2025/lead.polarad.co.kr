# PRD: 광고 추적 링크 기능

## 개요

클라이언트가 광고별 전용 URL을 생성하여 UTM 파라미터 없이도 광고 유입처를 추적할 수 있는 기능

## 문제점

- 현재 UTM 파라미터 방식(`?utm_source=meta&utm_ad=광고명`)은 Meta 광고에서 설정이 복잡함
- 파라미터 오타 발생 시 추적 누락
- 광고주가 URL 파라미터 개념을 이해하기 어려움

## 해결 방안

광고별 전용 슬러그 URL 생성 → 자동으로 UTM 매핑

```
기존: lead.polarad.co.kr/l/richsuccess?utm_source=meta&utm_ad=신규광고
개선: lead.polarad.co.kr/l/richsuccess/meta-신규
```

## 기능 상세

### 1. URL 구조

```
/l/{클라이언트슬러그}/{광고슬러그}
```

예시:
- `/l/richsuccess/meta-1월캠페인`
- `/l/richsuccess/naver-브랜드`
- `/l/richsuccess/google-검색`

### 2. 데이터 모델

```typescript
interface AdLink {
  slug: string;      // URL 슬러그 (예: meta-신규)
  utmSource: string; // 광고 소스 (meta, naver, google)
  utmAd: string;     // 광고명
  memo?: string;     // 메모
}
```

Client 모델에 `adLinks: AdLink[]` 필드 추가

### 3. 기능 목록

| 기능 | 설명 | 위치 |
|------|------|------|
| 광고 링크 생성 | 슬러그, 소스, 광고명 입력하여 생성 | 클라이언트 관리 페이지 |
| 광고 링크 목록 | 생성된 링크 목록 및 복사 버튼 | 클라이언트 관리 페이지 |
| 광고 링크 삭제 | 불필요한 링크 삭제 | 클라이언트 관리 페이지 |
| 랜딩 페이지 라우팅 | /l/[slug]/[adSlug] 접속 시 UTM 자동 적용 | 랜딩 페이지 |
| 텔레그램 알림 | 광고 출처 표시 | 텔레그램 봇 |
| 접수 내역 표시 | 광고 출처 컬럼 | 포털 접수내역 |
| 통계 표시 | 광고별 접수 현황 | 포털 통계 |

### 4. 사용자 플로우

#### 4.1 관리자/클라이언트

1. 클라이언트 관리 페이지 접속
2. "광고 링크" 섹션에서 새 링크 추가
3. 슬러그(예: `meta-신규`), 소스(`meta`), 광고명(`신규광고`) 입력
4. 생성된 URL 복사
5. Meta 광고 관리자에 URL 붙여넣기

#### 4.2 리드 접수

1. 사용자가 광고 클릭 → `/l/richsuccess/meta-신규` 접속
2. 시스템이 `meta-신규` 슬러그로 AdLink 조회
3. UTM 정보(source: meta, ad: 신규광고) 자동 적용
4. 폼 제출 시 UTM 정보와 함께 저장
5. 텔레그램 알림에 광고 출처 표시

## 구현 계획

### Phase 1: 백엔드

1. [ ] types/index.ts - AdLink 타입 추가 ✅
2. [ ] Airtable Clients 테이블 - adLinks 필드 추가
3. [ ] airtable.ts - parseClientRecord에 adLinks 파싱 추가
4. [ ] airtable.ts - updateClient에 adLinks 저장 추가
5. [ ] /l/[slug]/[adSlug]/page.tsx - 광고 링크 라우트 생성

### Phase 2: 프론트엔드

1. [ ] 클라이언트 관리 페이지 - 광고 링크 관리 UI
2. [ ] 광고 링크 복사 버튼 추가

### Phase 3: 통합

1. [ ] 텔레그램 알림에 광고 출처 표시 (이미 구현됨)
2. [ ] 포털 접수내역에 광고 출처 표시 (이미 구현됨)
3. [ ] 포털 통계에 광고별 현황 표시 (이미 구현됨)

## Airtable 스키마 변경

Clients 테이블에 필드 추가:
- `adLinks` (Long text) - JSON 형식으로 저장

## API 변경

없음 (기존 클라이언트 API 사용)

## 테스트 계획

1. 광고 링크 생성/수정/삭제
2. 광고 링크 URL 접속 시 UTM 자동 적용 확인
3. 리드 저장 시 UTM 정보 포함 확인
4. 텔레그램 알림에 광고 출처 표시 확인
5. 포털 통계에 광고별 수치 표시 확인

## 일정

- 구현: 1시간
- 테스트: 30분
- 배포: 즉시 (Vercel 자동)
