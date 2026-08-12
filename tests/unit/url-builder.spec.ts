import { test, expect } from '@playwright/test';
import { buildUrl } from '../../utils/url-builder.js';

test.describe('URL Builder', () => {
  test('builds Can-Am Off-Road homepage URL', () => {
    const url = buildUrl({
      brand: 'canam-offroad',
      country: 'ca',
      language: 'en',
    });

    expect(url).toBe('https://can-am.brp.com/off-road/ca/en/');
  });

  test('builds Can-Am On-Road homepage URL', () => {
    const url = buildUrl({
      brand: 'canam-onroad',
      country: 'ca',
      language: 'en',
    });

    expect(url).toBe('https://can-am.brp.com/on-road/ca/en/');
  });

  test('builds Sea-Doo homepage URL', () => {
    const url = buildUrl({
      brand: 'seadoo',
      country: 'ca',
      language: 'en',
    });

    expect(url).toBe('https://sea-doo.brp.com/ca/en/');
  });

  test('builds Lynx homepage URL', () => {
    const url = buildUrl({
      brand: 'lynx',
      country: 'ca',
      language: 'en',
    });

    expect(url).toBe('https://www.brplynx.com/ca/en/');
  });

  test('builds an internal path correctly', () => {
    const url = buildUrl({
      brand: 'canam-offroad',
      country: 'ca',
      language: 'en',
      path: '/models/sxs',
    });

    expect(url).toBe(
      'https://can-am.brp.com/off-road/ca/en/models/sxs/',
    );
  });

  test('normalizes internal path without leading and trailing slashes', () => {
    const url = buildUrl({
      brand: 'canam-offroad',
      country: 'ca',
      language: 'en',
      path: 'models/sxs',
    });

    expect(url).toBe(
      'https://can-am.brp.com/off-road/ca/en/models/sxs/',
    );
  });

  test('normalizes uppercase country and language', () => {
    const url = buildUrl({
      brand: 'seadoo',
      country: 'CA',
      language: 'EN',
    });

    expect(url).toBe('https://sea-doo.brp.com/ca/en/');
  });
});