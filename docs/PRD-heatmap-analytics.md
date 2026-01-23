# PRD: 클라이언트 포털 히트맵 & 통계 개선

## 1. 개요

### 1.1 배경
- 클라이언트에게 랜딩페이지 방문자 행동 분석 제공 필요
- 외부 서비스(Clarity) 의존 시 API 제한(하루 10회)으로 다중 클라이언트 서비스 불가
- 직접 구현으로 제한 없는 히트맵 서비스 제공

### 1.2 목표
- **히트맵**: 랜딩페이지 클릭/터치 위치 시각화
- **통계 개선**: 전환율 중심 대시보드 재구성
- **지역 분석**: IP 기반 세부 지역(서울 구, 경기 시) 분석

---

## 2. 기능 요구사항

### 2.1 히트맵 시스템

#### 2.1.1 클릭 데이터 수집
| 항목 | 설명 |
|------|------|
| 좌표 | x, y (뷰포트 기준 비율 %) |
| 뷰포트 | width, height |
| 요소 | 클릭한 요소 selector (예: button.cta) |
| 디바이스 | mobile / desktop / tablet |
| 타임스탬프 | ISO 8601 |
| 세션 ID | 익명 세션 식별자 |

#### 2.1.2 히트맵 렌더링
- **라이브러리**: [heatmap.js](https://github.com/pa7/heatmap.js)
- **렌더링 방식**: Canvas 오버레이
- **데이터 표시**: 클릭 밀도 (빨강=높음, 파랑=낮음)
- **필터**: 기간별 (7일/30일/90일), 디바이스별

#### 2.1.3 히트맵 뷰 옵션
- **클릭 히트맵**: 터치/클릭 위치 밀집도
- **요소별 클릭 수**: 버튼/링크별 클릭 횟수 표시

---

### 2.2 통계 대시보드 개선

#### 2.2.1 레이아웃 (위→아래)

```
┌─────────────────────────────────────┐
│  ① 전환율 히어로 (30일 전환율 12%)   │
│     542 방문 → 65 접수              │
│     로그인율 23% | 접수율 51%        │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  ② 전환 퍼널                        │
│     방문 ████████████████ 542명 100%│
│     로그인 ████           127명  23%│
│     접수   ██              65명  12%│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  ③ 기기별 방문자 (아코디언)          │
│     📱 모바일      78% (423명)   ▼  │
│        🤖 Android  62%              │
│        🍎 iOS      38%              │
│     💻 데스크톱    19% (103명)   ▶  │
│     📟 태블릿       3% (16명)    ▶  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  ④ 지역별 방문자 (IP 기반)          │
│     서울 강남구  ████████    18%    │
│     서울 서초구  ██████      12%    │
│     경기 성남시  █████       10%    │
│     서울 송파구  ████         8%    │
│     인천         ███          6%    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  ⑤ 히트맵 (임베드)                  │
│     [랜딩페이지 스크린샷 + 오버레이]  │
│     클릭 밀집도 시각화               │
└─────────────────────────────────────┘
```

#### 2.2.2 기간 필터
- 7일 / 30일 / 90일 버튼
- 모든 통계에 동일하게 적용

---

### 2.3 IP 기반 지역 분석

#### 2.3.1 수집 데이터
| 항목 | 설명 |
|------|------|
| IP 주소 | 방문자 IP (해시 처리 권장) |
| 지역 정보 | IP Geolocation API로 조회 |

#### 2.3.2 지역 분류 기준
| 지역 | 세부 단위 |
|------|----------|
| 서울 | 구 단위 (강남구, 서초구 등) |
| 경기 | 시 단위 (성남시, 수원시 등) |
| 그 외 | 도시명 (부산, 대전, 대구 등) |

#### 2.3.3 IP Geolocation API 옵션
| 서비스 | 무료 한도 | 정확도 |
|--------|----------|--------|
| [ipinfo.io](https://ipinfo.io) | 50,000/월 | 높음 |
| [ip-api.com](https://ip-api.com) | 45/분 | 중간 |
| [ipapi.co](https://ipapi.co) | 1,000/일 | 중간 |
| MaxMind GeoLite2 (로컬) | 무제한 | 높음 |

**권장**: MaxMind GeoLite2 DB 로컬 설치 (무료, 무제한)

---

## 3. 기술 설계

### 3.1 데이터 모델

#### 3.1.1 클릭 이벤트 테이블 (heatmap_clicks)
```sql
CREATE TABLE heatmap_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  x_percent DECIMAL(5,2) NOT NULL,  -- 0.00 ~ 100.00
  y_percent DECIMAL(5,2) NOT NULL,
  viewport_width INT NOT NULL,
  viewport_height INT NOT NULL,
  element_selector VARCHAR(200),
  device_type VARCHAR(20),  -- mobile, desktop, tablet
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_heatmap_clicks_slug ON heatmap_clicks(client_slug);
CREATE INDEX idx_heatmap_clicks_created ON heatmap_clicks(created_at);
```

#### 3.1.2 방문 지역 테이블 (visitor_locations)
```sql
CREATE TABLE visitor_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  ip_hash VARCHAR(64),  -- SHA256 해시 (개인정보 보호)
  country VARCHAR(50),
  region VARCHAR(50),   -- 시/도
  city VARCHAR(50),     -- 구/시
  device_type VARCHAR(20),
  os VARCHAR(50),       -- Android, iOS, Windows, macOS
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visitor_locations_slug ON visitor_locations(client_slug);
CREATE INDEX idx_visitor_locations_created ON visitor_locations(created_at);
```

### 3.2 API 엔드포인트

#### 3.2.1 클릭 수집 API
```
POST /api/heatmap/collect

Request:
{
  "slug": "polamkt",
  "sessionId": "abc123",
  "x": 45.5,        // x 좌표 (%)
  "y": 32.1,        // y 좌표 (%)
  "viewportWidth": 375,
  "viewportHeight": 667,
  "element": "button.cta-kakao",
  "deviceType": "mobile"
}

Response:
{ "success": true }
```

#### 3.2.2 히트맵 데이터 조회 API
```
GET /api/portal/[slug]/heatmap?period=30d&device=mobile

Response:
{
  "success": true,
  "data": {
    "points": [
      { "x": 45.5, "y": 32.1, "value": 150 },
      { "x": 50.2, "y": 45.3, "value": 89 },
      ...
    ],
    "elements": [
      { "selector": "button.cta-kakao", "clicks": 342 },
      { "selector": "a.faq", "clicks": 45 }
    ],
    "total": 1250
  }
}
```

#### 3.2.3 지역 통계 API
```
GET /api/portal/[slug]/locations?period=30d

Response:
{
  "success": true,
  "data": {
    "locations": [
      { "region": "서울", "city": "강남구", "count": 98, "percentage": 18 },
      { "region": "서울", "city": "서초구", "count": 65, "percentage": 12 },
      { "region": "경기", "city": "성남시", "count": 54, "percentage": 10 },
      ...
    ],
    "devices": {
      "mobile": { "total": 423, "percentage": 78, "os": { "Android": 62, "iOS": 38 } },
      "desktop": { "total": 103, "percentage": 19, "os": { "Windows": 70, "macOS": 30 } },
      "tablet": { "total": 16, "percentage": 3 }
    }
  }
}
```

### 3.3 클라이언트 수집 스크립트

```javascript
// 랜딩페이지에 추가할 스크립트
(function() {
  const slug = '{{CLIENT_SLUG}}';
  const sessionId = sessionStorage.getItem('heatmap_session')
    || (sessionStorage.setItem('heatmap_session', crypto.randomUUID()), sessionStorage.getItem('heatmap_session'));

  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  document.addEventListener('click', (e) => {
    const rect = document.documentElement.getBoundingClientRect();
    const x = ((e.clientX / window.innerWidth) * 100).toFixed(2);
    const y = ((e.clientY / window.innerHeight) * 100).toFixed(2);

    // 클릭한 요소의 selector 생성
    let element = e.target.tagName.toLowerCase();
    if (e.target.id) element += '#' + e.target.id;
    if (e.target.className) element += '.' + e.target.className.split(' ').join('.');

    fetch('/api/heatmap/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        sessionId,
        x: parseFloat(x),
        y: parseFloat(y),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        element,
        deviceType: getDeviceType()
      })
    }).catch(() => {});  // 에러 무시 (UX 영향 없도록)
  });
})();
```

---

## 4. UI/UX 상세

### 4.1 히트맵 뷰어 컴포넌트

```
┌─────────────────────────────────────────┐
│ 히트맵                    [7일][30일][90일] │
├─────────────────────────────────────────┤
│  필터: [전체 ▼] [모바일 ▼]              │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    [랜딩페이지 iframe/image]    │   │
│  │    + heatmap.js 오버레이        │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  클릭 TOP 5                            │
│  1. 카카오 로그인 버튼    342회 (27%)   │
│  2. 상담 신청 버튼        189회 (15%)   │
│  3. FAQ 섹션              45회  (4%)    │
└─────────────────────────────────────────┘
```

### 4.2 색상 범례
| 밀도 | 색상 | RGB |
|------|------|-----|
| 높음 | 빨강 | #FF0000 |
| 중간 | 노랑 | #FFFF00 |
| 낮음 | 파랑 | #0000FF |
| 없음 | 투명 | transparent |

---

## 5. 구현 우선순위

### Phase 1: 통계 UI 개선 ✅ (2026-01-23 완료)
- [x] 전환율 히어로 UI (축소 버전)
- [x] 전환 퍼널 UI (방문 → 로그인 → 접수완료)
- [x] 기기별 아코디언 (Android/iOS)
- [x] OS별 분류 (GA4 operatingSystem 연동)
- [x] 지역별 방문자 UI (GA4 city 연동)
- [x] 기간 필터 (7d/30d/90d)

**구현 내용:**
- `analytics/route.ts`: deviceOs 데이터 추가 (OS별 기기 분류)
- `leads-stats/route.ts`: 전환 퍼널 데이터 (이미 구현됨)
- `portal/[slug]/page.tsx`: v4 디자인 UI 구현

### Phase 2: 히트맵 MVP
- [ ] 클릭 수집 API (`/api/heatmap/collect`)
- [ ] 클릭 데이터 테이블 (Supabase: heatmap_clicks)
- [ ] 랜딩페이지 수집 스크립트
- [ ] 포털 히트맵 뷰어 (heatmap.js)
- [ ] 히트맵 전체화면 페이지

### Phase 3: IP 지역 분석 (상세)
- [ ] MaxMind GeoLite2 연동
- [ ] 방문 지역 테이블 (Supabase: visitor_locations)
- [ ] IP 해시 저장 (개인정보 보호)
- [ ] 서울 구/경기 시 단위 분류 로직

### Phase 4: 고도화
- [ ] 요소별 클릭 수 표시
- [ ] 스크롤 깊이 추적
- [ ] 실시간 히트맵 (WebSocket)

---

## 6. 기술 스택

| 구분 | 기술 |
|------|------|
| 히트맵 렌더링 | heatmap.js (CDN) |
| 데이터 저장 | Supabase PostgreSQL |
| IP Geolocation | MaxMind GeoLite2 (로컬) |
| 프론트엔드 | Next.js + React |
| 스타일링 | Tailwind CSS |

---

## 7. 리스크 & 대응

| 리스크 | 대응 방안 |
|--------|----------|
| 클릭 데이터 폭증 | 샘플링 (10% 저장) 또는 집계 테이블 |
| IP 정확도 한계 | VPN/프록시 사용자는 "알 수 없음" 처리 |
| 랜딩페이지 변경 시 좌표 불일치 | 뷰포트 비율(%) 저장으로 해결 |
| 개인정보 이슈 | IP 해시 처리, 세션 ID만 저장 |

---

## 8. 성공 지표

| 지표 | 목표 |
|------|------|
| 히트맵 로딩 속도 | < 2초 |
| 클릭 수집 성공률 | > 95% |
| 지역 분석 정확도 | > 80% (구/시 단위) |
| 클라이언트 만족도 | 데이터 활용 피드백 |

---

---

## 9. 완료 후 계획

### Skills 아카이브 저장

모든 Phase 완료 후, 다음 항목들을 Claude Code Skills로 저장:

| Skill 이름 | 내용 | 재사용 대상 |
|-----------|------|------------|
| `heatmap-implementation` | heatmap.js 연동, 클릭 수집/렌더링 | 다른 프로젝트 히트맵 구현 시 |
| `ip-geolocation` | MaxMind GeoLite2 연동, 지역 분류 로직 | IP 기반 지역 분석 필요 시 |
| `ga4-visitor-stats` | GA4 방문 통계 + 기기/OS 분류 | GA4 연동 대시보드 구현 시 |
| `conversion-funnel` | 전환 퍼널 UI 컴포넌트 | 퍼널 분석 UI 필요 시 |

### 저장 위치
```
~/.claude/skills/
├── heatmap-implementation/
│   └── skill.md
├── ip-geolocation/
│   └── skill.md
├── ga4-visitor-stats/
│   └── skill.md
└── conversion-funnel/
    └── skill.md
```

### 저장 시점
- Phase 1~3 모든 기능 구현 완료
- 운영 환경에서 안정성 검증 후
- 코드 정리 및 문서화 완료 후

---

**문서 버전**: 1.1
**작성일**: 2026-01-23
**최종 수정**: 2026-01-23 (Skills 저장 계획 추가)
**작성자**: Claude
