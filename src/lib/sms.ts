/**
 * NCP SENS SMS 발송 모듈
 * 고객에게 접수 확인 문자 발송
 */

import { createHmac } from "crypto";
import { getOperatingHoursNotice, OperatingHours } from "./operating-hours";

export interface SMSSendResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

/**
 * SMS 발송 설정
 */
export interface SMSConfig {
  accessKey?: string;
  secretKey?: string;
  serviceId?: string;
  senderPhone?: string;
}

/**
 * SMS 발송
 * @param to 수신자 전화번호
 * @param content 메시지 내용
 * @param config 클라이언트별 SENS 설정 (없으면 환경변수 사용)
 */
export async function sendSMS(to: string, content: string, config?: SMSConfig): Promise<SMSSendResult> {
  // 클라이언트 설정 우선, 없으면 환경변수 사용
  const accessKey = config?.accessKey || process.env.NCP_ACCESS_KEY;
  const secretKey = config?.secretKey || process.env.NCP_SECRET_KEY;
  const serviceId = config?.serviceId || process.env.NCP_SERVICE_ID;
  const senderPhone = config?.senderPhone || process.env.NCP_SENDER_PHONE;

  if (!accessKey || !secretKey || !serviceId || !senderPhone) {
    console.log("[SMS] NCP SENS 설정 미완료 (클라이언트 설정 또는 환경변수 필요)");
    return { success: false, error: "SMS 설정 미완료" };
  }

  try {
    const timestamp = Date.now().toString();
    const uri = `/sms/v2/services/${serviceId}/messages`;
    const url = `https://sens.apigw.ntruss.com${uri}`;

    // HMAC-SHA256 서명 생성
    const message = ["POST", " ", uri, "\n", timestamp, "\n", accessKey].join("");
    const signature = createHmac("sha256", secretKey).update(message).digest("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-iam-access-key": accessKey,
        "x-ncp-apigw-signature-v2": signature,
      },
      body: JSON.stringify({
        type: "LMS", // 장문 메시지
        from: senderPhone.replace(/-/g, ""),
        content,
        messages: [{ to: to.replace(/-/g, "") }],
      }),
    });

    const result = await response.json();

    if (response.ok && result.statusCode === "202") {
      console.log(`✅ [SMS] 발송 성공: ${to}`);
      return { success: true, requestId: result.requestId };
    } else {
      console.error(`❌ [SMS] 발송 실패:`, result);
      return { success: false, error: result.statusMessage || result.error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ [SMS] 발송 오류:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 리드 접수 확인 SMS 생성
 */
export function generateLeadSMS(params: {
  clientName: string;
  leadName: string;
  customMessage?: string;
  operatingHours?: OperatingHours;
}): string {
  const { clientName, leadName, customMessage, operatingHours } = params;

  let message: string;

  if (customMessage) {
    // 사용자 정의 메시지 (변수 치환)
    message = customMessage
      .replace(/\{clientName\}/g, clientName)
      .replace(/\{name\}/g, leadName)
      .replace(/\{date\}/g, new Date().toLocaleDateString("ko-KR"));
  } else {
    // 기본 메시지
    message = `[${clientName}] ${leadName}님, 상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. 감사합니다.`;
  }

  // 운영시간 안내 추가
  if (operatingHours && (operatingHours.operatingDays || operatingHours.operatingStartTime)) {
    const notice = getOperatingHoursNotice(operatingHours);
    message = `${message}\n\n${notice}`;
  }

  return message;
}
