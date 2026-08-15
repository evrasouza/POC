// tests/navigation/header.spec.ts
import { test, expect } from '../../fixtures/test.fixture.js';

test.describe('Global Header', () => {
  test('displays the shared global navigation', async ({ homePage, site }) => {
    test.info().annotations.push({
      type: 'site',
      description: `${site.brand.displayName} ${site.locale}`,
    });

    await homePage.goto();

    await expect(homePage.header.root).toBeVisible();
    await expect(homePage.header.navigation).toBeVisible();

    const linkCount = await homePage.header.linkCount();

    expect(linkCount, 'Expected the global header to contain navigable links').toBeGreaterThan(0);
  });

  test('discovers internal navigable destinations from the main navigation', async ({
    homePage,
    site,
  }) => {
    test.info().annotations.push({
      type: 'site',
      description: `${site.brand.displayName} ${site.locale}`,
    });

    await homePage.goto();

    await homePage.prepareForInteraction();

    const urls = await homePage.header.getInternalNavigableUrls();

    expect(
      urls.length,
      `Expected the ${site.brand.displayName} main navigation to contain internal navigable destinations`,
    ).toBeGreaterThan(0);

    const expectedHostname = new URL(site.baseUrl).hostname;

    for (const url of urls) {
      expect(url.hostname, `Expected ${url.href} to belong to ${expectedHostname}`).toBe(
        expectedHostname,
      );
    }
  });

  test('validates all internal main navigation destinations', async ({ homePage, page, site }) => {
    test.info().annotations.push({
      type: 'site',
      description: `${site.brand.displayName} ${site.locale}`,
    });

    await homePage.goto();

    await homePage.prepareForInteraction();

    const urls = await homePage.header.getInternalNavigableUrls();

    expect(
      urls.length,
      `Expected the ${site.brand.displayName} main navigation to contain internal navigable destinations`,
    ).toBeGreaterThan(0);

    for (const url of urls) {
      const response = await page.request.get(url.href);

      expect(
        response.ok(),
        `Expected ${url.href} to load successfully but received HTTP ${response.status()}`,
      ).toBeTruthy();
    }
  });
});
