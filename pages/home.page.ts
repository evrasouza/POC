import type { Page } from '@playwright/test';

import { CookieBannerComponent } from '../components/cookie-banner.component.js';
import { FooterComponent } from '../components/footer.component.js';
import { HeaderComponent } from '../components/header.component.js';
import { PromotionalModalComponent } from '../components/promotional-modal.component.js';
import type { SiteContext } from '../types/site.types.js';
import { BasePage } from './base.page.js';

export class HomePage extends BasePage {
  readonly cookieBanner: CookieBannerComponent;
  readonly footer: FooterComponent;
  readonly header: HeaderComponent;
  readonly promotionalModal: PromotionalModalComponent;

  constructor(page: Page, site: SiteContext) {
    super(page, site);

    this.cookieBanner = new CookieBannerComponent(page);
    this.footer = new FooterComponent(page);
    this.header = new HeaderComponent(page);
    this.promotionalModal = new PromotionalModalComponent(page);
  }

  async prepareForInteraction(): Promise<void> {
    await this.cookieBanner.dismissIfVisible();
    await this.promotionalModal.dismissIfVisible();
  }
}
