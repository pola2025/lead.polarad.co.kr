import { NextRequest, NextResponse } from 'next/server';
import { sendSlackMessage, generatePassword } from '@/lib/slack';
import { getClientBySlug, updateClient } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const { slug, regenerate = false } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: '슬러그가 필요합니다.' },
        { status: 400 }
      );
    }

    // 클라이언트 조회
    const client = await getClientBySlug(slug);
    if (!client) {
      return NextResponse.json(
        { success: false, error: '클라이언트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // slackChannelId 확인 (관리자가 클라이언트 생성 시 입력한 채널)
    const channelId = client.slackChannelId;
    if (!channelId) {
      return NextResponse.json(
        { success: false, error: '슬랙 채널이 설정되지 않았습니다. 클라이언트 설정에서 슬랙 채널 ID를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 결정: 재발급이거나 기존 비밀번호가 없으면 새로 생성
    let password: string;
    let isNew = false;

    console.log(`[Portal Password] Client: ${slug}, existing password: ${client.portalPassword ? 'YES' : 'NO'}, regenerate: ${regenerate}`);

    if (regenerate || !client.portalPassword) {
      password = generatePassword();
      isNew = true;
      // Airtable에 새 비밀번호 저장
      console.log(`[Portal Password] Saving new password to Airtable...`);
      await updateClient(client.id, { portalPassword: password });
      console.log(`[Portal Password] Password saved successfully`);
    } else {
      password = client.portalPassword;
    }

    // 슬랙으로 전송 (클라이언트에 설정된 채널로)
    const actionText = isNew ? '새로 생성됨' : '기존 비밀번호';
    const success = await sendSlackMessage({
      channel: channelId,
      text: `🔐 포털 비밀번호 (${actionText})`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🔐 *포털 비밀번호* (${actionText})\n클라이언트: \`${slug}\``,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*비밀번호:*\n\`\`\`${password}\`\`\``,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `포털 URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://polarlead.kr'}/portal/${slug}/login`,
            },
          ],
        },
      ],
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: '슬랙 전송에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isNew ? '새 비밀번호가 생성되어 슬랙으로 전송되었습니다.' : '기존 비밀번호가 슬랙으로 전송되었습니다.',
      isNew,
    });
  } catch (error) {
    console.error('Password generation error:', error);
    return NextResponse.json(
      { success: false, error: '비밀번호 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
