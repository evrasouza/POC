// components/promotional-modal.component.ts
import type { Locator, Page } from '@playwright/test';

export class PromotionalModalComponent {
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page
      .getByRole('dialog')
      .filter({
        hasText: /GET \$20 OFF YOUR NEXT ORDER/i,
      })
      .first();
  }

  async dismissIfVisible(): Promise<void> {
    if (!(await this.dialog.isVisible())) {
      return;
    }

    const closeButton = this.dialog.locator('button').last();

    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}
