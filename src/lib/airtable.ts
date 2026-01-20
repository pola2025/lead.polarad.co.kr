import Airtable from "airtable";
import type {
  Client,
  Lead,
  Blacklist,
  ClientStatus,
  LeadStatus,
  BlacklistType,
} from "@/types";

// Airtable Lazy Initialization (빌드 시 API 키 없이도 빌드 가능)
let _base: ReturnType<Airtable["base"]> | null = null;

function getApiKey() {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error("AIRTABLE_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return process.env.AIRTABLE_API_KEY;
}

function getBaseId() {
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error("AIRTABLE_BASE_ID 환경변수가 설정되지 않았습니다.");
  }
  return process.env.AIRTABLE_BASE_ID;
}

function getBase() {
  if (!_base) {
    _base = new Airtable({
      apiKey: getApiKey(),
    }).base(getBaseId());
  }
  return _base;
}

// 테이블 참조 (lazy)
function getClientsTable() {
  return getBase()(process.env.AIRTABLE_CLIENTS_TABLE_ID || "Clients");
}

function getBlacklistTable() {
  return getBase()(process.env.AIRTABLE_BLACKLIST_TABLE_ID || "Blacklist");
}

// 클라이언트별 Leads 테이블 참조
function getClientLeadsTable(leadsTableId: string) {
  return getBase()(leadsTableId);
}

// ==================== 테이블 동적 생성 (Meta API) ====================

interface LeadsTableField {
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

const LEADS_TABLE_FIELDS: LeadsTableField[] = [
  { name: "name", type: "singleLineText" },
  { name: "phone", type: "phoneNumber" },
  { name: "email", type: "email" },
  { name: "businessName", type: "singleLineText" },
  { name: "industry", type: "singleLineText" },
  { name: "kakaoId", type: "singleLineText" },
  {
    name: "status",
    type: "singleSelect",
    options: {
      choices: [
        { name: "new", color: "blueLight2" },
        { name: "contacted", color: "purpleLight2" },
        { name: "converted", color: "greenLight2" },
        { name: "spam", color: "redLight2" },
      ],
    },
  },
  { name: "memo", type: "multilineText" },
  { name: "ipAddress", type: "singleLineText" },
  { name: "userAgent", type: "singleLineText" },
  { name: "createdAt", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "Asia/Seoul" } },
];

export async function createLeadsTableForClient(clientSlug: string): Promise<string> {
  const tableName = `Leads_${clientSlug}`;

  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${getBaseId()}/tables`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: tableName,
        fields: LEADS_TABLE_FIELDS,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`테이블 생성 실패: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return result.id; // 새로 생성된 테이블 ID 반환
}

export async function deleteLeadsTable(tableId: string): Promise<void> {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${getBaseId()}/tables/${tableId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("테이블 삭제 실패:", error);
    // 테이블 삭제 실패해도 클라이언트 삭제는 진행
  }
}

// ==================== 클라이언트 ====================

function parseClientRecord(record: Airtable.Record<Airtable.FieldSet>): Client {
  return {
    id: record.id,
    name: record.get("name") as string,
    slug: record.get("slug") as string,
    status: (record.get("status") as ClientStatus) || "pending",
    kakaoClientId: record.get("kakaoClientId") as string | undefined,
    kakaoClientSecret: record.get("kakaoClientSecret") as string | undefined,
    telegramChatId: record.get("telegramChatId") as string | undefined,
    landingTitle: record.get("landingTitle") as string | undefined,
    landingDescription: record.get("landingDescription") as string | undefined,
    primaryColor: record.get("primaryColor") as string | undefined,
    logoUrl: record.get("logoUrl") as string | undefined,
    contractStart: record.get("contractStart") as string | undefined,
    contractEnd: record.get("contractEnd") as string | undefined,
    leadsTableId: record.get("leadsTableId") as string | undefined,
    ctaButtonText: record.get("ctaButtonText") as string | undefined,
    thankYouTitle: record.get("thankYouTitle") as string | undefined,
    thankYouMessage: record.get("thankYouMessage") as string | undefined,
    createdAt: record.get("createdAt") as string,
  };
}

