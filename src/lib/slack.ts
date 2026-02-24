/**
 * 슬랙 메시지 전송 유틸리티
 */

import type { Client } from "@/types";

interface SlackMessageOptions {
  channel: string;
  text: string;
  blocks?: unknown[];
}

interface SlackChannelResponse {
  ok: boolean;
  channel?: {
    id: string;
    name: string;
  };
  error?: string;
}

/**
 * 슬랙 메시지 전송
 */
export async function sendSlackMessage(
  options: SlackMessageOptions,
): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    console.error("[Slack] SLACK_BOT_TOKEN이 설정되지 않았습니다.");
    return false;
  }

  console.log(`[Slack] 메시지 전송 시도 - 채널: ${options.channel}`);

  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel: options.channel,
        text: options.text,
        blocks: options.blocks,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("[Slack] 메시지 전송 실패:", result.error);
      return false;
    }

    console.log(`[Slack] 메시지 전송 성공 - 채널: ${options.channel}`);
    return true;
  } catch (error) {
    console.error("슬랙 메시지 전송 오류:", error);
    return false;
  }
}

/**
 * 이메일로 슬랙 사용자 ID 찾기
 */
async function findUserByEmail(email: string): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || !email) return null;

  try {
    console.log(`[Slack] 이메일로 사용자 검색: ${email}`);
    const response = await fetch(
      `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();
    console.log(
      `[Slack] 사용자 검색 결과:`,
      result.ok ? result.user?.id : result.error,
    );
    return result.ok ? result.user?.id : null;
  } catch (error) {
    console.error("[Slack] 사용자 검색 실패:", error);
    return null;
  }
}

/**
 * 슬랙 채널에 사용자 초대
 */
async function inviteUsersToChannel(
  channelId: string,
  userIds: string[],
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  console.log(
    `[Slack] 채널 ${channelId}에 사용자 초대 시작. 대상: ${userIds.length}명`,
  );
  if (!token || userIds.length === 0) {
    console.log(`[Slack] 초대 건너뜀 (토큰 없음 또는 사용자 0명)`);
    return;
  }

  for (const userId of userIds) {
    try {
      console.log(`[Slack] 사용자 ${userId} 초대 시도...`);
      const response = await fetch(
        "https://slack.com/api/conversations.invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channel: channelId,
            users: userId,
          }),
        },
      );

      const result = await response.json();
      if (result.ok) {
        console.log(`[Slack] 사용자 ${userId}를 채널에 초대 성공`);
      } else if (result.error === "already_in_channel") {
        console.log(`[Slack] 사용자 ${userId}는 이미 채널에 있음`);
      } else {
        console.error(`[Slack] 사용자 ${userId} 초대 실패:`, result.error);
      }
    } catch (error) {
      console.error(`[Slack] 사용자 ${userId} 초대 오류:`, error);
    }
  }
}

/**
 * 슬랙 채널 생성
 * @param name 채널 이름 (영문 소문자, 숫자, 하이픈만 허용, 최대 80자)
 * @returns 생성된 채널 ID 또는 null
 */
export async function createSlackChannel(name: string): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    console.error("SLACK_BOT_TOKEN이 설정되지 않았습니다.");
    return null;
  }

  // 채널명 정규화 (소문자, 하이픈만 허용, 최대 80자)
  const channelName = `lead-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  try {
    const response = await fetch("https://slack.com/api/conversations.create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: channelName,
        is_private: false,
      }),
    });

    const result: SlackChannelResponse = await response.json();
    let channelId: string | null = null;

    if (!result.ok) {
      // 이미 존재하는 채널인 경우 해당 채널 ID 조회
      if (result.error === "name_taken") {
        console.log(
          `채널 ${channelName}이 이미 존재합니다. 기존 채널 조회 중...`,
        );
        channelId = await findSlackChannelByName(channelName);
      } else {
        console.error("슬랙 채널 생성 실패:", result.error);
        return null;
      }
    } else {
      channelId = result.channel?.id || null;
      console.log(
        `슬랙 채널 생성 완료: #${result.channel?.name} (${channelId})`,
      );
    }

    // 관리자 초대 (SLACK_ADMIN_EMAILS 환경변수 사용)
    if (channelId) {
      const adminEmails = process.env.SLACK_ADMIN_EMAILS;
      console.log(
        `[Slack] 관리자 초대 시작. SLACK_ADMIN_EMAILS: ${adminEmails}`,
      );
      if (adminEmails) {
        const emails = adminEmails.split(",").map((e) => e.trim());
        console.log(`[Slack] 초대할 관리자 이메일: ${emails.join(", ")}`);
        const userIds: string[] = [];

        for (const email of emails) {
          const userId = await findUserByEmail(email);
          if (userId) {
            userIds.push(userId);
          } else {
            console.warn(
              `[Slack] 이메일 ${email}에 해당하는 사용자를 찾을 수 없음`,
            );
          }
        }

        console.log(
          `[Slack] 찾은 사용자 ID: ${userIds.join(", ") || "(없음)"}`,
        );
        if (userIds.length > 0) {
          await inviteUsersToChannel(channelId, userIds);
        }
      } else {
        console.log(`[Slack] SLACK_ADMIN_EMAILS 환경변수 없음`);
      }
    }

    return channelId;
  } catch (error) {
    console.error("슬랙 채널 생성 오류:", error);
    return null;
  }
}

