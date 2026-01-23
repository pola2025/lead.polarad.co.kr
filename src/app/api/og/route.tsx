import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getClientBySlug } from "@/lib/airtable";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#f3f4f6",
            fontSize: 32,
            color: "#6b7280",
          }}
        >
          페이지를 찾을 수 없습니다
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const client = await getClientBySlug(slug);

  if (!client) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#f3f4f6",
            fontSize: 32,
            color: "#6b7280",
          }}
        >
          페이지를 찾을 수 없습니다
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const title = client.landingTitle || `${client.name} - 상담 신청`;
  const description = client.landingDescription || `${client.name}에서 제공하는 서비스에 대해 상담을 신청하세요.`;
  const primaryColor = client.primaryColor || "#3b82f6";

  return new ImageResponse(
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
              height: "60px",
              marginBottom: "30px",
              objectFit: "contain",
            }}
          />
        )}

        {/* 제목 */}
        <div
          style={{
            display: "flex",
            fontSize: "56px",
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "900px",
            marginBottom: "20px",
          }}
        >
          {title}
        </div>

        {/* 설명 */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#6b7280",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {description.length > 100 ? description.slice(0, 100) + "..." : description}
        </div>

        {/* CTA 버튼 스타일 */}
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            padding: "16px 40px",
            backgroundColor: primaryColor,
            color: "#ffffff",
            fontSize: "24px",
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
            fontSize: "18px",
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
}
