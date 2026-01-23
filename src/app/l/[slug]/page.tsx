import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getClientBySlug } from "@/lib/airtable";
import LandingClient from "./LandingClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await getClientBySlug(slug);

  if (!client) {
    return {
      title: "페이지를 찾을 수 없습니다",
    };
  }

  const title = client.landingTitle || `${client.name} - 상담 신청`;
  const description = client.landingDescription || `${client.name}에서 제공하는 서비스에 대해 상담을 신청하세요.`;
  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://lead.polarad.co.kr"
    : "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/l/${slug}`,
      images: [
        {
          url: `${baseUrl}/api/og?slug=${slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/api/og?slug=${slug}`],
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;

  const client = await getClientBySlug(slug);

  if (!client || client.status !== "active") {
    notFound();
  }

  // 서버에서 데이터를 가져와서 클라이언트 컴포넌트에 전달
  return (
    <LandingClient
      client={{
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
        productFeatures: client.productFeatures,
        formFields: client.formFields,
      }}
    />
  );
}
