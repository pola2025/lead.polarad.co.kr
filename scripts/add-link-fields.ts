// Airtable Link 필드 추가 스크립트
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appyvTlolbRo05LrN';
const CLIENTS_TABLE_ID = 'tblhvKX8X7vb9uywg';
const LEADS_TABLE_ID = 'tblipTviQHgwTATnF';
const BLACKLIST_TABLE_ID = 'tblCaXbuOyWYUhptO';

async function addLinkField(tableId: string, fieldName: string, linkedTableId: string) {
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${tableId}/fields`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fieldName,
      type: 'multipleRecordLinks',
      options: {
        linkedTableId: linkedTableId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add field: ${error}`);
  }

  return await response.json();
}

async function main() {
  if (!AIRTABLE_API_KEY) {
    console.error('AIRTABLE_API_KEY is required');
    process.exit(1);
  }

  // Leads 테이블에 clientId 추가
  console.log('Adding clientId to Leads table...');
  try {
    await addLinkField(LEADS_TABLE_ID, 'clientId', CLIENTS_TABLE_ID);
    console.log('  ✅ Added clientId to Leads');
  } catch (e) {
    console.error(`  ❌ Failed: ${e}`);
  }

  // Blacklist 테이블에 clientId 추가
  console.log('Adding clientId to Blacklist table...');
  try {
    await addLinkField(BLACKLIST_TABLE_ID, 'clientId', CLIENTS_TABLE_ID);
    console.log('  ✅ Added clientId to Blacklist');
  } catch (e) {
    console.error(`  ❌ Failed: ${e}`);
  }

  console.log('\n완료!');
}

main().catch(console.error);
