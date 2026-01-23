import { NextRequest, NextResponse } from "next/server";
import { getClientById, createLead, isBlacklisted } from "@/lib/airtable";
import {
  validatePhone,
  validateName,
  normalizePhone,
  normalizeName,
  checkDuplicateLead,
  checkProfanityInFields,
} from "@/lib/validation";
import { sendSMS, generateLeadSMS, SMSConfig } from "@/lib/sms";
import { sendEmail, generateLeadEmailHTML } from "@/lib/email";

// 욕설 횟수 추적 (IP 기반, 메모리 캐시)
const profanityAttempts = new Map<string, { count: number; lastAttempt: number }>();
const PROFANITY_BLOCK_THRESHOLD = 2; // 2회 이상 욕설 시 차단
const PROFANITY_RESET_MS = 30 * 60 * 1000; // 30분 후 초기화
import { DEFAULT_FORM_FIELDS } from "@/types";
import type { FormField } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, name, phone, email, businessName, address, birthdate, memo } = body;

    // 클라이언트 조회 (필드 검증 전에 먼저 조회해서 formFields 확인)
    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 요청입니다." },
        { status: 400 }
      );
    }

    // 활성화된 필드 목록 가져오기
    const enabledFields = (client.formFields || DEFAULT_FORM_FIELDS)
      .filter((f: FormField) => f.enabled);

    // 필수 필드 검증
    for (const field of enabledFields) {
      if (!field.required) continue;

      const value = body[field.id];
      if (!value || (typeof value === "string" && !value.trim())) {
        return NextResponse.json(
          { success: false, error: `${field.label}은(는) 필수 입력 항목입니다.` },
          { status: 400 }
        );
      }
    }

    // 이름 검증 (활성화된 경우)
    const nameField = enabledFields.find((f: FormField) => f.id === "name");
    if (nameField && name && !validateName(name)) {
      return NextResponse.json(
        { success: false, error: "유효한 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 검증 (활성화된 경우)
    const phoneField = enabledFields.find((f: FormField) => f.id === "phone");
    if (phoneField && phone && !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "유효한 전화번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 검증 (활성화된 경우)
    const emailField = enabledFields.find((f: FormField) => f.id === "email");
    if (emailField && emailField.required && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "유효한 이메일 주소를 입력해주세요." },
          { status: 400 }
        );
      }
    }

    // 정규화
    const normalizedName = name ? normalizeName(name) : "";
    const normalizedPhone = phone ? normalizePhone(phone) : "";

    // 비활성 클라이언트 체크
    if (client.status !== "active") {
      return NextResponse.json(
        { success: false, error: "현재 신청을 받지 않고 있습니다." },
        { status: 400 }
      );
    }

    // leadsTableId 체크
    if (!client.leadsTableId) {
      return NextResponse.json(
        { success: false, error: "서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    // IP 주소 가져오기
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // User Agent 가져오기
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 욕설 차단 여부 먼저 확인 (이전에 2회 이상 욕설 시도한 IP)
    const profanityRecord = profanityAttempts.get(ip);
    if (profanityRecord) {
      const now = Date.now();
      if (now - profanityRecord.lastAttempt < PROFANITY_RESET_MS) {
        if (profanityRecord.count >= PROFANITY_BLOCK_THRESHOLD) {
          return NextResponse.json(
            { success: false, error: "접수 오류로 접수 불가", blocked: true },
            { status: 403 }
          );
        }
      } else {
        // 30분 경과 시 초기화
        profanityAttempts.delete(ip);
      }
    }

    // 욕설 검사
    const profanityField = checkProfanityInFields({
      name,
      email,
      businessName,
      address,
      memo,
    });

    if (profanityField) {
      // 욕설 횟수 기록
      const current = profanityAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      const newCount = current.count + 1;
      profanityAttempts.set(ip, { count: newCount, lastAttempt: Date.now() });

      if (newCount >= PROFANITY_BLOCK_THRESHOLD) {
        return NextResponse.json(
          { success: false, error: "접수 오류로 접수 불가", blocked: true },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, error: "적절하지 않은 내용이 포함되어 있습니다." },
        { status: 400 }
      );
    }

    // 중복 체크 (5분 내 같은 번호) - 전화번호가 있는 경우만
    if (normalizedPhone && checkDuplicateLead(clientId, normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "이미 신청하셨습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // 블랙리스트 체크 - 전화번호 또는 IP
    const blacklisted = await isBlacklisted(clientId, {
      phone: normalizedPhone || undefined,
      ip
    });
    if (blacklisted) {
      return NextResponse.json(
        { success: false, error: "접수시스템 에러", blocked: true },
        { status: 403 }
      );
    }

    // 리드 생성 - 커스텀 필드 포함
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leadData: Record<string, any> = {
      name: normalizedName,
      phone: normalizedPhone,
      email: email || undefined,
      businessName: businessName || undefined,
      address: address || undefined,
      birthdate: birthdate || undefined,
      memo: memo || undefined,
      status: "new",
      ipAddress: ip,
      userAgent: userAgent.substring(0, 500),
    };

    // 커스텀 필드 데이터 추가 (custom_로 시작하는 필드)
    for (const field of enabledFields) {
      if (field.id.startsWith('custom_') && body[field.id]) {
        leadData[field.id] = body[field.id];
      }
    }

    await createLead(client.leadsTableId, clientId, leadData);

    // 텔레그램 알림 (비동기 - 실패해도 리드 저장은 성공)
    if (client.telegramChatId) {
      sendTelegramNotification(client.telegramChatId, {
        clientName: client.name,
        leadName: normalizedName,
        phone: normalizedPhone,
        airtableShareUrl: client.airtableShareUrl,
      }).catch((err) => {
        console.error("Telegram notification failed:", err);
      });
    }

    // 고객 SMS 알림 (비동기)
    if (client.smsEnabled && normalizedPhone) {
      const smsContent = generateLeadSMS({
        clientName: client.name,
        leadName: normalizedName,
        customMessage: client.smsTemplate,
        operatingHours: {
          operatingDays: client.operatingDays,
          operatingStartTime: client.operatingStartTime,
          operatingEndTime: client.operatingEndTime,
        },
      });
      // 클라이언트별 SENS 설정 (없으면 환경변수 fallback)
      const smsConfig: SMSConfig | undefined = client.ncpAccessKey ? {
        accessKey: client.ncpAccessKey,
        secretKey: client.ncpSecretKey,
        serviceId: client.ncpServiceId,
        senderPhone: client.ncpSenderPhone,
      } : undefined;
      sendSMS(normalizedPhone, smsContent, smsConfig).catch((err) => {
        console.error("SMS notification failed:", err);
      });
    }

    // 고객 이메일 알림 (비동기)
    // 랜딩 페이지 디자인 + 접수 내용 자동 포함
    if (client.emailEnabled && email) {
      // 접수 내용 데이터 구성
      const leadData: { label: string; value: string }[] = [];
      for (const field of enabledFields) {
        const value = body[field.id];
        if (value) {
          leadData.push({ label: field.label, value: String(value) });
        }
      }

      const { subject, html } = generateLeadEmailHTML({
        clientName: client.name,
        landingTitle: client.landingTitle,
        leadName: normalizedName,
        primaryColor: client.primaryColor,
        logoUrl: client.logoUrl,
        leadData,
        operatingHours: {
          operatingDays: client.operatingDays,
          operatingStartTime: client.operatingStartTime,
          operatingEndTime: client.operatingEndTime,
        },
      });
      sendEmail(email, subject, html).catch((err) => {
        console.error("Email notification failed:", err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 텔레그램 알림 전송 (비동기)
async function sendTelegramNotification(
  chatId: string,
  data: {
    clientName: string;
    leadName: string;
    phone: string;
    airtableShareUrl?: string;
  }
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  // 채널/그룹 ID 자동 보정 (100으로 시작하면 -100으로 변환)
  let normalizedChatId = chatId;
  if (/^100\d+$/.test(chatId)) {
    normalizedChatId = `-${chatId}`;
  }

  let message = `🔔 새로운 리드 접수

📋 클라이언트: ${data.clientName}
👤 이름: ${data.leadName}
📞 연락처: ${data.phone}
🕐 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;

  // 에어테이블 공유 URL 추가
  if (data.airtableShareUrl) {
    message += `\n\n📊 에어테이블: ${data.airtableShareUrl}`;
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: normalizedChatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });
}
