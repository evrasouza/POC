import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly root: Locator;
  readonly navigation: Locator;
  readonly links: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('header, [role="banner"]').first();

    this.navigation = this.root.locator('nav, [role="navigation"]').first();

    this.links = this.navigation.locator('a[href]');
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
    const count = await this.links.count();
    const currentHostname = new URL(this.page.url()).hostname;

    for (let i = 0; i < count; i++) {
      const link = this.links.nth(i);

      if (!(await link.isVisible())) {
        continue;
      }

      const href = await link.getAttribute('href');

      if (!href) {
        continue;
      }

      if (
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        continue;
      }

      const targetUrl = new URL(href, this.page.url());

      if (targetUrl.hostname !== currentHostname) {
        continue;
      }

      if (targetUrl.href === this.page.url()) {
        continue;
      }

      return link;
    }

    return null;
  }
}
