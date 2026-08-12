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

  test('navigates through an internal header link', async ({ homePage, page, site }) => {
    await homePage.goto();

    await homePage.prepareForInteraction();

    const initialUrl = page.url();

    const link = await homePage.header.getFirstInternalNavigableLink();

    expect(
      link,
      `Expected an internal navigable link in the ${site.brand.displayName} header`,
    ).not.toBeNull();

    await link!.click();

    await expect(page).not.toHaveURL(initialUrl);

    expect(new URL(page.url()).hostname).toBe(new URL(site.baseUrl).hostname);
  });
});
