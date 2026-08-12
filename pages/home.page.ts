import type { Page } from '@playwright/test';

import { CookieBannerComponent } from '../components/cookie-banner.component.js';
import { FooterComponent } from '../components/footer.component.js';
import { HeaderComponent } from '../components/header.component.js';
import { BasePage } from './base.page.js';
import type { SiteContext } from '../types/site.types.js';

export class HomePage extends BasePage {
  readonly cookieBanner: CookieBannerComponent;
  readonly footer: FooterComponent;
  readonly header: HeaderComponent;

  constructor(page: Page, site: SiteContext) {
    super(page, site);
    this.cookieBanner = new CookieBannerComponent(page);
    this.footer = new FooterComponent(page);
    this.header = new HeaderComponent(page);
  }
}
