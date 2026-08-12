import fs from 'node:fs/promises';
import path from 'node:path';

import { test, expect } from '../../fixtures/test.fixture.js';

test.describe('Header Navigation Discovery', () => {
  test('exports visible navigation links for the configured brand and locale', async ({
    homePage,
    site,
  }) => {
    console.log('Resolved site:', {
      brand: site.brand.id,
      locale: site.locale,
      baseUrl: site.baseUrl,
    });
    await homePage.goto();
    await homePage.prepareForInteraction();

    await expect(homePage.header.navigation).toBeVisible();

    const links = homePage.header.navigation.locator('a[href]');
    const count = await links.count();

    const navigationItems: Array<{
      text: string;
      href: string;
    }> = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);

      if (!(await link.isVisible())) {
        continue;
      }

      const href = await link.getAttribute('href');

      if (!href) {
        continue;
      }

      const text = (await link.innerText()).trim();

      navigationItems.push({
        text,
        href,
      });
    }

    const output = {
      brand: site.brand.id,
      locale: site.locale,
      baseUrl: site.baseUrl,
      navigationItems,
    };

    const outputDirectory = path.resolve('test-results', 'navigation-discovery');

    await fs.mkdir(outputDirectory, {
      recursive: true,
    });

    const outputFile = path.join(outputDirectory, `${site.brand.id}-${site.locale}.json`);

    await fs.writeFile(outputFile, JSON.stringify(output, null, 2), 'utf-8');

    console.log(`Navigation discovery exported to ${outputFile}`);
  });
});
