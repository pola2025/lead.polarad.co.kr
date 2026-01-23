import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// /l/[slug]/form 으로 직접 접근 시 메인 랜딩으로 리다이렉트
export default async function FormPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/l/${slug}`);
}
