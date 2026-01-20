import { test, expect } from '@playwright/test';

test.describe('인증 흐름', () => {
  test('로그인 페이지 표시', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('로그인');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('인증 없이 대시보드 접근 시 로그인으로 리다이렉트', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
  });

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid password')).toBeVisible({ timeout: 5000 });
  });

  test('올바른 비밀번호로 로그인 성공', async ({ page }) => {
    const password = process.env.ADMIN_PASSWORD || 'test123';

    await page.goto('/login');

    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('대시보드');
  });
});

test.describe('인증된 사용자', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    const password = process.env.ADMIN_PASSWORD || 'test123';
    await page.goto('/login');
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('대시보드 표시', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('대시보드');
    await expect(page.locator('text=전체 클라이언트')).toBeVisible();
    await expect(page.locator('text=이번 달 리드')).toBeVisible();
  });

  test('사이드바 네비게이션 작동', async ({ page }) => {
    // 클라이언트 페이지로 이동
    await page.click('a[href="/clients"]');
    await expect(page).toHaveURL('/clients');
    await expect(page.locator('h1')).toContainText('클라이언트');

    // 리드 페이지로 이동
    await page.click('a[href="/leads"]');
    await expect(page).toHaveURL('/leads');
    await expect(page.locator('h1')).toContainText('리드');
  });
});
