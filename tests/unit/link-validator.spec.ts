import { test, expect } from '@playwright/test';

import { LinkValidator } from '../../utils/link-validator.js';

test.describe('LinkValidator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.example.com/en-us/');
  });

  test('identifies navigable href values', async ({ page }) => {
    const validator = new LinkValidator(page);

    expect(validator.isNavigableHref('/products')).toBeTruthy();
    expect(validator.isNavigableHref('https://www.example.com/products')).toBeTruthy();
  });

  test('rejects non-navigation href values', async ({ page }) => {
    const validator = new LinkValidator(page);

    expect(validator.isNavigableHref('#section')).toBeFalsy();
    expect(validator.isNavigableHref('javascript:void(0)')).toBeFalsy();
    expect(validator.isNavigableHref('mailto:test@example.com')).toBeFalsy();
    expect(validator.isNavigableHref('tel:+15555555555')).toBeFalsy();
  });

  test('resolves relative URLs using the current page URL', async ({ page }) => {
    const validator = new LinkValidator(page);

    const url = validator.resolveUrl('/products');

    expect(url.href).toBe('https://www.example.com/products');
  });

  test('identifies internal URLs', async ({ page }) => {
    const validator = new LinkValidator(page);

    expect(validator.isInternalUrl(new URL('https://www.example.com/products'))).toBeTruthy();

    expect(validator.isInternalUrl(new URL('https://external.example.org/products'))).toBeFalsy();
  });

  test('identifies the current page URL', async ({ page }) => {
    const validator = new LinkValidator(page);

    expect(validator.isCurrentPage(new URL('https://www.example.com/en-us/'))).toBeTruthy();

    expect(validator.isCurrentPage(new URL('https://www.example.com/products'))).toBeFalsy();
  });

  test('returns all unique internal navigable URLs', async ({ page }) => {
    const validator = new LinkValidator(page);

    await page.setContent(`
      <nav>
        <a href="/products">Products</a>
        <a href="/products">Products duplicate</a>
        <a href="/accessories">Accessories</a>
        <a href="https://www.example.com/dealers">Dealers</a>
        <a href="https://external.example.org/page">External</a>
        <a href="#section">Anchor</a>
        <a href="mailto:test@example.com">Email</a>
        <a href="tel:+15555555555">Phone</a>
        <a href="javascript:void(0)">JavaScript</a>
      </nav>
    `);

    const links = page.locator('nav a[href]');

    const urls = await validator.getInternalNavigableUrls(links);

    expect(urls.map((url) => url.href)).toEqual([
      'https://www.example.com/products',
      'https://www.example.com/accessories',
      'https://www.example.com/dealers',
    ]);
  });

  test('includes internal links even when they are not currently visible', async ({ page }) => {
    const validator = new LinkValidator(page);

    await page.setContent(`
      <nav>
        <a href="/products">Products</a>

        <div style="display: none">
          <a href="/hidden-product">Hidden Product</a>
        </div>
      </nav>
    `);

    const links = page.locator('nav a[href]');

    const urls = await validator.getInternalNavigableUrls(links);

    expect(urls.map((url) => url.href)).toEqual([
      'https://www.example.com/products',
      'https://www.example.com/hidden-product',
    ]);
  });
});
