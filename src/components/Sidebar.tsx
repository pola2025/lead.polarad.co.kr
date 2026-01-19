"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldBan,
  BarChart3,
  Settings,
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
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
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
  );
}
