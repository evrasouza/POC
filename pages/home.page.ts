// pages/home.page.ts
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
    const timeout = 8_000;
    const pollInterval = 250;
    const stablePeriod = 1_000;

    const startTime = Date.now();
    let stableSince: number | null = null;

    while (Date.now() - startTime < timeout) {
      const cookieVisible = await this.cookieBanner.isVisible();
      const promotionalModalVisible =
        await this.promotionalModal.isVisible();

      if (cookieVisible) {
        await this.cookieBanner.dismissIfVisible();
        stableSince = null;

        await this.page.waitForTimeout(pollInterval);
        continue;
      }

      if (promotionalModalVisible) {
        await this.promotionalModal.dismissIfVisible();
        stableSince = null;

        await this.page.waitForTimeout(pollInterval);
        continue;
      }

      if (stableSince === null) {
        stableSince = Date.now();
      }

      if (Date.now() - stableSince >= stablePeriod) {
        return;
      }

      await this.page.waitForTimeout(pollInterval);
    }

    throw new Error(
      'Page did not become stable because a blocking overlay remained visible.',
    );
  }
}