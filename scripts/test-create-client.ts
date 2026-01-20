import { createClient, deleteClient } from "../src/lib/airtable";

async function test() {
  const testSlug = `test-${Date.now()}`;

  console.log("1. 클라이언트 생성 테스트...");
  console.log(`   슬러그: ${testSlug}`);

  try {
    const client = await createClient({
      name: "테스트 클라이언트",
      slug: testSlug,
      status: "pending",
    });

    console.log("✅ 클라이언트 생성 성공!");
    console.log(`   ID: ${client.id}`);
    console.log(`   leadsTableId: ${client.leadsTableId}`);

    // 정리: 테스트 클라이언트 삭제
    console.log("\n2. 테스트 클라이언트 삭제...");
    await deleteClient(client.id);
    console.log("✅ 삭제 완료 (Leads 테이블도 함께 삭제됨)");

  } catch (error) {
    console.error("❌ 에러:", error);
  }
}

test();
