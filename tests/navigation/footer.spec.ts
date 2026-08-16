// tests/navigation/footer.spec.ts
import { test, expect } from '../../fixtures/test.fixture.js';
import { setAllureMetadata } from '../../utils/allure-metadata.js';

test.describe('Global Footer', () => {
  test('displays the shared global footer', async ({ homePage, site }) => {
    await setAllureMetadata({
      epic: 'BRP Websites',
      feature: 'Navigation',
      story: 'Global Footer',
      severity: 'critical',
      layer: 'e2e',
    });

    test.info().annotations.push({
      type: 'site',
      description: `${site.brand.displayName} ${site.locale}`,
    });

    await homePage.goto();

    await expect(homePage.footer.root).toBeVisible();

    const linkCount = await homePage.footer.linkCount();

    expect(linkCount, 'Expected the global footer to contain navigable links').toBeGreaterThan(0);
  });

  test('resolves an internal footer link to a valid destination', async ({
    homePage,
    page,
    site,
  }) => {
    await setAllureMetadata({
      epic: 'BRP Websites',
      feature: 'Navigation',
      story: 'Global Footer',
      severity: 'critical',
      layer: 'e2e',
    });

    await homePage.goto();

    await homePage.footer.root.scrollIntoViewIfNeeded();

    await homePage.prepareForInteraction();

    const link = await homePage.footer.getFirstInternalNavigableLink();

    expect(
      link,
      `Expected an internal navigable link in the ${site.brand.displayName} footer`,
    ).not.toBeNull();

    const href = await link!.getAttribute('href');

    expect(href, 'Expected the footer link to contain an href').toBeTruthy();

    const targetUrl = new URL(href!, page.url());

    expect(targetUrl.hostname).toBe(new URL(site.baseUrl).hostname);

    const response = await page.goto(targetUrl.href, {
      waitUntil: 'domcontentloaded',
    });

    expect(
      response,
      `Expected navigation to ${targetUrl.href} to return a response`,
    ).not.toBeNull();

    expect(
      response!.ok(),
      `Expected ${targetUrl.href} to load successfully but received HTTP ${response!.status()}`,
    ).toBeTruthy();

    expect(new URL(page.url()).hostname).toBe(new URL(site.baseUrl).hostname);
  });
});
