import type { Page, Response } from '@playwright/test';

import type { SiteContext } from '../types/site.types.js';
import { buildUrl } from '../utils/url-builder.js';

export class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly site: SiteContext,
  ) {}

  async goto(path = '/'): Promise<Response | null> {
    return this.page.goto(this.url(path), { waitUntil: 'domcontentloaded' });
  }

  url(path = '/'): string {
    return buildUrl({
      brand: this.site.brand,
      country: this.site.country,
      language: this.site.language,
      path,
    });
  }

  async hasLoaded(): Promise<boolean> {
    return this.page.locator('body').isVisible();
  }
}
