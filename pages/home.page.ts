import type { Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { HeaderComponent } from '../components/header.component.js';
import { FooterComponent } from '../components/footer.component.js';
import { CookieBannerComponent } from '../components/cookie-banner.component.js';
import { PromotionalModalComponent } from '../components/promotional-modal.component.js';

export class HomePage extends BasePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly cookieBanner: CookieBannerComponent;
  readonly promotionalModal: PromotionalModalComponent;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);

    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.cookieBanner = new CookieBannerComponent(page);
    this.promotionalModal = new PromotionalModalComponent(page);
  }

  async prepareForInteraction(): Promise<void> {
    await this.cookieBanner.dismissIfVisible();
    await this.promotionalModal.dismissIfVisible();
  }
}
