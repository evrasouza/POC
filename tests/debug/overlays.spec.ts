import { test, expect } from '../../fixtures/test.fixture.js';

test.describe('Global overlays', () => {
  test('dismisses cookie consent', async ({ homePage }) => {
    await homePage.goto();

    await homePage.cookieBanner.dismissIfVisible();

    await expect(homePage.cookieBanner.dialog).toBeHidden();
  });

  test('dismisses promotional modal', async ({ homePage, page }) => {
    await homePage.goto();

    await homePage.cookieBanner.dismissIfVisible();

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await homePage.promotionalModal.dismissIfVisible();

    await expect(homePage.promotionalModal.root).toBeHidden();
  });
});