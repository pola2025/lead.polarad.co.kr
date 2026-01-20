import Airtable from "airtable";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error("❌ AIRTABLE_API_KEY 또는 AIRTABLE_BASE_ID가 없습니다.");
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function checkTable(tableName: string, tableId: string) {
  console.log(`\n📋 ${tableName} (${tableId}) 확인 중...`);

  try {
    const records = await base(tableId).select({ maxRecords: 1 }).firstPage();

    if (records.length > 0) {
      const fields = Object.keys(records[0].fields);
      console.log(`✅ 테이블 존재함. 필드: ${fields.join(", ")}`);
    } else {
      console.log(`✅ 테이블 존재함. (레코드 없음 - 필드 구조 확인 불가)`);
    }
    return true;
  } catch (error: any) {
    if (error.statusCode === 404 || error.message?.includes("NOT_FOUND")) {
      console.log(`❌ 테이블이 존재하지 않습니다.`);
      return false;
    }
    console.error(`⚠️ 오류:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🔍 Airtable 연결 및 테이블 확인");
  console.log(`Base ID: ${baseId}`);

  const clientsTableId = process.env.AIRTABLE_CLIENTS_TABLE_ID || "Clients";
  const leadsTableId = process.env.AIRTABLE_LEADS_TABLE_ID || "Leads";
  const blacklistTableId = process.env.AIRTABLE_BLACKLIST_TABLE_ID || "Blacklist";

  const results = await Promise.all([
    checkTable("Clients", clientsTableId),
    checkTable("Leads", leadsTableId),
    checkTable("Blacklist", blacklistTableId),
  ]);

  console.log("\n" + "=".repeat(50));

  if (results.every(r => r)) {
    console.log("✅ 모든 테이블이 정상입니다.");
  } else {
    console.log("❌ 일부 테이블이 없습니다. 생성이 필요합니다.");
  }
}

main().catch(console.error);
