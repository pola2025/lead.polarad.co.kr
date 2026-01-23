# 카카오 로그인 설정 가이드

## 개요

pola_lead 프로젝트에 카카오 OAuth 로그인을 구현한 과정과 트러블슈팅 기록입니다.

- **구현 날짜**: 2026-01-23
- **용도**: 랜딩 페이지에서 카카오 계정 이메일 자동 입력

---

## 구현 구조

### OAuth 흐름

```
1. 사용자가 /l/{slug} 에서 카카오 버튼 클릭
                    ↓
2. /api/auth/kakao?slug={slug} 로 이동
   → state 파라미터에 slug 저장
                    ↓
3. 카카오 인증 페이지로 리다이렉트
   → redirect_uri: /api/auth/kakao/callback
                    ↓
4. 사용자가 카카오에서 로그인/동의
                    ↓
5. 카카오가 /api/auth/kakao/callback?code=xxx&state={slug} 로 리다이렉트
                    ↓
6. 콜백에서 토큰 발급 → 사용자 정보(이메일) 조회
                    ↓
7. /l/{slug}?kakao_email=xxx 로 리다이렉트
   → 이메일 폼에 자동 입력
```

### 파일 구조

```
src/app/api/auth/kakao/
├── route.ts              # 카카오 로그인 시작 (인증 페이지로 리다이렉트)
└── callback/
    └── route.ts          # 콜백 처리 (토큰 발급, 이메일 조회)

src/app/l/[slug]/
└── LandingClient.tsx     # 카카오 버튼 UI, kakao_email 쿼리 파라미터 처리
```

---

## 환경변수

```env
# .env.local
KAKAO_CLIENT_ID=2c9702212bc35eb8a1ef64a9572f22fb      # REST API 키
KAKAO_CLIENT_SECRET=Qlbum57MQ1tnwkWlmi3jsJ3QmssvqqfI  # 클라이언트 시크릿
KAKAO_JS_KEY=e29969884e39d981736a24728b4258c6        # JavaScript 키 (미사용)
```

---

## 카카오 개발자 콘솔 설정

### 1. 앱 정보
- **앱 ID**: 1373602
- **콘솔 URL**: https://developers.kakao.com/console/app/1373602

### 2. 플랫폼 > Web
사이트 도메인 등록:
```
http://localhost:3000
https://lead.polarad.co.kr
```

### 3. 카카오 로그인
- **활성화**: ON

### 4. 카카오 로그인 > 동의항목
| 항목 | 설정 |
|------|------|
| 이메일 | 필수 동의 |

### 5. REST API 키 > Redirect URI
```
http://localhost:3000/api/auth/kakao/callback
https://lead.polarad.co.kr/api/auth/kakao/callback
```

### 6. REST API 키 > 클라이언트 시크릿
- **상태**: 활성화
- **코드**: 환경변수 `KAKAO_CLIENT_SECRET`에 저장

---

## 트러블슈팅

### 문제 1: KOE006 에러

#### 증상
```
에러 코드: KOE006
메시지: 등록하지 않은 리다이렉트 URI를 사용해 인가 코드를 요청
```

#### 원인
- 코드에서 **REST API 키** 사용
- 카카오 콘솔에서 **JavaScript 키**의 Redirect URI에만 등록
- REST API 키와 JavaScript 키는 **별도로** Redirect URI 설정 필요

#### 해결
카카오 콘솔 > REST API 키 수정 > **카카오 로그인 리다이렉트 URI**에 등록:
```
http://localhost:3000/api/auth/kakao/callback
https://lead.polarad.co.kr/api/auth/kakao/callback
```

#### 핵심 포인트
> REST API 방식으로 카카오 로그인 구현 시, Redirect URI는 **REST API 키 설정**에서 등록해야 함.
> JavaScript 키의 Redirect URI와는 별개임.

---

### 문제 2: 토큰 발급 실패 (Client Secret)

#### 증상
- Redirect URI 설정 후에도 토큰 발급 실패
- 카카오에서 인증 오류 반환

#### 원인
- 카카오 콘솔에서 **클라이언트 시크릿이 활성화** 상태
- 토큰 요청 시 `client_secret` 파라미터 누락

#### 해결

1. 환경변수 추가:
```env
KAKAO_CLIENT_SECRET=Qlbum57MQ1tnwkWlmi3jsJ3QmssvqqfI
```

2. 콜백 코드 수정 (`callback/route.ts`):
```typescript
const clientSecret = process.env.KAKAO_CLIENT_SECRET;

// 토큰 요청 시
body: new URLSearchParams({
  grant_type: "authorization_code",
  client_id: clientId,
  redirect_uri: redirectUri,
  code: code,
  ...(clientSecret && { client_secret: clientSecret }),  // 추가
}),
```

#### 핵심 포인트
> 클라이언트 시크릿이 **활성화**되어 있으면 토큰 요청 시 반드시 `client_secret` 파라미터를 포함해야 함.
> 비활성화하면 `client_secret` 없이도 토큰 발급 가능.

---

## 가져오는 데이터

현재 구현에서는 **이메일만** 가져옴:

```typescript
const email = userData.kakao_account?.email;
```

### 추가 가능한 데이터

| 항목 | 경로 | 동의항목 설정 |
|------|------|:------------:|
| 이메일 | `kakao_account.email` | 현재 설정됨 |
| 닉네임 | `kakao_account.profile.nickname` | 추가 필요 |
| 프로필 사진 | `kakao_account.profile.profile_image_url` | 추가 필요 |
| 전화번호 | `kakao_account.phone_number` | 비즈앱 필요 |
| 이름 | `kakao_account.name` | 비즈앱 필요 |

---

## 프로덕션 배포 체크리스트

- [ ] Vercel 환경변수 추가
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
- [ ] 카카오 콘솔에 프로덕션 Redirect URI 등록 확인
  - `https://lead.polarad.co.kr/api/auth/kakao/callback`
- [ ] 카카오 콘솔에 프로덕션 사이트 도메인 등록 확인
  - `https://lead.polarad.co.kr`

---

## 참고 문서

- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [Redirect URI 설정](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite#redirect-uri)
- [클라이언트 시크릿](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite#client-secret)
