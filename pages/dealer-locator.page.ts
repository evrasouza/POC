import type { Locator, Page, Response } from '@playwright/test';
import { getDealerLocatorConfig } from '../config/dealer-locator.js';
import type { SiteContext } from '../types/site.types.js';
import { BasePage } from './base.page.js';

export class DealerLocatorPage extends BasePage {
  readonly searchInput: Locator;
  readonly dealerPhones: Locator;

  constructor(
    private readonly dealerPage: Page,
    site: SiteContext,
  ) {
    super(dealerPage, site);

    this.searchInput = dealerPage.getByRole('searchbox').first();

    this.dealerPhones = dealerPage.locator('main a[href^="tel:"]:visible');
  }

  async goto(): Promise<Response | null> {
    const origin = new URL(this.site.baseUrl).origin;

    await this.dealerPage.context().grantPermissions(['geolocation'], { origin });

    await this.dealerPage.context().setGeolocation({
      latitude: 45.5017,
      longitude: -73.5673,
    });

    const dealerConfig = getDealerLocatorConfig(this.site.brand.id);

    const dealerUrl = dealerConfig.getUrl(this.site);

    const response = await this.dealerPage.goto(dealerUrl, {
      waitUntil: 'domcontentloaded',
    });

    await this.handleDealerConsent();

    await this.dismissDealerPromoIfVisible();

    await this.searchInput.waitFor({
      state: 'visible',
      timeout: 15_000,
    });

    return response;
  }

  async searchLocation(location: string): Promise<void> {
    await this.handleDealerConsent();

    await this.dismissDealerPromoIfVisible();

    await this.searchInput.fill(location);

    const autocompleteOption = this.dealerPage.locator('.pac-item:visible').first();

    const autocompleteVisible = await autocompleteOption
      .waitFor({
        state: 'visible',
        timeout: 3_000,
      })
      .then(() => true)
      .catch(() => false);

    if (autocompleteVisible) {
      await autocompleteOption.click();
    }
  }

  async waitForSearchResults(): Promise<void> {
    await this.dealerPhones.first().waitFor({
      state: 'visible',
      timeout: 20_000,
    });

    await this.dismissDealerPromoIfVisible();
  }

  async takeScreenshot(name = 'dealer-search-result.png'): Promise<void> {
    await this.dealerPage.screenshot({
      path: `test-results/${name}`,
      fullPage: true,
    });
  }

  private async handleDealerConsent(): Promise<void> {
    const acceptButton = this.dealerPage
      .getByRole('button', {
        name: /accept all cookies|accepter les témoins|aceitar cookies|ok!/i,
      })
      .first();

    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();

      return;
    }

    const continueWithoutConsent = this.dealerPage
      .getByRole('button', {
        name: /continue without consent/i,
      })
      .first();

    if (await continueWithoutConsent.isVisible().catch(() => false)) {
      await continueWithoutConsent.click();

      return;
    }

    const confirmButton = this.dealerPage
      .getByRole('button', {
        name: /confirm|confirmer/i,
      })
      .first();

    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
  }

  private async dismissDealerPromoIfVisible(): Promise<void> {
    const dialog = this.dealerPage
      .getByRole('dialog')
      .filter({
        has: this.dealerPage.locator('iframe'),
      })
      .first();

    if (!(await dialog.isVisible().catch(() => false))) {
      return;
    }

    const closeButton = dialog.locator('button').last();

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
  }
}
