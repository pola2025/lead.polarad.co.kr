import Airtable from "airtable";
import type {
  Client,
  Lead,
  Blacklist,
  ClientStatus,
  LeadStatus,
  BlacklistType,
  FormField,
  ProductFeature,
} from "@/types";
import { DEFAULT_FORM_FIELDS } from "@/types";
import { escapeAirtableFormula } from "@/lib/client";

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
  { name: "address", type: "singleLineText" },
  { name: "birthdate", type: "singleLineText" },
  {
    name: "status",
    type: "singleSelect",
    options: {
      choices: [
        { name: "kakao_login", color: "yellowLight2" },
        { name: "new", color: "blueLight2" },
        { name: "contacted", color: "purpleLight2" },
        { name: "converted", color: "greenLight2" },
        { name: "blacklist", color: "redLight2" },
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

// Leads 테이블에 커스텀 필드 추가
export async function addFieldToLeadsTable(
  tableId: string,
  fieldName: string,
  fieldType: "singleLineText" | "multilineText" = "singleLineText"
): Promise<{ success: boolean; fieldId?: string; error?: string }> {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${getBaseId()}/tables/${tableId}/fields`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fieldName,
          type: fieldType,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      // 이미 필드가 존재하는 경우 무시
      if (error.error?.type === "DUPLICATE_FIELD_NAME") {
        console.log(`필드 ${fieldName} 이미 존재`);
        return { success: true };
      }
      console.error("필드 추가 실패:", error);
      return { success: false, error: error.error?.message || "필드 추가 실패" };
    }

    const result = await response.json();
    console.log(`✅ 필드 추가 성공: ${fieldName}`);
    return { success: true, fieldId: result.id };
  } catch (error) {
    console.error("필드 추가 오류:", error);
    return { success: false, error: "필드 추가 중 오류 발생" };
  }
}

// Leads 테이블에서 필드 삭제 (주의: 데이터도 함께 삭제됨)
export async function deleteFieldFromLeadsTable(
  tableId: string,
  fieldName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 먼저 테이블 스키마를 조회하여 필드 ID 찾기
    const schemaResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${getBaseId()}/tables`,
      {
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
      }
    );

    if (!schemaResponse.ok) {
      return { success: false, error: "테이블 스키마 조회 실패" };
    }

    const schema = await schemaResponse.json();
    const table = schema.tables.find((t: { id: string }) => t.id === tableId);
    if (!table) {
      return { success: false, error: "테이블을 찾을 수 없음" };
    }

    const field = table.fields.find((f: { name: string }) => f.name === fieldName);
    if (!field) {
      // 필드가 없으면 성공으로 처리
      console.log(`필드 ${fieldName} 이미 없음`);
      return { success: true };
    }

    // 필드 삭제
    const deleteResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${getBaseId()}/tables/${tableId}/fields/${field.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.error("필드 삭제 실패:", error);
      return { success: false, error: error.error?.message || "필드 삭제 실패" };
    }

    console.log(`✅ 필드 삭제 성공: ${fieldName}`);
    return { success: true };
  } catch (error) {
    console.error("필드 삭제 오류:", error);
    return { success: false, error: "필드 삭제 중 오류 발생" };
  }
}

// ==================== 클라이언트 ====================

function parseClientRecord(record: Airtable.Record<Airtable.FieldSet>): Client {
  // formFields JSON 파싱
  const formFieldsRaw = record.get("formFields") as string | undefined;
  let formFields: FormField[] | undefined;
  if (formFieldsRaw) {
    try {
      formFields = JSON.parse(formFieldsRaw);
    } catch {
      formFields = undefined;
    }
  }

  // productFeatures JSON 파싱
  const productFeaturesRaw = record.get("productFeatures") as string | undefined;
  let productFeatures: ProductFeature[] | undefined;
  if (productFeaturesRaw) {
    try {
      productFeatures = JSON.parse(productFeaturesRaw);
    } catch {
      productFeatures = undefined;
    }
  }

  return {
    id: record.id,
    name: record.get("name") as string,
    slug: record.get("slug") as string,
    status: (record.get("status") as ClientStatus) || "pending",
    kakaoClientId: record.get("kakaoClientId") as string | undefined,
    kakaoClientSecret: record.get("kakaoClientSecret") as string | undefined,
    telegramChatId: record.get("telegramChatId") as string | undefined,
    slackChannelId: record.get("slackChannelId") as string | undefined,
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
    formFields: formFields,
    productFeatures: productFeatures,
    // 고객 알림 설정
    smsEnabled: record.get("smsEnabled") as boolean | undefined,
    smsTemplate: record.get("smsTemplate") as string | undefined,
    emailEnabled: record.get("emailEnabled") as boolean | undefined,
    emailSubject: record.get("emailSubject") as string | undefined,
    emailTemplate: record.get("emailTemplate") as string | undefined,
    // NCP SENS 설정
    ncpAccessKey: record.get("ncpAccessKey") as string | undefined,
    ncpSecretKey: record.get("ncpSecretKey") as string | undefined,
    ncpServiceId: record.get("ncpServiceId") as string | undefined,
    ncpSenderPhone: record.get("ncpSenderPhone") as string | undefined,
    // 운영시간 설정
    operatingDays: record.get("operatingDays") as 'weekdays' | 'everyday' | undefined,
    operatingStartTime: record.get("operatingStartTime") as string | undefined,
    operatingEndTime: record.get("operatingEndTime") as string | undefined,
    // 에어테이블 공유 URL
    airtableShareUrl: record.get("airtableShareUrl") as string | undefined,
    // OG 이미지 URL
    ogImageUrl: record.get("ogImageUrl") as string | undefined,
    // 포털 비밀번호
    portalPassword: record.get("portalPassword") as string | undefined,
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
  const escapedSlug = escapeAirtableFormula(slug);
  const records = await getClientsTable()
    .select({
      filterByFormula: `{slug} = "${escapedSlug}"`,
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

  // 2. 기본 폼 필드 설정 (이름, 전화번호만 활성화)
  const formFields = data.formFields || DEFAULT_FORM_FIELDS;

  // 3. 클라이언트 레코드 생성 (leadsTableId 포함)
  const record = await getClientsTable().create({
    name: data.name,
    slug: data.slug,
    status: data.status,
    kakaoClientId: data.kakaoClientId,
    kakaoClientSecret: data.kakaoClientSecret,
    telegramChatId: data.telegramChatId,
    slackChannelId: data.slackChannelId,
    landingTitle: data.landingTitle,
    landingDescription: data.landingDescription,
    primaryColor: data.primaryColor,
    logoUrl: data.logoUrl,
    contractStart: data.contractStart,
    contractEnd: data.contractEnd,
    ctaButtonText: data.ctaButtonText,
    thankYouTitle: data.thankYouTitle,
    thankYouMessage: data.thankYouMessage,
    formFields: JSON.stringify(formFields),
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
  if (data.slackChannelId !== undefined) updateData.slackChannelId = data.slackChannelId || null;
  if (data.landingTitle !== undefined) updateData.landingTitle = data.landingTitle || null;
  if (data.landingDescription !== undefined) updateData.landingDescription = data.landingDescription || null;
  if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor || null;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null;
  if (data.ctaButtonText !== undefined) updateData.ctaButtonText = data.ctaButtonText || null;
  if (data.thankYouTitle !== undefined) updateData.thankYouTitle = data.thankYouTitle || null;
  if (data.thankYouMessage !== undefined) updateData.thankYouMessage = data.thankYouMessage || null;

  // 폼 필드 설정 (JSON으로 저장)
  if (data.formFields !== undefined) {
    updateData.formFields = data.formFields ? JSON.stringify(data.formFields) : null;
  }

  // 상품 특징 (JSON으로 저장)
  if (data.productFeatures !== undefined) {
    updateData.productFeatures = data.productFeatures ? JSON.stringify(data.productFeatures) : null;
  }

  // 날짜 필드 (빈 문자열은 null로 변환)
  if (data.contractStart !== undefined) updateData.contractStart = data.contractStart || null;
  if (data.contractEnd !== undefined) updateData.contractEnd = data.contractEnd || null;

  // 고객 알림 설정
  if (data.smsEnabled !== undefined) updateData.smsEnabled = data.smsEnabled;
  if (data.smsTemplate !== undefined) updateData.smsTemplate = data.smsTemplate || null;
  if (data.emailEnabled !== undefined) updateData.emailEnabled = data.emailEnabled;
  if (data.emailSubject !== undefined) updateData.emailSubject = data.emailSubject || null;
  if (data.emailTemplate !== undefined) updateData.emailTemplate = data.emailTemplate || null;

  // NCP SENS 설정
  if (data.ncpAccessKey !== undefined) updateData.ncpAccessKey = data.ncpAccessKey || null;
  if (data.ncpSecretKey !== undefined) updateData.ncpSecretKey = data.ncpSecretKey || null;
  if (data.ncpServiceId !== undefined) updateData.ncpServiceId = data.ncpServiceId || null;
  if (data.ncpSenderPhone !== undefined) updateData.ncpSenderPhone = data.ncpSenderPhone || null;

  // 운영시간 설정
  if (data.operatingDays !== undefined) updateData.operatingDays = data.operatingDays || null;
  if (data.operatingStartTime !== undefined) updateData.operatingStartTime = data.operatingStartTime || null;
  if (data.operatingEndTime !== undefined) updateData.operatingEndTime = data.operatingEndTime || null;

  // 에어테이블 공유 URL
  if (data.airtableShareUrl !== undefined) updateData.airtableShareUrl = data.airtableShareUrl || null;

  // OG 이미지 URL
  if (data.ogImageUrl !== undefined) updateData.ogImageUrl = data.ogImageUrl || null;

  // 포털 비밀번호
  if (data.portalPassword !== undefined) updateData.portalPassword = data.portalPassword || null;

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
    address: record.get("address") as string | undefined,
    birthdate: record.get("birthdate") as string | undefined,
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

// 카카오ID로 kakao_login 상태의 리드 검색
export async function findKakaoLoginLead(
  leadsTableId: string,
  kakaoId: string,
  clientId: string
): Promise<Lead | null> {
  try {
    const records = await getClientLeadsTable(leadsTableId)
      .select({
        filterByFormula: `AND({kakaoId} = "${kakaoId}", {status} = "kakao_login")`,
        maxRecords: 1,
      })
      .all();

    if (records.length === 0) return null;
    return parseLeadRecord(records[0], clientId);
  } catch {
    return null;
  }
}

export async function createLead(
  leadsTableId: string,
  clientId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<Lead> {
  // 기본 필드
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createData: Record<string, any> = {
    name: data.name,
    phone: data.phone,
    email: data.email,
    businessName: data.businessName,
    industry: data.industry,
    kakaoId: data.kakaoId,
    address: data.address,
    birthdate: data.birthdate,
    status: data.status || "new",
    memo: data.memo,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    createdAt: new Date().toISOString(),
  };

  // 커스텀 필드 추가 (custom_로 시작하는 필드)
  for (const key of Object.keys(data)) {
    if (key.startsWith('custom_') && data[key]) {
      createData[key] = data[key];
    }
  }

  const record = await getClientLeadsTable(leadsTableId).create(createData);

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
  const escapedClientId = clientId ? escapeAirtableFormula(clientId) : '';
  const filterByFormula = clientId
    ? `OR({clientId} = BLANK(), {clientId} = "${escapedClientId}")`
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

// ==================== 히트맵 (Heatmap Clicks) ====================

export interface HeatmapClick {
  id?: string;
  clientSlug: string;
  sessionId: string;
  xPercent: number;
  yPercent: number;
  viewportWidth: number;
  viewportHeight: number;
  elementSelector?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  createdAt: string;
}

function getHeatmapTable() {
  return getBase()(process.env.AIRTABLE_HEATMAP_TABLE_ID || "HeatmapClicks");
}

// 히트맵 클릭 저장
export async function saveHeatmapClick(data: Omit<HeatmapClick, "id" | "createdAt">): Promise<HeatmapClick> {
  try {
    const record = await getHeatmapTable().create({
      clientSlug: data.clientSlug,
      sessionId: data.sessionId,
      xPercent: data.xPercent,
      yPercent: data.yPercent,
      viewportWidth: data.viewportWidth,
      viewportHeight: data.viewportHeight,
      elementSelector: data.elementSelector || "",
      deviceType: data.deviceType,
      createdAt: new Date().toISOString(),
    });

    return {
      id: record.id,
      clientSlug: record.get("clientSlug") as string,
      sessionId: record.get("sessionId") as string,
      xPercent: record.get("xPercent") as number,
      yPercent: record.get("yPercent") as number,
      viewportWidth: record.get("viewportWidth") as number,
      viewportHeight: record.get("viewportHeight") as number,
      elementSelector: record.get("elementSelector") as string | undefined,
      deviceType: record.get("deviceType") as 'mobile' | 'desktop' | 'tablet',
      createdAt: record.get("createdAt") as string,
    };
  } catch (error) {
    console.error("히트맵 클릭 저장 실패:", error);
    throw error;
  }
}

// 히트맵 데이터 조회 (기간, 디바이스 필터)
export async function getHeatmapClicks(
  clientSlug: string,
  options?: {
    period?: "7d" | "30d" | "90d" | "custom";
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<HeatmapClick[]> {
  try {
    const escapedSlug = escapeAirtableFormula(clientSlug);
    const filterParts: string[] = [`{clientSlug} = "${escapedSlug}"`];

    // 기간 필터
    if (options?.period === "custom" && options.startDate && options.endDate) {
      // 커스텀 기간
      const start = new Date(options.startDate);
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      filterParts.push(`AND(IS_AFTER({createdAt}, "${start.toISOString()}"), IS_BEFORE({createdAt}, "${end.toISOString()}"))`);
    } else if (options?.period && options.period !== "custom") {
      const days = options.period === "7d" ? 7 : options.period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      filterParts.push(`IS_AFTER({createdAt}, "${startDate.toISOString()}")`);
    }

    // 디바이스 필터
    if (options?.deviceType) {
      filterParts.push(`{deviceType} = "${options.deviceType}"`);
    }

    const filterByFormula = filterParts.length > 1
      ? `AND(${filterParts.join(", ")})`
      : filterParts[0];

    const records = await getHeatmapTable()
      .select({
        filterByFormula,
        sort: [{ field: "createdAt", direction: "desc" }],
        maxRecords: options?.limit || 5000,
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      clientSlug: record.get("clientSlug") as string,
      sessionId: record.get("sessionId") as string,
      xPercent: record.get("xPercent") as number,
      yPercent: record.get("yPercent") as number,
      viewportWidth: record.get("viewportWidth") as number,
      viewportHeight: record.get("viewportHeight") as number,
      elementSelector: record.get("elementSelector") as string | undefined,
      deviceType: record.get("deviceType") as 'mobile' | 'desktop' | 'tablet',
      createdAt: record.get("createdAt") as string,
    }));
  } catch (error) {
    console.error("히트맵 데이터 조회 실패:", error);
    return [];
  }
}

// 히트맵 집계 데이터 (좌표별 클릭 수)
export async function getHeatmapAggregated(
  clientSlug: string,
  options?: {
    period?: "7d" | "30d" | "90d" | "custom";
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  points: { x: number; y: number; value: number }[];
  elements: { selector: string; clicks: number }[];
  total: number;
}> {
  const clicks = await getHeatmapClicks(clientSlug, { ...options, limit: 10000 });

  // 좌표 그룹화 (5% 단위로 반올림)
  const pointMap = new Map<string, number>();
  const elementMap = new Map<string, number>();

  clicks.forEach((click) => {
    // 5% 단위로 그룹화
    const roundedX = Math.round(click.xPercent / 5) * 5;
    const roundedY = Math.round(click.yPercent / 5) * 5;
    const key = `${roundedX},${roundedY}`;

    pointMap.set(key, (pointMap.get(key) || 0) + 1);

    // 요소별 클릭 수
    if (click.elementSelector) {
      elementMap.set(click.elementSelector, (elementMap.get(click.elementSelector) || 0) + 1);
    }
  });

  const points = Array.from(pointMap.entries())
    .map(([key, value]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, value };
    })
    .sort((a, b) => b.value - a.value);

  const elements = Array.from(elementMap.entries())
    .map(([selector, clicks]) => ({ selector, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return {
    points,
    elements,
    total: clicks.length,
  };
}

// ==================== 설정 (Settings) ====================

export interface GA4Settings {
  id?: string;
  ga4PropertyId: string;
  ga4ServiceAccountEmail: string;
  ga4PrivateKey: string;
  updatedAt?: string;
}

function getSettingsTable() {
  return getBase()(process.env.AIRTABLE_SETTINGS_TABLE_ID || "Settings");
}

export async function getGA4Settings(): Promise<GA4Settings | null> {
  try {
    const records = await getSettingsTable()
      .select({
        filterByFormula: `{key} = "ga4_settings"`,
        maxRecords: 1,
      })
      .all();

    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.id,
      ga4PropertyId: record.get("ga4PropertyId") as string || "",
      ga4ServiceAccountEmail: record.get("ga4ServiceAccountEmail") as string || "",
      ga4PrivateKey: record.get("ga4PrivateKey") as string || "",
      updatedAt: record.get("updatedAt") as string,
    };
  } catch (error) {
    console.error("GA4 설정 조회 실패:", error);
    return null;
  }
}

export async function saveGA4Settings(data: Omit<GA4Settings, "id" | "updatedAt">): Promise<GA4Settings> {
  const existingSettings = await getGA4Settings();

  if (existingSettings?.id) {
    // 기존 레코드 업데이트
    const records = await getSettingsTable().update([
      {
        id: existingSettings.id,
        fields: {
          ga4PropertyId: data.ga4PropertyId || "",
          ga4ServiceAccountEmail: data.ga4ServiceAccountEmail || "",
          ga4PrivateKey: data.ga4PrivateKey || "",
          updatedAt: new Date().toISOString(),
        },
      },
    ]);
    const record = records[0];

    return {
      id: record.id,
      ga4PropertyId: record.get("ga4PropertyId") as string || "",
      ga4ServiceAccountEmail: record.get("ga4ServiceAccountEmail") as string || "",
      ga4PrivateKey: record.get("ga4PrivateKey") as string || "",
      updatedAt: record.get("updatedAt") as string,
    };
  } else {
    // 새 레코드 생성
    const record = await getSettingsTable().create({
      key: "ga4_settings",
      ga4PropertyId: data.ga4PropertyId,
      ga4ServiceAccountEmail: data.ga4ServiceAccountEmail,
      ga4PrivateKey: data.ga4PrivateKey,
      updatedAt: new Date().toISOString(),
    });

    return {
      id: record.id,
      ga4PropertyId: record.get("ga4PropertyId") as string || "",
      ga4ServiceAccountEmail: record.get("ga4ServiceAccountEmail") as string || "",
      ga4PrivateKey: record.get("ga4PrivateKey") as string || "",
      updatedAt: record.get("updatedAt") as string,
    };
  }
}
