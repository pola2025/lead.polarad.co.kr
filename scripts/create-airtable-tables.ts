// Airtable 테이블 생성 스크립트
// 실행: AIRTABLE_API_KEY=xxx npx tsx scripts/create-airtable-tables.ts

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appyvTlolbRo05LrN';

interface FieldConfig {
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

interface TableConfig {
  name: string;
  fields: FieldConfig[];
}

const tables: TableConfig[] = [
  {
    name: 'Clients',
    fields: [
      { name: 'name', type: 'singleLineText' }, // primary field
      { name: 'slug', type: 'singleLineText' },
      { name: 'status', type: 'singleSelect', options: { choices: [{ name: 'active' }, { name: 'inactive' }, { name: 'pending' }] } },
      { name: 'kakaoClientId', type: 'singleLineText' },
      { name: 'kakaoClientSecret', type: 'singleLineText' },
      { name: 'telegramChatId', type: 'singleLineText' },
      { name: 'landingTitle', type: 'singleLineText' },
      { name: 'landingDescription', type: 'multilineText' },
      { name: 'primaryColor', type: 'singleLineText' },
      { name: 'logoUrl', type: 'url' },
      { name: 'contractStart', type: 'date', options: { dateFormat: { name: 'iso' } } },
      { name: 'contractEnd', type: 'date', options: { dateFormat: { name: 'iso' } } },
      { name: 'createdAt', type: 'dateTime', options: { timeZone: 'Asia/Seoul', dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' } } },
    ],
  },
  {
    name: 'Blacklist',
    fields: [
      { name: 'value', type: 'singleLineText' }, // primary field (차단 값)
      { name: 'type', type: 'singleSelect', options: { choices: [{ name: 'phone' }, { name: 'kakaoId' }, { name: 'ip' }, { name: 'keyword' }] } },
      { name: 'reason', type: 'singleLineText' },
      { name: 'createdAt', type: 'dateTime', options: { timeZone: 'Asia/Seoul', dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' } } },
    ],
  },
];

async function createTable(table: TableConfig): Promise<{ id: string; name: string }> {
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: table.name,
      fields: table.fields,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create table ${table.name}: ${error}`);
  }

  const result = await response.json();
  return { id: result.id, name: result.name };
}

async function main() {
  if (!AIRTABLE_API_KEY) {
    console.error('AIRTABLE_API_KEY is required');
    process.exit(1);
  }

  console.log('Creating Airtable tables...\n');

  const createdTables: { id: string; name: string }[] = [];

  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.name}...`);
      const result = await createTable(table);
      console.log(`  ✅ Created: ${result.name} (${result.id})`);
      createdTables.push(result);
    } catch (error) {
      console.error(`  ❌ Failed: ${table.name}`);
      console.error(`     ${error}`);
    }
  }

  console.log('\n--- Environment Variables ---\n');
  console.log('AIRTABLE_BASE_ID=appyvTlolbRo05LrN');
  console.log('AIRTABLE_LEADS_TABLE_ID=tblipTviQHgwTATnF'); // 이미 생성됨
  createdTables.forEach((t) => {
    const envName = `AIRTABLE_${t.name.toUpperCase()}_TABLE_ID`;
    console.log(`${envName}=${t.id}`);
  });

  console.log('\n--- Link 필드 수동 추가 필요 ---');
  console.log('Leads 테이블에 clientId 필드 (Link to Clients) 추가');
  console.log('Blacklist 테이블에 clientId 필드 (Link to Clients) 추가');
}

main().catch(console.error);
