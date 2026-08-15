import type { Locator, Page } from '@playwright/test';

import { LinkValidator } from '../utils/link-validator.js';

export class FooterComponent {
  readonly root: Locator;
  readonly links: Locator;

  private readonly linkValidator: LinkValidator;

  constructor(private readonly page: Page) {
    this.root = page.locator('footer, [role="contentinfo"]').first();

    this.links = this.root.locator('a[href]');

    this.linkValidator = new LinkValidator(page);
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async linkCount(): Promise<number> {
    return this.links.count();
  }

  async getFirstInternalNavigableLink(): Promise<Locator | null> {
    return this.linkValidator.getFirstInternalNavigableLink(this.links);
  }
}
