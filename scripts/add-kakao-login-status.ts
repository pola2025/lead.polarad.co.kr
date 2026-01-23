/**
 * 기존 Leads 테이블에 kakao_login 상태 선택지 추가
 * Meta API를 사용하여 status 필드에 kakao_login 옵션 추가
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_CLIENTS_TABLE_ID = process.env.AIRTABLE_CLIENTS_TABLE_ID || 'Clients';

interface Client {
  id: string;
  name: string;
  leadsTableId?: string;
}

interface TableField {
  id: string;
  name: string;
  type: string;
  options?: {
    choices?: Array<{ id?: string; name: string; color?: string }>;
  };
}

async function getClients(): Promise<Client[]> {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CLIENTS_TABLE_ID}`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${await response.text()}`);
  }

  const data = await response.json();
  return data.records.map((r: any) => ({
    id: r.id,
    name: r.fields.name,
    leadsTableId: r.fields.leadsTableId,
  }));
}

async function getTableSchema(tableId: string): Promise<TableField[]> {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${await response.text()}`);
  }

  const data = await response.json();
  const table = data.tables.find((t: any) => t.id === tableId);
  if (!table) {
    throw new Error(`Table ${tableId} not found`);
  }

  return table.fields;
}

async function updateStatusField(tableId: string, fieldId: string, existingChoices: any[]): Promise<void> {
  // kakao_login이 이미 있는지 확인
  const hasKakaoLogin = existingChoices.some((c: any) => c.name === 'kakao_login');
  if (hasKakaoLogin) {
    console.log(`  ✓ kakao_login already exists`);
    return;
  }

  console.log(`  Existing choices: ${existingChoices.map((c: any) => c.name).join(', ')}`);

  // 새로운 선택지 추가 (기존 선택지는 id 유지)
  const newChoices = [
    { name: 'kakao_login' },  // color 없이 name만
    ...existingChoices.map((c: any) => {
      const choice: any = { name: c.name };
      if (c.id) choice.id = c.id;
      if (c.color) choice.color = c.color;
      return choice;
    }),
  ];

  console.log(`  Adding kakao_login to choices...`);

  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields/${fieldId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        options: {
          choices: newChoices,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.log(`  Request body: ${JSON.stringify({ options: { choices: newChoices } }, null, 2)}`);
    throw new Error(`Failed to update field: ${error}`);
  }

  console.log(`  ✓ kakao_login added successfully`);
}

async function main() {
  console.log('=== Adding kakao_login status to existing Leads tables ===\n');

  // 1. 모든 클라이언트 조회
  const clients = await getClients();
  console.log(`Found ${clients.length} clients\n`);

  for (const client of clients) {
    console.log(`Processing: ${client.name}`);

    if (!client.leadsTableId) {
      console.log(`  ⚠ No leadsTableId, skipping\n`);
      continue;
    }

    try {
      // 2. 테이블 스키마 조회
      const fields = await getTableSchema(client.leadsTableId);
      const statusField = fields.find((f) => f.name === 'status');

      if (!statusField) {
        console.log(`  ⚠ No status field found, skipping\n`);
        continue;
      }

      if (statusField.type !== 'singleSelect') {
        console.log(`  ⚠ status is not singleSelect, skipping\n`);
        continue;
      }

      // 3. kakao_login 선택지 추가
      await updateStatusField(
        client.leadsTableId,
        statusField.id,
        statusField.options?.choices || []
      );
      console.log('');
    } catch (error) {
      console.error(`  ✗ Error: ${error}\n`);
    }
  }

  console.log('=== Done ===');
}

main().catch(console.error);
