import { test as base } from '@playwright/test';

import { siteContext } from '../config/environment.js';
import { HomePage } from '../pages/home.page.js';
import type { SiteContext } from '../types/site.types.js';

type BrpFixtures = {
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
});

export { expect } from '@playwright/test';
