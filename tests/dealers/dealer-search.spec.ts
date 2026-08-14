import { test, expect } from '../../fixtures/test.fixture.js';

import { loadDealerData } from '../../utils/dealer-data.js';

test.describe('Dealer Locator', () => {
  test('returns dealers for a valid location', async ({
    dealerLocatorPage,
    site,
  }) => {
    const dealerData = await loadDealerData(
      site.brand.id,
      site.locale,
    );

    await dealerLocatorPage.goto();

    await dealerLocatorPage.searchLocation(
      dealerData.location,
    );

    await dealerLocatorPage.waitForSearchResults();

    await expect(
      dealerLocatorPage.dealerPhones.first(),
    ).toBeVisible();

    await dealerLocatorPage.takeScreenshot(
      `dealer-search-${site.brand.id}-${site.locale}.png`,
    );
  });
});