// components/cookie-banner.component.ts
import type { Locator, Page } from '@playwright/test';

export class CookieBannerComponent {
  readonly continueWithoutConsentButton: Locator;

  constructor(private readonly page: Page) {
    this.continueWithoutConsentButton = page.getByRole('button', {
      name: /close the widget without accepting cookie settings/i,
    });
  }

  async dismissIfVisible(): Promise<void> {
    const buttons = this.page.getByRole('button', {
      name: /close the widget without accepting cookie settings/i,
    });

    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);

      if (await button.isVisible()) {
        await button.click();

        await button
          .waitFor({
            state: 'hidden',
            timeout: 5_000,
          })
          .catch(() => {});

        return;
      }
    }
  }
}
