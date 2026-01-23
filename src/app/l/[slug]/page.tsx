import { notFound } from "next/navigation";
import { getClientBySlug } from "@/lib/airtable";
import LandingClient from "./LandingClient";

interface PageProps {
  params: Promise<{ slug: string }>;
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
