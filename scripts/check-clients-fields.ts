/**
 * Airtable Clients 테이블 필드 점검 스크립트
 * 필요한 필드가 누락되어 있으면 자동으로 추가합니다.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_CLIENTS_TABLE_ID = process.env.AIRTABLE_CLIENTS_TABLE_ID || 'Clients';

// 필요한 필드 목록 (Airtable 타입 포함)
const REQUIRED_FIELDS: { name: string; type: string; description?: string }[] = [
  { name: 'name', type: 'singleLineText', description: '클라이언트명' },
  { name: 'slug', type: 'singleLineText', description: 'URL 슬러그' },
  { name: 'status', type: 'singleLineText', description: '상태' },
  { name: 'kakaoClientId', type: 'singleLineText', description: '카카오 Client ID' },
  { name: 'kakaoClientSecret', type: 'singleLineText', description: '카카오 Client Secret' },
  { name: 'telegramChatId', type: 'singleLineText', description: '텔레그램 채팅 ID' },
  { name: 'slackChannelId', type: 'singleLineText', description: '슬랙 채널 ID' },
  { name: 'landingTitle', type: 'singleLineText', description: '랜딩 페이지 제목' },
  { name: 'landingDescription', type: 'multilineText', description: '랜딩 페이지 설명' },
  { name: 'primaryColor', type: 'singleLineText', description: '브랜드 컬러' },
  { name: 'logoUrl', type: 'url', description: '로고 URL' },
  { name: 'contractStart', type: 'date', description: '계약 시작일' },
  { name: 'contractEnd', type: 'date', description: '계약 종료일' },
  { name: 'leadsTableId', type: 'singleLineText', description: 'Leads 테이블 ID' },
  { name: 'ctaButtonText', type: 'singleLineText', description: 'CTA 버튼 텍스트' },
  { name: 'thankYouTitle', type: 'singleLineText', description: '완료 페이지 제목' },
  { name: 'thankYouMessage', type: 'multilineText', description: '완료 페이지 메시지' },
  { name: 'formFields', type: 'multilineText', description: '폼 필드 설정 (JSON)' },
  { name: 'productFeatures', type: 'multilineText', description: '서비스 특징 (JSON)' },
  { name: 'smsEnabled', type: 'checkbox', description: 'SMS 활성화' },
  { name: 'smsTemplate', type: 'multilineText', description: 'SMS 템플릿' },
  { name: 'emailEnabled', type: 'checkbox', description: '이메일 활성화' },
  { name: 'emailSubject', type: 'singleLineText', description: '이메일 제목' },
  { name: 'emailTemplate', type: 'multilineText', description: '이메일 템플릿' },
  { name: 'ncpAccessKey', type: 'singleLineText', description: 'NCP Access Key' },
  { name: 'ncpSecretKey', type: 'singleLineText', description: 'NCP Secret Key' },
  { name: 'ncpServiceId', type: 'singleLineText', description: 'NCP Service ID' },
  { name: 'ncpSenderPhone', type: 'singleLineText', description: 'NCP 발신번호' },
  { name: 'operatingDays', type: 'singleLineText', description: '운영요일' },
  { name: 'operatingStartTime', type: 'singleLineText', description: '운영 시작시간' },
  { name: 'operatingEndTime', type: 'singleLineText', description: '운영 종료시간' },
  { name: 'airtableShareUrl', type: 'url', description: '에어테이블 공유 URL' },
  { name: 'ogImageUrl', type: 'url', description: 'OG 이미지 URL' },
  { name: 'createdAt', type: 'dateTime', description: '생성일시' },
];

async function getTableSchema() {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tables;
}

async function addField(tableId: string, fieldName: string, fieldType: string) {
  console.log(`  ➕ Adding field: ${fieldName} (${fieldType})`);

  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fieldName,
        type: fieldType,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.type === 'DUPLICATE_FIELD_NAME') {
      console.log(`  ⚠️ Field already exists: ${fieldName}`);
      return true;
    }
    console.error(`  ❌ Failed to add field ${fieldName}:`, error);
    return false;
  }

  console.log(`  ✅ Field added: ${fieldName}`);
  return true;
}

async function main() {
  console.log('🔍 Checking Airtable Clients table fields...\n');

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
    process.exit(1);
  }

  try {
    const tables = await getTableSchema();

    // Clients 테이블 찾기
    const clientsTable = tables.find(
      (t: { id: string; name: string }) =>
        t.id === AIRTABLE_CLIENTS_TABLE_ID || t.name === 'Clients'
    );

    if (!clientsTable) {
      console.error('❌ Clients table not found');
      process.exit(1);
    }

    console.log(`📋 Found Clients table: ${clientsTable.name} (${clientsTable.id})\n`);

    // 현재 필드 목록
    const existingFields = new Set(
      clientsTable.fields.map((f: { name: string }) => f.name)
    );

    console.log('📊 Current fields:', Array.from(existingFields).join(', '));
    console.log('');

    // 누락된 필드 확인
    const missingFields = REQUIRED_FIELDS.filter(f => !existingFields.has(f.name));

    if (missingFields.length === 0) {
      console.log('✅ All required fields exist!');
      return;
    }

    console.log(`⚠️ Missing ${missingFields.length} fields:`);
    missingFields.forEach(f => {
      console.log(`   - ${f.name} (${f.type}): ${f.description}`);
    });
    console.log('');

    // 필드 추가
    console.log('🔧 Adding missing fields...\n');

    for (const field of missingFields) {
      await addField(clientsTable.id, field.name, field.type);
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
