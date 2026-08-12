import { getBrand } from '../config/brands.js';
import type { BrandConfig, BuildUrlOptions } from '../types/site.types.js';

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function normalizeLocaleSegment(value: string, label: string): string {
  const normalized = trimSlashes(value).toLowerCase();

  if (!normalized) {
    throw new Error(`${label} is required to build a BRP site URL.`);
  }

  return normalized;
}

function normalizeRelativePath(path = '/'): string {
  const normalized = trimSlashes(path);
  return normalized ? `/${normalized}/` : '/';
}

function resolveBrand(brand: BuildUrlOptions['brand']): BrandConfig {
  return typeof brand === 'string' ? getBrand(brand) : brand;
}

export function buildUrl({ brand, country, language, path = '/' }: BuildUrlOptions): string {
  const brandConfig = resolveBrand(brand);
  const countrySegment = normalizeLocaleSegment(country, 'country');
  const languageSegment = normalizeLocaleSegment(language, 'language');
  const productLineSegment = brandConfig.productLinePath
    ? `/${trimSlashes(brandConfig.productLinePath)}`
    : '';
  const relativePath = normalizeRelativePath(path);

  return `${brandConfig.origin}${productLineSegment}/${countrySegment}/${languageSegment}${relativePath}`;
}
