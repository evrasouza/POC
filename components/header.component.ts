import type { Locator, Page } from '@playwright/test';

import { LinkValidator } from '../utils/link-validator.js';

export class HeaderComponent {
  readonly root: Locator;
  readonly navigation: Locator;
  readonly links: Locator;

  private readonly linkValidator: LinkValidator;

  constructor(private readonly page: Page) {
    this.root = page.locator('header, [role="banner"]').first();

    this.navigation = this.root.locator('nav, [role="navigation"]').first();

    this.links = this.navigation.locator('a[href]');

    this.linkValidator = new LinkValidator(page);
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async linkCount(): Promise<number> {
    return this.links.count();
  }

  async getNavigationLinkByPath(path: string): Promise<Locator> {
    return this.navigation.locator(`a[href*="${path}"]`).first();
  }

  async getFirstInternalNavigableLink(): Promise<Locator | null> {
    return this.linkValidator.getFirstInternalNavigableLink(this.links);
  }
}
