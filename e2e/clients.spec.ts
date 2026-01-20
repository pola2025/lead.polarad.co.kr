import { test, expect } from '@playwright/test';

test.describe('클라이언트 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    const password = process.env.ADMIN_PASSWORD || 'test123';
    await page.goto('/login');
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('클라이언트 목록 페이지 표시', async ({ page }) => {
    await page.goto('/clients');

    await expect(page.locator('h1')).toContainText('클라이언트');
    await expect(page.locator('a[href="/clients/new"]')).toBeVisible();
  });

  test('클라이언트 등록 페이지 표시', async ({ page }) => {
    await page.goto('/clients/new');

    await expect(page.locator('h1')).toContainText('클라이언트');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="slug"]')).toBeVisible();
  });

  test('클라이언트 등록 폼 유효성 검사', async ({ page }) => {
    await page.goto('/clients/new');

    // 빈 폼 제출 시도
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // 필수 필드 유효성 검사 확인 (브라우저 기본 또는 커스텀)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });
});
