// components/cookie-banner.component.ts
import type { Locator, Page } from '@playwright/test';

export class CookieBannerComponent {
  readonly dialog: Locator;
  readonly acceptButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page
      .locator('#axeptio_overlay')
      .getByRole('dialog')
      .first();

    this.acceptButton = this.dialog.getByRole('button', {
      name: /^(accept all cookies|accept cookies|accepter les témoins|accepter tous les témoins|aceptar todas las cookies|aceptar cookies)$/i,
    });
  }

  async isVisible(): Promise<boolean> {
    return this.dialog.isVisible().catch(() => false);
  }

  async dismissIfVisible(): Promise<boolean> {
    if (!(await this.isVisible())) {
      return false;
    }

    if (!(await this.acceptButton.isVisible().catch(() => false))) {
      return false;
    }

    await this.acceptButton.click();

    await this.dialog
      .waitFor({
        state: 'hidden',
        timeout: 5_000,
      })
      .catch(() => {});

    return true;
  }
}