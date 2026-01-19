"use client";

import Sidebar from "@/components/Sidebar";
import { Settings, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="mt-1 text-sm text-gray-500">
            시스템 설정을 관리합니다.
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* 알림 설정 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">알림 설정</h2>
                <p className="text-sm text-gray-500">텔레그램 알림 설정</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  어드민 텔레그램 채팅 ID
                </label>
                <input
                  type="text"
                  placeholder="관리자 알림을 받을 채팅 ID"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  시스템 오류, 일일 리포트 등 관리자 알림용
                </p>
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">보안 설정</h2>
                <p className="text-sm text-gray-500">접근 제어 및 보안</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    IP 기반 접근 제한
                  </p>
                  <p className="text-xs text-gray-500">
                    허용된 IP만 어드민 접근 가능
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    2단계 인증
                  </p>
                  <p className="text-xs text-gray-500">
                    로그인 시 추가 인증 요구
                  </p>
                </div>
                <span className="text-xs text-gray-400">준비 중</span>
              </div>
            </div>
          </div>

          {/* 데이터 관리 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">데이터 관리</h2>
                <p className="text-sm text-gray-500">데이터 백업 및 내보내기</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    리드 데이터 내보내기
                  </p>
                  <p className="text-xs text-gray-500">
                    CSV 또는 Excel 형식으로 내보내기
                  </p>
                </div>
                <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  내보내기
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Airtable 연결 상태
                  </p>
                  <p className="text-xs text-gray-500">
                    Base ID: appyvTlolbRo05LrN
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  연결됨
                </span>
              </div>
            </div>
          </div>

          {/* 시스템 정보 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">시스템 정보</h2>
                <p className="text-sm text-gray-500">버전 및 환경 정보</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">버전</span>
                <span className="text-gray-900">0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">환경</span>
                <span className="text-gray-900">
                  {process.env.NODE_ENV === "production" ? "프로덕션" : "개발"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next.js</span>
                <span className="text-gray-900">15.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
