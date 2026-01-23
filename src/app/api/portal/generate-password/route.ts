import { NextRequest, NextResponse } from 'next/server';
import { sendPortalPassword, createSlackChannel } from '@/lib/slack';
import { getClientBySlug, updateClient } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: '슬러그가 필요합니다.' },
        { status: 400 }
      );
    }

    // 클라이언트 조회하여 slackChannelId 확인
    const client = await getClientBySlug(slug);
    if (!client) {
      return NextResponse.json(
        { success: false, error: '클라이언트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // slackChannelId가 없으면 채널 자동 생성
    let channelId: string | undefined = client.slackChannelId;
    if (!channelId) {
      channelId = (await createSlackChannel(slug)) ?? undefined;
      if (channelId) {
        await updateClient(client.id, { slackChannelId: channelId });
      }
    }

    // 비밀번호 생성 및 슬랙 전송 (클라이언트 채널로)
    const password = await sendPortalPassword(slug, channelId || undefined);

    if (!password) {
      return NextResponse.json(
        { success: false, error: '슬랙 전송에 실패했습니다. 슬랙 설정을 확인해주세요.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '비밀번호가 슬랙으로 전송되었습니다.',
    });
  } catch (error) {
    console.error('Password generation error:', error);
    return NextResponse.json(
      { success: false, error: '비밀번호 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
