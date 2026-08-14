import type { Locator, Page } from '@playwright/test';

import type { SiteContext } from '../types/site.types.js';
import { BasePage } from './base.page.js';

export class DealerLocatorPage extends BasePage {
    readonly searchInput: Locator;
    readonly dealerPhones: Locator;

    constructor(
        private readonly dealerPage: Page,
        site: SiteContext,
    ) {
        super(dealerPage, site);

        // Só existe um searchbox relevante no Dealer Locator.
        // Não depende de "Enter Your Location" / "Entrer votre emplacement".
        this.searchInput = dealerPage
            .getByRole('searchbox')
            .first();

        // Excelente indicador de dealer retornado e independente de idioma.
        this.dealerPhones = dealerPage
            .locator('main a[href^="tel:"]:visible');
    }

    async goto(): Promise<void> {
        const origin = new URL(this.site.baseUrl).origin;

        await this.dealerPage.context().grantPermissions(
            ['geolocation'],
            { origin },
        );

        await this.dealerPage.context().setGeolocation({
            latitude: 45.5017,
            longitude: -73.5673,
        });

        await super.goto(
            '/shopping-tools/find-a-dealer.html#/search',
        );

        await this.handleDealerConsent();

        await this.searchInput.waitFor({
            state: 'visible',
            timeout: 15_000,
        });
    }

    async searchLocation(location: string): Promise<void> {
        await this.handleDealerConsent();

        await this.searchInput.fill(location);

        const autocompleteOption = this.dealerPage
            .locator('.pac-item:visible')
            .first();

        if (await autocompleteOption.isVisible()) {
            await autocompleteOption.click();
        }
    }

    async waitForSearchResults(): Promise<void> {
        /*
         * Não validamos "35 results", "kilometers away",
         * "kilomètres", etc.
         *
         * Um link tel: visível significa que pelo menos
         * um dealer real foi retornado.
         */
        await this.dealerPhones.first().waitFor({
            state: 'visible',
            timeout: 20_000,
        });

        await this.dismissDealerPromoIfVisible();
    }

    async takeScreenshot(
        name = 'dealer-search-result.png',
    ): Promise<void> {
        await this.dealerPage.screenshot({
            path: `test-results/${name}`,
        });
    }

    private async handleDealerConsent(): Promise<void> {
        const acceptButton = this.dealerPage
            .getByRole('button', {
                name: /accept all cookies|accepter les témoins/i,
            })
            .first();

        if (await acceptButton.isVisible().catch(() => false)) {
            await acceptButton.click();
            return;
        }

        const confirmButton = this.dealerPage
            .getByRole('button', {
                name: /confirm|confirmer/i,
            })
            .first();

        if (await confirmButton.isVisible().catch(() => false)) {
            await confirmButton.click();
        }
    }

    private async dismissDealerPromoIfVisible(): Promise<void> {
        const dialog = this.dealerPage
            .getByRole('dialog')
            .filter({
                has: this.dealerPage.locator('iframe'),
            })
            .first();

        if (!(await dialog.isVisible().catch(() => false))) {
            return;
        }

        const closeButton = dialog.locator('button').last();

        if (await closeButton.isVisible().catch(() => false)) {
            await closeButton.click();
        }
    }
}