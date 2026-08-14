import { test as base } from '@playwright/test';

import { siteContext } from '../config/environment.js';
import { DealerLocatorPage } from '../pages/dealer-locator.page.js';
import { HomePage } from '../pages/home.page.js';
import type { SiteContext } from '../types/site.types.js';

type BrpFixtures = {
  dealerLocatorPage: DealerLocatorPage;
  homePage: HomePage;
  site: SiteContext;
};

export const test = base.extend<BrpFixtures>({
  site: async ({ page: _page }, use) => {
    await use(siteContext);
  },

  homePage: async ({ page, site }, use) => {
    await use(new HomePage(page, site));
  },

  dealerLocatorPage: async ({ page, site }, use) => {
    await use(new DealerLocatorPage(page, site));
  },
});

export { expect } from '@playwright/test';
