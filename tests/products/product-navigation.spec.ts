import { test, expect } from '../../fixtures/test.fixture.js';

import { loadNavigationData } from '../../utils/navigation-data.js';

test.describe('Product Navigation', () => {
  test('validates configured navigation links', async ({ homePage, site }) => {
    const navigationData = await loadNavigationData(site.brand.id, site.locale);

    await homePage.goto();
    await homePage.prepareForInteraction();

    await expect(homePage.header.navigation).toBeVisible();

    for (const item of navigationData.navigationItems) {
      if (
        !item.href ||
        item.href.startsWith('javascript:') ||
        item.href.startsWith('mailto:') ||
        item.href.startsWith('tel:')
      ) {
        continue;
      }

      await test.step(`Validate navigation item: ${item.text || item.href}`, async () => {
        const matchingLink = homePage.header.navigation.locator(`a[href="${item.href}"]`);

        await expect(
          matchingLink.first(),
          `Expected "${item.text || item.href}" to exist in the navigation`,
        ).toBeVisible();
      });
    }
  });
});
