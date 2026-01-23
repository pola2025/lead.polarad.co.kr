import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * 텔레그램 알림 테스트
 * - 에어테이블 공유 URL 포함 여부
 * - 미리보기 비활성화 옵션
 */

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// sendTelegramNotification 함수 시뮬레이션 (실제 구현 후 import로 변경)
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

  // 채널/그룹 ID 자동 보정
  let normalizedChatId = chatId;
  if (/^100\d+$/.test(chatId)) {
    normalizedChatId = `-${chatId}`;
  }

  let message = `🔔 새로운 리드 접수

📋 클라이언트: ${data.clientName}
👤 이름: ${data.leadName}
📞 연락처: ${data.phone}
🕐 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;

  // 에어테이블 URL 추가
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

describe("sendTelegramNotification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  it("에어테이블 URL 없을 때 기존 메시지 형식 유지", async () => {
    await sendTelegramNotification("123456789", {
      clientName: "테스트 클라이언트",
      leadName: "홍길동",
      phone: "010-1234-5678",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.text).toContain("🔔 새로운 리드 접수");
    expect(body.text).toContain("테스트 클라이언트");
    expect(body.text).toContain("홍길동");
    expect(body.text).toContain("010-1234-5678");
    expect(body.text).not.toContain("에어테이블");
  });

  it("에어테이블 URL 있을 때 URL 포함 확인", async () => {
    const airtableUrl = "https://airtable.com/appXXX/shrYYY";

    await sendTelegramNotification("123456789", {
      clientName: "테스트 클라이언트",
      leadName: "홍길동",
      phone: "010-1234-5678",
      airtableShareUrl: airtableUrl,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.text).toContain("📊 에어테이블:");
    expect(body.text).toContain(airtableUrl);
  });

  it("disable_web_page_preview 옵션 포함 확인", async () => {
    await sendTelegramNotification("123456789", {
      clientName: "테스트 클라이언트",
      leadName: "홍길동",
      phone: "010-1234-5678",
      airtableShareUrl: "https://airtable.com/appXXX/shrYYY",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.disable_web_page_preview).toBe(true);
  });

  it("채널 ID 100으로 시작하면 -100으로 변환", async () => {
    await sendTelegramNotification("1001234567890", {
      clientName: "테스트",
      leadName: "테스트",
      phone: "010-0000-0000",
    });

    const [url, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.chat_id).toBe("-1001234567890");
  });

  it("TELEGRAM_BOT_TOKEN 없으면 함수 종료", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    await sendTelegramNotification("123456789", {
      clientName: "테스트",
      leadName: "테스트",
      phone: "010-0000-0000",
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
