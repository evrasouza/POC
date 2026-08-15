// components/promotional-modal.component.ts
import type { Locator, Page } from '@playwright/test';

export class PromotionalModalComponent {
  readonly root: Locator;
  readonly closeButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('#root_newsletter-popup');

    this.closeButton = this.root.locator('button').last();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  async dismissIfVisible(): Promise<boolean> {
    if (!(await this.isVisible())) {
      return false;
    }

    if (!(await this.closeButton.isVisible().catch(() => false))) {
      return false;
    }

    await this.closeButton.click();

    await this.root
      .waitFor({
        state: 'hidden',
        timeout: 5_000,
      })
      .catch(() => {});

    return true;
  }
}