export async function getClients(): Promise<Client[]> {
  const records = await getClientsTable()
    .select({
      sort: [{ field: "createdAt", direction: "desc" }],
    })
    .all();

  return records.map(parseClientRecord);
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const record = await getClientsTable().find(id);
    return parseClientRecord(record);
  } catch {
    return null;
  }
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const records = await getClientsTable()
    .select({
      filterByFormula: `{slug} = "${slug}"`,
      maxRecords: 1,
    })
    .all();

  if (records.length === 0) return null;
  return parseClientRecord(records[0]);
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt" | "leadsTableId">
): Promise<Client> {
  // 1. 클라이언트 전용 Leads 테이블 생성
  const leadsTableId = await createLeadsTableForClient(data.slug);

  // 2. 클라이언트 레코드 생성 (leadsTableId 포함)
  const record = await getClientsTable().create({
    name: data.name,
    slug: data.slug,
    status: data.status,
    kakaoClientId: data.kakaoClientId,
    kakaoClientSecret: data.kakaoClientSecret,
    telegramChatId: data.telegramChatId,
    landingTitle: data.landingTitle,
    landingDescription: data.landingDescription,
    primaryColor: data.primaryColor,
    logoUrl: data.logoUrl,
    contractStart: data.contractStart,
    contractEnd: data.contractEnd,
    ctaButtonText: data.ctaButtonText,
    thankYouTitle: data.thankYouTitle,
    thankYouMessage: data.thankYouMessage,
    leadsTableId: leadsTableId,
    createdAt: new Date().toISOString(),
  });

  return parseClientRecord(record);
}

export async function updateClient(
  id: string,
  data: Partial<Omit<Client, "id" | "createdAt" | "leadsTableId">>
): Promise<Client> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  // 필수 필드 (빈 값 허용 안함)
  if (data.name) updateData.name = data.name;
  if (data.slug) updateData.slug = data.slug;
  if (data.status) updateData.status = data.status;

  // 선택 필드 (빈 문자열은 null로 변환)
  if (data.kakaoClientId !== undefined) updateData.kakaoClientId = data.kakaoClientId || null;
  if (data.kakaoClientSecret !== undefined) updateData.kakaoClientSecret = data.kakaoClientSecret || null;
  if (data.telegramChatId !== undefined) updateData.telegramChatId = data.telegramChatId || null;
  if (data.landingTitle !== undefined) updateData.landingTitle = data.landingTitle || null;
  if (data.landingDescription !== undefined) updateData.landingDescription = data.landingDescription || null;
  if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor || null;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null;
  if (data.ctaButtonText !== undefined) updateData.ctaButtonText = data.ctaButtonText || null;
  if (data.thankYouTitle !== undefined) updateData.thankYouTitle = data.thankYouTitle || null;
  if (data.thankYouMessage !== undefined) updateData.thankYouMessage = data.thankYouMessage || null;

  // 날짜 필드 (빈 문자열은 null로 변환)
  if (data.contractStart !== undefined) updateData.contractStart = data.contractStart || null;
  if (data.contractEnd !== undefined) updateData.contractEnd = data.contractEnd || null;

  const record = await getClientsTable().update(id, updateData);

  return parseClientRecord(record);
}

export async function deleteClient(id: string): Promise<void> {
  // 1. 클라이언트 정보 조회 (leadsTableId 확인)
  const client = await getClientById(id);

  // 2. 클라이언트 전용 Leads 테이블 삭제
  if (client?.leadsTableId) {
    await deleteLeadsTable(client.leadsTableId);
  }

  // 3. 클라이언트 레코드 삭제
  await getClientsTable().destroy(id);
}

// ==================== 리드 (클라이언트별 테이블) ====================

function parseLeadRecord(record: Airtable.Record<Airtable.FieldSet>, clientId: string): Lead {
  return {
    id: record.id,
    clientId: clientId,
    name: record.get("name") as string,
    phone: record.get("phone") as string,
    email: record.get("email") as string | undefined,
    businessName: record.get("businessName") as string | undefined,
    industry: record.get("industry") as string | undefined,
    kakaoId: record.get("kakaoId") as string | undefined,
    status: (record.get("status") as LeadStatus) || "new",
    memo: record.get("memo") as string | undefined,
    ipAddress: record.get("ipAddress") as string | undefined,
    userAgent: record.get("userAgent") as string | undefined,
    createdAt: record.get("createdAt") as string,
  };
}

export async function getLeadsByClient(
  clientId: string,
  leadsTableId: string,
  options?: { status?: LeadStatus; limit?: number }
): Promise<Lead[]> {
  const filterParts: string[] = [];

  if (options?.status) {
    filterParts.push(`{status} = "${options.status}"`);
  }

  const filterByFormula = filterParts.length > 0 ? `AND(${filterParts.join(", ")})` : "";

  const records = await getClientLeadsTable(leadsTableId)
    .select({
      filterByFormula,
      sort: [{ field: "createdAt", direction: "desc" }],
      maxRecords: options?.limit || 100,
    })
    .all();

  return records.map((record) => parseLeadRecord(record, clientId));
}

