import type { Locator, Page } from '@playwright/test';

export class CookieBannerComponent {
  readonly acceptButton: Locator;

  constructor(private readonly page: Page) {
    this.acceptButton = page
      .getByRole('button', { name: /accept|agree|allow|accepter|aceitar/i })
      .first();
  }

  async acceptIfVisible(): Promise<void> {
    if (await this.acceptButton.isVisible().catch(() => false)) {
      await this.acceptButton.click();
    }
  }
}
