import { FileQuestion, Home, Users } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileQuestion className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>

        <h2 className="text-lg font-medium text-gray-700 mb-2">
          페이지를 찾을 수 없습니다
        </h2>

        <p className="text-gray-500 mb-6">
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            홈으로 이동
          </Link>

          <Link
            href="/clients"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Users className="h-4 w-4" />
            클라이언트 목록
          </Link>
        </div>
      </div>
    </div>
  );
}