/**
 * 채널 이름으로 채널 ID 조회
 */
async function findSlackChannelByName(name: string): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) return null;

  try {
    const response = await fetch(
      `https://slack.com/api/conversations.list?types=public_channel&limit=1000`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!result.ok) {
      console.error("채널 목록 조회 실패:", result.error);
      return null;
    }

    const channel = result.channels?.find(
      (ch: { name: string; id: string }) => ch.name === name,
    );

    return channel?.id || null;
  } catch (error) {
    console.error("채널 조회 오류:", error);
    return null;
  }
}

/**
 * 클라이언트 생성 알림
 */
export async function sendClientCreatedNotification(
  client: Client,
  channel?: string,
): Promise<boolean> {
  const targetChannel =
    channel || client.slackChannelId || process.env.SLACK_QNA_CHANNEL_ID;
  if (!targetChannel) {
    console.error("[Slack] 알림 채널이 설정되지 않았습니다.");
    return false;
  }

  const landingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://lead.polarad.co.kr"}/l/${client.slug}`;

  return sendSlackMessage({
    channel: targetChannel,
    text: `🎉 새 클라이언트 생성: ${client.name}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 새 클라이언트가 생성되었습니다",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*클라이언트명:*\n${client.name}` },
          { type: "mrkdwn", text: `*슬러그:*\n${client.slug}` },
          {
            type: "mrkdwn",
            text: `*상태:*\n${client.status === "active" ? "✅ 활성" : "⏸️ 대기"}`,
          },
          {
            type: "mrkdwn",
            text: `*랜딩 제목:*\n${client.landingTitle || "-"}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*랜딩 페이지:* <${landingUrl}|${landingUrl}>`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📅 생성일시: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
          },
        ],
      },
    ],
  });
}

/**
 * 클라이언트 수정 알림
 */
export async function sendClientUpdatedNotification(
  client: Client,
  changes: string[],
  channel?: string,
): Promise<boolean> {
  const targetChannel =
    channel || client.slackChannelId || process.env.SLACK_QNA_CHANNEL_ID;
  if (!targetChannel) {
    console.error("[Slack] 알림 채널이 설정되지 않았습니다.");
    return false;
  }

  const changesText = changes.length > 0 ? changes.join(", ") : "설정 변경";

  return sendSlackMessage({
    channel: targetChannel,
    text: `✏️ 클라이언트 수정: ${client.name}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "✏️ 클라이언트 설정이 수정되었습니다",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*클라이언트명:*\n${client.name}` },
          { type: "mrkdwn", text: `*슬러그:*\n${client.slug}` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*변경된 항목:*\n${changesText}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📅 수정일시: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
          },
        ],
      },
    ],
  });
}
