import type { Locator, Page } from '@playwright/test';

export class LinkValidator {
  constructor(private readonly page: Page) {}

  isNavigableHref(href: string): boolean {
    return !(
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    );
  }

  resolveUrl(href: string): URL {
    return new URL(href, this.page.url());
  }

  isInternalUrl(url: URL): boolean {
    return url.hostname === new URL(this.page.url()).hostname;
  }

  isCurrentPage(url: URL): boolean {
    return url.href === this.page.url();
  }

  async getFirstInternalNavigableLink(links: Locator): Promise<Locator | null> {
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);

      if (!(await link.isVisible())) {
        continue;
      }

      const href = await link.getAttribute('href');

      if (!href || !this.isNavigableHref(href)) {
        continue;
      }

      const targetUrl = this.resolveUrl(href);

      if (!this.isInternalUrl(targetUrl)) {
        continue;
      }

      if (this.isCurrentPage(targetUrl)) {
        continue;
      }

      return link;
    }

    return null;
  }
}
