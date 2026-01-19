import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "polarlead 어드민",
  description: "리드 수집 랜딩 페이지 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
