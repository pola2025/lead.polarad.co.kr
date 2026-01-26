# pola_lead 프로젝트 규칙

## Airtable 필드 관리 (CRITICAL)

### 자동 포함 필드 (새 클라이언트 생성 시)

`LEADS_TABLE_FIELDS` (airtable.ts)에 정의된 필드들은 새 클라이언트 리드 테이블 생성 시 자동 포함:

- `utmSource`, `utmAd` - UTM 추적
- `customFieldsData` - 커스텀 필드 JSON 저장
- 기본 필드 (name, phone, email, status 등)

### 기존 클라이언트에 필드 추가 시

**반드시 다음 순서를 따를 것:**

1. **Airtable에 필드 먼저 생성** (코드 수정 전!)
2. **코드에서 필드 사용 추가**
3. **테스트**

### 필드 추가 CLI

```bash
# 리드 테이블에 필드 추가
curl -X POST "https://api.airtable.com/v0/meta/bases/appyvTlolbRo05LrN/tables/{TABLE_ID}/fields" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "필드명", "type": "singleLineText"}'
```

### 클라이언트별 리드 테이블 ID

| 클라이언트 | 테이블 ID |
|-----------|-----------|
| richsuccess (부자성공연구소) | `tblWmESM4DYJyLwvA` |
| polamkt | `tbluGkF7y5u1ay9SU` |

### 동적 필드 처리

커스텀 필드(`custom_xxx`)는 개별 컬럼이 아닌 **JSON 필드**에 저장:

- 필드명: `customFieldsData` (Long text 타입)
- 저장 형식: `{"custom_xxx": "값", "custom_yyy": "값"}`

### 금지사항

- ❌ Airtable에 필드 없이 코드에서 필드 사용
- ❌ 동적으로 생성되는 필드를 개별 컬럼으로 저장 시도
- ❌ 필드 추가 후 테스트 없이 배포

### 트러블슈팅

- `UNKNOWN_FIELD_NAME` 에러 → Airtable에 해당 필드가 없음
- 해결: Airtable에 필드 추가 후 다시 시도

---

## 텔레그램 알림

### 데이터 백필 채널
```
BACKFILL_CHAT_ID = '-1003394139746'
```

---

## 개발 환경

- 포트: 3000 (기본)
- 배포: Vercel 자동 배포 (main push)
- GitHub: pola2025/lead.polarad.co.kr

---

## Meta 광고 UTM 추적

URL 매개변수:
```
utm_source=meta&utm_ad={{ad.name}}
```

Meta 광고 관리자 → 광고 수정 → 추적 → URL 매개변수에 붙여넣기

---
