import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 도메인 허용 (클라이언트 로고 등)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
