import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { getClientBySlug, updateClient } from "@/lib/airtable";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "slug가 필요합니다." },
        { status: 400 }
      );
    }

    const client = await getClientBySlug(slug);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "클라이언트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const title = client.landingTitle || `${client.name} - 상담 신청`;
    const primaryColor = client.primaryColor || "#3b82f6";
    // 서비스 특징 (최대 3개만 표시)
    const features = (client.productFeatures || []).slice(0, 3);

    // ImageResponse를 사용해서 이미지 생성
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#ffffff",
            padding: "60px",
          }}
        >
          {/* 상단 컬러 바 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              backgroundColor: primaryColor,
            }}
          />

          {/* 로고 (있는 경우) */}
          {client.logoUrl && (
            <img
              src={client.logoUrl}
              alt={client.name}
              style={{
                height: "80px",
                marginBottom: "40px",
                objectFit: "contain",
              }}
            />
          )}

          {/* 제목 */}
          <div
            style={{
              display: "flex",
              fontSize: "52px",
              fontWeight: "bold",
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.3,
              maxWidth: "900px",
              marginBottom: "24px",
            }}
          >
            {title}
          </div>

          {/* 서비스 특징 */}
          {features.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "24px",
                    color: "#374151",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{feature.icon || "✓"}</span>
                  <span>{feature.text.length > 40 ? feature.text.slice(0, 40) + "..." : feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA 버튼 스타일 */}
          <div
            style={{
              display: "flex",
              marginTop: "48px",
              padding: "18px 48px",
              backgroundColor: primaryColor,
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: "600",
              borderRadius: "12px",
            }}
          >
            {client.ctaButtonText || "상담 신청하기"}
          </div>

          {/* 하단 브랜딩 */}
          <div
            style={{
              position: "absolute",
              bottom: "30px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#9ca3af",
            }}
          >
            <span>Powered by</span>
            <span style={{ fontWeight: "600", color: "#6b7280" }}>PolarAd</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // ImageResponse를 Buffer로 변환
    const arrayBuffer = await imageResponse.arrayBuffer();
    const pngBuffer = Buffer.from(arrayBuffer);

    // WebP로 압축 (목표: 10~30KB)
    let webpBuffer: Buffer;
    let quality = 80;
    const targetMaxSize = 30 * 1024; // 30KB
    const targetMinSize = 10 * 1024; // 10KB

    // 품질을 조절하며 목표 크기에 맞춤
    do {
      webpBuffer = await sharp(pngBuffer)
        .webp({ quality })
        .toBuffer();

      // 목표 범위 내면 완료
      if (webpBuffer.length <= targetMaxSize && webpBuffer.length >= targetMinSize) {
        break;
      }

      // 너무 크면 품질 감소
      if (webpBuffer.length > targetMaxSize) {
        quality -= 10;
      }
      // 너무 작으면 품질 증가
      else if (webpBuffer.length < targetMinSize && quality < 80) {
        quality += 5;
        break; // 작은 건 괜찮음
      }
    } while (quality >= 20);

    console.log(`[OG Image] ${slug}: ${(webpBuffer.length / 1024).toFixed(1)}KB (quality: ${quality})`);

    // R2에 업로드
    const ogImageUrl = await uploadToR2(
      webpBuffer,
      `og-${slug}.webp`,
      "image/webp",
      "polarlead/og-images"
    );

    // Airtable에 ogImageUrl 저장
    await updateClient(client.id, { ogImageUrl });

    return NextResponse.json({
      success: true,
      data: { ogImageUrl },
    });
  } catch (error) {
    console.error("OG 이미지 생성 실패:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { success: false, error: `OG 이미지 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
