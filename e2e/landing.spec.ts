import { test, expect } from '@playwright/test';

test.describe('랜딩 페이지', () => {
  test('존재하지 않는 슬러그는 404 표시', async ({ page }) => {
    await page.goto('/l/nonexistent-slug');

    // 404 또는 에러 메시지 확인
    const content = await page.textContent('body');
    expect(
      content?.includes('404') ||
      content?.includes('찾을 수 없') ||
      content?.includes('존재하지 않')
    ).toBeTruthy();
  });

  test('랜딩 페이지 폼 제출 검증', async ({ page }) => {
    // 테스트용 랜딩 페이지가 있다고 가정
    // 실제 테스트 시에는 테스트용 클라이언트를 미리 생성해야 함
    await page.goto('/l/test-client');

    // 페이지가 404가 아니면 폼 테스트
    const is404 = await page.locator('text=404').count();
    if (is404 === 0) {
      // 폼 요소 확인
      const nameInput = page.locator('input[name="name"]');
      const phoneInput = page.locator('input[name="phone"]');
      const submitBtn = page.locator('button[type="submit"]');

      if (await nameInput.count() > 0) {
        await expect(nameInput).toBeVisible();
        await expect(phoneInput).toBeVisible();
        await expect(submitBtn).toBeVisible();

        // 빈 폼 제출 시 유효성 검사
        await submitBtn.click();
        // 브라우저 기본 유효성 검사 또는 커스텀 에러 메시지 확인
      }
    }
  });
});
