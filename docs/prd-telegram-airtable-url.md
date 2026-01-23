# PRD: 텔레그램 알림에 에어테이블 URL 추가

## 개요

- **기능명**: 텔레그램 리드 알림에 에어테이블 공유 URL 포함
- **목적**: 관리자가 텔레그램 알림에서 바로 에어테이블로 이동하여 리드 확인
- **작성일**: 2026-01-23

---

## 요구사항

### 기능 요구사항

1. **클라이언트별 에어테이블 공유 URL 저장**
   - Client 모델에 `airtableShareUrl` 필드 추가
   - 관리자가 클라이언트 편집 페이지에서 설정 가능

2. **텔레그램 알림 메시지 수정**
   - 기존 메시지에 에어테이블 URL 추가
   - URL 미리보기 비활성화 (`disable_web_page_preview: true`)

3. **관리자 페이지 UI**
   - 클라이언트 편집 페이지에 "에어테이블 공유 URL" 입력 필드 추가

### 비기능 요구사항

- 에어테이블 URL이 없어도 알림 발송에 영향 없음 (선택 필드)
- 기존 텔레그램 알림 기능 유지

---

## 기술 설계

### 1. 데이터 모델 (완료)

```typescript
// src/types/index.ts
interface Client {
  // ... 기존 필드
  airtableShareUrl?: string;  // 추가됨
}
```

### 2. 에어테이블 파싱 (완료)

```typescript
// src/lib/airtable.ts
// parseClientRecord: airtableShareUrl 파싱 추가
// updateClient: airtableShareUrl 저장 추가
```

### 3. 텔레그램 알림 수정

**변경 전:**
```typescript
const message = `🔔 새로운 리드 접수

📋 클라이언트: ${data.clientName}
👤 이름: ${data.leadName}
📞 연락처: ${data.phone}
🕐 시간: ${time}`;

await fetch(url, {
  body: JSON.stringify({
    chat_id: chatId,
    text: message,
  }),
});
```

**변경 후:**
```typescript
let message = `🔔 새로운 리드 접수

📋 클라이언트: ${data.clientName}
👤 이름: ${data.leadName}
📞 연락처: ${data.phone}
🕐 시간: ${time}`;

if (data.airtableShareUrl) {
  message += `\n\n📊 에어테이블: ${data.airtableShareUrl}`;
}

await fetch(url, {
  body: JSON.stringify({
    chat_id: chatId,
    text: message,
    disable_web_page_preview: true,  // 미리보기 비활성화
  }),
});
```

### 4. 관리자 페이지 UI

클라이언트 편집 페이지 (`/clients/[id]`)에 입력 필드 추가:

```tsx
<div>
  <label>에어테이블 공유 URL</label>
  <input
    type="url"
    placeholder="https://airtable.com/appXXX/shrXXX"
    value={formData.airtableShareUrl || ""}
    onChange={(e) => setFormData({ ...formData, airtableShareUrl: e.target.value })}
  />
  <p className="text-sm text-gray-500">
    텔레그램 알림에 포함될 에어테이블 공유 링크
  </p>
</div>
```

---

## 테스트 계획

### 단위 테스트

1. **sendTelegramNotification 함수**
   - [ ] airtableShareUrl 없을 때 기존 메시지 형식 유지
   - [ ] airtableShareUrl 있을 때 URL 포함 확인
   - [ ] disable_web_page_preview 옵션 포함 확인

2. **updateClient 함수**
   - [ ] airtableShareUrl 저장 확인
   - [ ] airtableShareUrl 빈 문자열 시 null 저장 확인

### 통합 테스트

3. **리드 제출 → 텔레그램 알림**
   - [ ] 리드 제출 시 에어테이블 URL 포함된 알림 발송 확인

4. **관리자 페이지**
   - [ ] 클라이언트 편집에서 airtableShareUrl 저장 확인
   - [ ] 저장 후 다시 로드 시 값 유지 확인

---

## 구현 체크리스트

- [x] Client 타입에 airtableShareUrl 필드 추가
- [x] airtable.ts parseClientRecord 수정
- [x] airtable.ts updateClient 수정
- [ ] 텔레그램 알림 함수 수정
- [ ] 관리자 클라이언트 편집 페이지 UI 추가
- [ ] 테스트 작성 및 실행
- [ ] 에어테이블 Clients 테이블에 airtableShareUrl 필드 추가

---

## 롤아웃 계획

1. 코드 배포
2. 에어테이블 Clients 테이블에 `airtableShareUrl` 필드 수동 추가 (singleLineText 또는 url 타입)
3. 관리자 페이지에서 polamkt 클라이언트에 URL 설정
4. 테스트 리드 제출하여 텔레그램 알림 확인
