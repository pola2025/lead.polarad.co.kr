import Sidebar from "@/components/Sidebar";
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// 임시 통계 데이터 (나중에 API에서 가져옴)
const stats = [
  {
    name: "전체 클라이언트",
    value: "0",
    change: "-",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    name: "이번 달 리드",
    value: "0",
    change: "-",
    icon: FileText,
    color: "bg-green-500",
  },
  {
    name: "전환율",
    value: "0%",
    change: "-",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
  {
    name: "블랙리스트",
    value: "0",
    change: "-",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">
            polarlead 리드 관리 현황을 확인하세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {stat.change !== "-" ? (
                    <span
                      className={
                        stat.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>
                  ) : (
                    <span className="text-gray-400">데이터 없음</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 최근 리드 섹션 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            최근 접수된 리드
          </h2>
          <div className="card">
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mb-4 text-gray-300" />
              <p>아직 접수된 리드가 없습니다.</p>
              <p className="text-sm mt-1">
                클라이언트를 등록하고 리드 수집을 시작하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 활성 클라이언트 섹션 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            활성 클라이언트
          </h2>
          <div className="card">
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="h-12 w-12 mb-4 text-gray-300" />
              <p>등록된 클라이언트가 없습니다.</p>
              <a
                href="/clients/new"
                className="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                클라이언트 등록하기
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
