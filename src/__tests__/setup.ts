import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup();
});

// 전역 mock 설정
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));
