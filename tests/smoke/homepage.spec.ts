import { test, expect } from '../../fixtures/test.fixture.js';

test.describe('Homepage smoke', () => {
  test('loads the configured BRP brand and locale homepage', async ({ homePage, page, site }) => {
    test.info().annotations.push({
      type: 'site',
      description: `${site.brand.displayName} ${site.locale} ${site.baseUrl}`,
    });

    console.log(
      `Testing ${site.brand.displayName} (${site.brand.id}) ${site.locale}: ${site.baseUrl}`,
    );

    const response = await homePage.goto();

    expect(response, `Expected a response from ${site.baseUrl}`).not.toBeNull();
    expect(response?.ok(), `Expected a successful response from ${site.baseUrl}`).toBe(true);
    expect(new URL(page.url()).hostname).toBe(new URL(site.baseUrl).hostname);
    await expect(page.locator('body')).toBeVisible();

    const title = await page.title();
    expect(title.trim().length, 'Expected the page to have a non-empty title').toBeGreaterThan(0);

    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    expect(bodyText).not.toMatch(/\b(404|500|not found|server error)\b/);
  });
});
