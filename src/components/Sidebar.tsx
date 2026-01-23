"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldBan,
  BarChart3,
  Settings,
  LineChart,
  Menu,
  X,
  MoreHorizontal,
} from "lucide-react";

const menuItems = [
  {
    name: "대시보드",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "클라이언트",
    href: "/clients",
    icon: Users,
  },
  {
    name: "리드 관리",
    href: "/leads",
    icon: FileText,
  },
  {
    name: "블랙리스트",
    href: "/blacklist",
    icon: ShieldBan,
  },
  {
    name: "통계",
    href: "/stats",
    icon: BarChart3,
  },
  {
    name: "GA4 설정",
    href: "/ga4-settings",
    icon: LineChart,
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
];

// 모바일 하단 바에 표시할 핵심 메뉴 (최대 5개)
const mobileMainItems = [
  { name: "홈", href: "/", icon: LayoutDashboard },
  { name: "클라이언트", href: "/clients", icon: Users },
  { name: "리드", href: "/leads", icon: FileText },
  { name: "통계", href: "/stats", icon: BarChart3 },
];

// 더보기 메뉴에 들어갈 항목
const mobileMoreItems = [
  { name: "블랙리스트", href: "/blacklist", icon: ShieldBan },
  { name: "GA4 설정", href: "/ga4-settings", icon: LineChart },
  { name: "설정", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // 현재 페이지가 더보기 메뉴에 있는지 확인
  const isMoreActive = mobileMoreItems.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <>
      {/* 데스크톱 사이드바 - md 이상에서만 표시 */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white hidden md:block">
        {/* 로고 */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
              P
            </div>
            <span className="text-lg font-semibold text-gray-900">polarlead</span>
          </Link>
        </div>

        {/* 메뉴 */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500">
            <p>polarlead Admin v0.1.0</p>
            <p className="mt-1">© 2025 polarad</p>
          </div>
        </div>
      </aside>

      {/* 모바일 상단 헤더 - md 미만에서만 표시 */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
            P
          </div>
          <span className="text-lg font-semibold text-gray-900">polarlead</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* 모바일 전체 메뉴 (햄버거 메뉴 클릭 시) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-2">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* 모바일 하단 네비게이션 바 - md 미만에서만 표시 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden safe-area-pb">
        <div className="flex justify-around items-center h-14">
          {mobileMainItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[64px] py-1 ${
                  isActive ? "text-primary-600" : "text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 font-medium break-keep">{item.name}</span>
              </Link>
            );
          })}

          {/* 더보기 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex flex-col items-center justify-center min-w-[64px] py-1 ${
                isMoreActive ? "text-primary-600" : "text-gray-500"
              }`}
              aria-label="더보기 메뉴"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-medium break-keep">더보기</span>
            </button>

            {/* 더보기 팝업 메뉴 */}
            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <ul className="py-1">
                    {mobileMoreItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-primary-50 text-primary-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="break-keep">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
