"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">
              심각한 오류가 발생했습니다
            </h1>

            <p className="text-gray-500 mb-6">
              애플리케이션에 문제가 발생했습니다.
              <br />
              페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-400 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
