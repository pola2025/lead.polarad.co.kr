import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug, updateClient } from '@/lib/airtable';
import { syncFormFieldsToAirtable } from '@/lib/form-fields';
import { DEFAULT_FORM_FIELDS, FormField } from '@/types';
import { sendSlackMessage } from '@/lib/slack';

// 포털 세션 확인
async function verifyPortalSession(slug: string): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`portal_auth_${slug}`);
  return sessionCookie?.value || null;
}

// GET: 클라이언트 정보 조회 (포털용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 세션 확인
    const clientId = await verifyPortalSession(slug);
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 클라이언트 조회
    const client = await getClientBySlug(slug);
    if (!client || client.id !== clientId) {
      return NextResponse.json(
        { success: false, error: '클라이언트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 민감한 정보 제외하고 반환
    return NextResponse.json({
      success: true,
      data: {
        id: client.id,
        name: client.name,
        slug: client.slug,
        landingTitle: client.landingTitle,
        landingDescription: client.landingDescription,
        primaryColor: client.primaryColor,
        logoUrl: client.logoUrl,
        ctaButtonText: client.ctaButtonText,
        thankYouTitle: client.thankYouTitle,
        thankYouMessage: client.thankYouMessage,
        formFields: client.formFields || DEFAULT_FORM_FIELDS,
        // SMS/이메일 알림 설정
        smsEnabled: client.smsEnabled,
        smsTemplate: client.smsTemplate,
        emailEnabled: client.emailEnabled,
        emailSubject: client.emailSubject,
        emailTemplate: client.emailTemplate,
        // 운영시간 설정
        operatingDays: client.operatingDays,
        operatingStartTime: client.operatingStartTime,
        operatingEndTime: client.operatingEndTime,
      },
    });
  } catch (error) {
    console.error('Portal GET error:', error);
    return NextResponse.json(
      { success: false, error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 클라이언트 설정 업데이트 (포털용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 세션 확인
    const clientId = await verifyPortalSession(slug);
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 클라이언트 조회
    const client = await getClientBySlug(slug);
    if (!client || client.id !== clientId) {
      return NextResponse.json(
        { success: false, error: '클라이언트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // 포털에서 수정 가능한 필드만 허용
    const allowedFields = [
      'landingTitle',
      'landingDescription',
      'primaryColor',
      'ctaButtonText',
      'thankYouTitle',
      'thankYouMessage',
      'formFields',
      // SMS/이메일 알림 설정 (NCP SENS는 관리자만 설정)
      'smsEnabled',
      'smsTemplate',
      'emailEnabled',
      'emailSubject',
      'emailTemplate',
      // 운영시간 설정
      'operatingDays',
      'operatingStartTime',
      'operatingEndTime',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 폼 필드 변경 시 Airtable Leads 테이블 스키마 동기화
    if (body.formFields && client.leadsTableId) {
      const oldFields: FormField[] = client.formFields || DEFAULT_FORM_FIELDS;
      const newFields: FormField[] = body.formFields;
      await syncFormFieldsToAirtable(client.leadsTableId, oldFields, newFields);
    }

    // 업데이트 실행
    const updated = await updateClient(client.id, updateData);

    // 슬랙 알림 전송 (클라이언트 채널이 있을 때만)
    const targetChannel = client.slackChannelId || process.env.SLACK_QNA_CHANNEL_ID;
    if (targetChannel) {
      const changedFields = Object.keys(updateData)
        .filter(key => key !== 'formFields')
        .map(key => {
          const labelMap: Record<string, string> = {
            landingTitle: '랜딩 페이지 제목',
            landingDescription: '랜딩 페이지 설명',
            primaryColor: '브랜드 컬러',
            ctaButtonText: 'CTA 버튼 텍스트',
            thankYouTitle: '완료 페이지 제목',
            thankYouMessage: '완료 페이지 메시지',
            smsEnabled: 'SMS 알림',
            smsTemplate: 'SMS 템플릿',
            emailEnabled: '이메일 알림',
            emailSubject: '이메일 제목',
            emailTemplate: '이메일 템플릿',
            operatingDays: '운영요일',
            operatingStartTime: '운영시간 시작',
            operatingEndTime: '운영시간 종료',
          };
          return labelMap[key] || key;
        });

      const hasFormFieldsChange = 'formFields' in updateData;
      if (hasFormFieldsChange) {
        changedFields.push('폼 필드 설정');
      }

      if (changedFields.length > 0) {
        await sendSlackMessage({
          channel: targetChannel,
          text: `⚙️ [${client.name}] 포털 설정이 변경되었습니다: ${changedFields.join(', ')}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `⚙️ *포털 설정 변경*\n클라이언트: \`${client.name}\` (\`${slug}\`)`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*변경된 항목:*\n${changedFields.map(f => `• ${f}`).join('\n')}`,
              },
            },
          ],
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        landingTitle: updated.landingTitle,
        landingDescription: updated.landingDescription,
        primaryColor: updated.primaryColor,
        logoUrl: updated.logoUrl,
        ctaButtonText: updated.ctaButtonText,
        thankYouTitle: updated.thankYouTitle,
        thankYouMessage: updated.thankYouMessage,
        formFields: updated.formFields || DEFAULT_FORM_FIELDS,
        // SMS/이메일 알림 설정
        smsEnabled: updated.smsEnabled,
        smsTemplate: updated.smsTemplate,
        emailEnabled: updated.emailEnabled,
        emailSubject: updated.emailSubject,
        emailTemplate: updated.emailTemplate,
        // 운영시간 설정
        operatingDays: updated.operatingDays,
        operatingStartTime: updated.operatingStartTime,
        operatingEndTime: updated.operatingEndTime,
      },
    });
  } catch (error) {
    console.error('Portal PUT error:', error);
    return NextResponse.json(
      { success: false, error: '업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
