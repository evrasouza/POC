import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('header, [role="banner"]').first();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }
}
