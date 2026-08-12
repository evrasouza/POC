import type { Locator, Page } from '@playwright/test';

export class FooterComponent {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('footer, [role="contentinfo"]').first();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }
}
