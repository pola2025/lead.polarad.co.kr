/**
 * Resend 이메일 발송 모듈
 * 고객에게 접수 확인 이메일 발송
 */

import { Resend } from "resend";
import { formatOperatingHours, OperatingHours } from "./operating-hours";

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * 이메일 발송
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@polarad.co.kr";

  if (!apiKey) {
    console.log("[Email] RESEND_API_KEY 환경변수 미설정");
    return { success: false, error: "이메일 환경변수 미설정" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: `PolarLead <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(`❌ [Email] 발송 실패:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ [Email] 발송 성공: ${to}`);
    return { success: true, id: data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ [Email] 발송 오류:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 리드 접수 확인 이메일 HTML 생성
 * 랜딩 페이지 디자인 + 접수 내용 자동 포함
 */
export function generateLeadEmailHTML(params: {
  clientName: string;
  landingTitle?: string;
  leadName: string;
  primaryColor?: string;
  logoUrl?: string;
  leadData: { label: string; value: string }[];
  operatingHours?: OperatingHours;
}): { subject: string; html: string } {
  const {
    clientName,
    landingTitle,
    leadName,
    primaryColor = "#3b82f6",
    logoUrl,
    leadData,
    operatingHours,
  } = params;

  // 상단에 표시될 제목 (랜딩 페이지 제목 우선, 없으면 업체명)
  const displayTitle = landingTitle || clientName;

  const title = `[${clientName}] 상담 신청이 접수되었습니다`;

  // 접수 내용 HTML 생성
  const leadInfoRows = leadData
    .filter(item => item.value)
    .map(item => `
      <tr>
        <td style="color: #6b7280; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb; width: 100px;">${item.label}</td>
        <td style="color: #1f2937; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.value}</td>
      </tr>
    `).join('');

  // 운영시간 안내 HTML (설정되어 있을 때만)
  const operatingHoursHtml = operatingHours && (operatingHours.operatingDays || operatingHours.operatingStartTime)
    ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🕐 운영시간 안내</p>
                    <p style="color: #78350f; font-size: 14px; margin: 0;">${formatOperatingHours(operatingHours)}</p>
                  </td>
                </tr>
              </table>
    `
    : '';

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- 상단 로고 + 제목 영역 -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 16px 16px 0 0; padding: 16px 24px; border-bottom: 1px solid #e5e7eb;">
          <tr>
            <td style="display: flex; align-items: center; gap: 12px;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${clientName}" style="height: 28px; max-width: 100px; object-fit: contain;">` : ''}
              <span style="font-size: 14px; color: #4b5563; font-weight: 500;">${displayTitle}</span>
            </td>
          </tr>
        </table>

        <!-- 헤더 -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%); padding: 32px;">
          <tr>
            <td align="center">
              <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px auto; line-height: 56px; text-align: center;">
                <span style="font-size: 28px; color: white;">✓</span>
              </div>
              <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">접수 완료</h1>
            </td>
          </tr>
        </table>

        <!-- 본문 -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">
                안녕하세요, ${leadName}님!
              </h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                상담 신청이 정상적으로 접수되었습니다.<br>
                빠른 시일 내에 담당자가 연락드리겠습니다.
              </p>

              <!-- 접수 내용 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="color: ${primaryColor}; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">📋 접수 내용</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${leadInfoRows}
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0; width: 100px;">접수일시</td>
                        <td style="color: #1f2937; font-size: 14px; padding: 8px 0;">${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${operatingHoursHtml}

              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                본 메일은 발신 전용이며, 문의사항은 담당자 연락 시 말씀해주세요.
              </p>
            </td>
          </tr>
        </table>

        <!-- 푸터 -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px;">
          <tr>
            <td align="center">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ${clientName}. All rights reserved.<br>
                Powered by PolarLead
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject: title, html };
}

/**
 * 색상 밝기 조절
 */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
