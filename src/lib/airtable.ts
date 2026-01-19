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

function getBase() {
  if (!_base) {
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error("AIRTABLE_API_KEY 환경변수가 설정되지 않았습니다.");
    }
    _base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID || "");
  }
  return _base;
}

// 테이블 참조 (lazy)
function getClientsTable() {
  return getBase()(process.env.AIRTABLE_CLIENTS_TABLE_ID || "Clients");
}

function getLeadsTable() {
  return getBase()(process.env.AIRTABLE_LEADS_TABLE_ID || "Leads");
}

function getBlacklistTable() {
  return getBase()(process.env.AIRTABLE_BLACKLIST_TABLE_ID || "Blacklist");
}

// ==================== 클라이언트 ====================

export async function getClients(): Promise<Client[]> {
  const records = await getClientsTable()
    .select({
      sort: [{ field: "createdAt", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
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
    createdAt: record.get("createdAt") as string,
  }));
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const record = await getClientsTable().find(id);
    return {
      id: record.id,
      name: record.get("name") as string,
      slug: record.get("slug") as string,
      status: (record.get("status") as ClientStatus) || "pending",
      kakaoClientId: record.get("kakaoClientId") as string | undefined,
      kakaoClientSecret: record.get("kakaoClientSecret") as string | undefined,
      telegramChatId: record.get("telegramChatId") as string | undefined,
      landingTitle: record.get("landingTitle") as string | undefined,
      landingDescription: record.get("landingDescription") as
        | string
        | undefined,
      primaryColor: record.get("primaryColor") as string | undefined,
      logoUrl: record.get("logoUrl") as string | undefined,
      contractStart: record.get("contractStart") as string | undefined,
      contractEnd: record.get("contractEnd") as string | undefined,
      createdAt: record.get("createdAt") as string,
    };
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

  const record = records[0];
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
    createdAt: record.get("createdAt") as string,
  };
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt">
): Promise<Client> {
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
    createdAt: new Date().toISOString(),
  });

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
    createdAt: record.get("createdAt") as string,
  };
}

export async function updateClient(
  id: string,
  data: Partial<Omit<Client, "id" | "createdAt">>
): Promise<Client> {
  const record = await getClientsTable().update(id, {
    ...(data.name && { name: data.name }),
    ...(data.slug && { slug: data.slug }),
    ...(data.status && { status: data.status }),
    ...(data.kakaoClientId !== undefined && {
      kakaoClientId: data.kakaoClientId,
    }),
    ...(data.kakaoClientSecret !== undefined && {
      kakaoClientSecret: data.kakaoClientSecret,
    }),
    ...(data.telegramChatId !== undefined && {
      telegramChatId: data.telegramChatId,
    }),
    ...(data.landingTitle !== undefined && { landingTitle: data.landingTitle }),
    ...(data.landingDescription !== undefined && {
      landingDescription: data.landingDescription,
    }),
    ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
    ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
    ...(data.contractStart !== undefined && {
      contractStart: data.contractStart,
    }),
    ...(data.contractEnd !== undefined && { contractEnd: data.contractEnd }),
  });

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
    createdAt: record.get("createdAt") as string,
  };
}

export async function deleteClient(id: string): Promise<void> {
  await getClientsTable().destroy(id);
}

// ==================== 리드 ====================

export async function getLeads(options?: {
  clientId?: string;
  status?: LeadStatus;
  limit?: number;
}): Promise<Lead[]> {
  const filterParts: string[] = [];

  if (options?.clientId) {
    filterParts.push(`RECORD_ID({clientId}) = "${options.clientId}"`);
  }
  if (options?.status) {
    filterParts.push(`{status} = "${options.status}"`);
  }

  const filterByFormula =
    filterParts.length > 0 ? `AND(${filterParts.join(", ")})` : "";

  const records = await getLeadsTable()
    .select({
      filterByFormula,
      sort: [{ field: "createdAt", direction: "desc" }],
      maxRecords: options?.limit || 100,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    clientId: (record.get("clientId") as string[])?.[0] || "",
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
  }));
}

export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const record = await getLeadsTable().find(id);
    return {
      id: record.id,
      clientId: (record.get("clientId") as string[])?.[0] || "",
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
  } catch {
    return null;
  }
}

export async function createLead(
  data: Omit<Lead, "id" | "createdAt">
): Promise<Lead> {
  const record = await getLeadsTable().create({
    clientId: [data.clientId],
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

  return {
    id: record.id,
    clientId: (record.get("clientId") as string[])?.[0] || "",
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

export async function updateLead(
  id: string,
  data: Partial<Omit<Lead, "id" | "createdAt">>
): Promise<Lead> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};

  if (data.clientId) updateData.clientId = [data.clientId];
  if (data.name) updateData.name = data.name;
  if (data.phone) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.businessName !== undefined)
    updateData.businessName = data.businessName;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.kakaoId !== undefined) updateData.kakaoId = data.kakaoId;
  if (data.status) updateData.status = data.status;
  if (data.memo !== undefined) updateData.memo = data.memo;

  const record = await getLeadsTable().update(id, updateData);

  return {
    id: record.id,
    clientId: (record.get("clientId") as string[])?.[0] || "",
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

export async function deleteLead(id: string): Promise<void> {
  await getLeadsTable().destroy(id);
}

// ==================== 블랙리스트 ====================

export async function getBlacklist(clientId?: string): Promise<Blacklist[]> {
  const filterByFormula = clientId
    ? `OR({clientId} = BLANK(), RECORD_ID({clientId}) = "${clientId}")`
    : "";

  const records = await getBlacklistTable()
    .select({
      filterByFormula,
      sort: [{ field: "createdAt", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    clientId: (record.get("clientId") as string[])?.[0],
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
    ...(data.clientId && { clientId: [data.clientId] }),
    type: data.type,
    value: data.value,
    reason: data.reason,
    createdAt: new Date().toISOString(),
  });

  return {
    id: record.id,
    clientId: (record.get("clientId") as string[])?.[0],
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
    if (entry.type === "keyword") {
      // 키워드는 이름이나 상호명에서 체크
      // 추후 구현
    }
  }

  return false;
}
