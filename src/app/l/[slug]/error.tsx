"use client";

import { useEffect } from "react";

export default function LandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">페이지를 불러올 수 없습니다</h1>
        <p className="text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