// 전체 리드 조회 (모든 클라이언트)
export async function getAllLeads(options?: { status?: LeadStatus; limit?: number }): Promise<Lead[]> {
  const clients = await getClients();
  const allLeads: Lead[] = [];

  for (const client of clients) {
    if (client.leadsTableId) {
      try {
        const leads = await getLeadsByClient(client.id, client.leadsTableId, options);
        allLeads.push(...leads);
      } catch (error) {
        console.error(`클라이언트 ${client.name}의 리드 조회 실패:`, error);
      }
    }
  }

  // 전체 리드를 createdAt 기준 내림차순 정렬
  allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // limit 적용
  if (options?.limit) {
    return allLeads.slice(0, options.limit);
  }

  return allLeads;
}

export async function getLeadById(
  leadId: string,
  leadsTableId: string,
  clientId: string
): Promise<Lead | null> {
  try {
    const record = await getClientLeadsTable(leadsTableId).find(leadId);
    return parseLeadRecord(record, clientId);
  } catch {
    return null;
  }
}

// 리드 ID로 조회 (클라이언트 정보 모를 때)
export async function findLeadById(leadId: string): Promise<{ lead: Lead; client: Client } | null> {
  const clients = await getClients();

  for (const client of clients) {
    if (client.leadsTableId) {
      try {
        const lead = await getLeadById(leadId, client.leadsTableId, client.id);
        if (lead) {
          return { lead, client };
        }
      } catch {
        // 다음 클라이언트에서 검색
      }
    }
  }

  return null;
}

export async function createLead(
  leadsTableId: string,
  clientId: string,
  data: Omit<Lead, "id" | "createdAt" | "clientId">
): Promise<Lead> {
  const record = await getClientLeadsTable(leadsTableId).create({
    name: data.name,
    phone: data.phone,
    email: data.email,
    businessName: data.businessName,
    industry: data.industry,
    kakaoId: data.kakaoId,
    status: data.status || "new",
    memo: data.memo,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    createdAt: new Date().toISOString(),
  });

  return parseLeadRecord(record, clientId);
}

export async function updateLead(
  leadId: string,
  leadsTableId: string,
  clientId: string,
  data: Partial<Omit<Lead, "id" | "createdAt" | "clientId">>
): Promise<Lead> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.phone) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.businessName !== undefined) updateData.businessName = data.businessName;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.kakaoId !== undefined) updateData.kakaoId = data.kakaoId;
  if (data.status) updateData.status = data.status;
  if (data.memo !== undefined) updateData.memo = data.memo;

  const record = await getClientLeadsTable(leadsTableId).update(leadId, updateData);

  return parseLeadRecord(record, clientId);
}

export async function deleteLead(leadId: string, leadsTableId: string): Promise<void> {
  await getClientLeadsTable(leadsTableId).destroy(leadId);
}

// ==================== 블랙리스트 ====================

export async function getBlacklist(clientId?: string): Promise<Blacklist[]> {
  const filterByFormula = clientId
    ? `OR({clientId} = BLANK(), {clientId} = "${clientId}")`
    : "";

  const records = await getBlacklistTable()
    .select({
      filterByFormula,
      sort: [{ field: "createdAt", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    clientId: record.get("clientId") as string | undefined,
    type: record.get("type") as BlacklistType,
    value: record.get("value") as string,
    reason: record.get("reason") as string | undefined,
    createdAt: record.get("createdAt") as string,
  }));
}

export async function createBlacklistEntry(
  data: Omit<Blacklist, "id" | "createdAt">
): Promise<Blacklist> {
  const record = await getBlacklistTable().create({
    ...(data.clientId && { clientId: data.clientId }),
    type: data.type,
    value: data.value,
    reason: data.reason,
    createdAt: new Date().toISOString(),
  });

  return {
    id: record.id,
    clientId: record.get("clientId") as string | undefined,
    type: record.get("type") as BlacklistType,
    value: record.get("value") as string,
    reason: record.get("reason") as string | undefined,
    createdAt: record.get("createdAt") as string,
  };
}

export async function deleteBlacklistEntry(id: string): Promise<void> {
  await getBlacklistTable().destroy(id);
}

// ==================== 블랙리스트 체크 ====================

export async function isBlacklisted(
  clientId: string,
  data: { phone?: string; kakaoId?: string; ip?: string }
): Promise<boolean> {
  const blacklist = await getBlacklist(clientId);

  for (const entry of blacklist) {
    if (entry.type === "phone" && data.phone && data.phone.includes(entry.value)) {
      return true;
    }
    if (entry.type === "kakaoId" && data.kakaoId === entry.value) {
      return true;
    }
    if (entry.type === "ip" && data.ip === entry.value) {
      return true;
    }
  }

  return false;
}
