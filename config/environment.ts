import 'dotenv/config';

import { defaultBrandId, getBrand } from './brands.js';
import type { BrandId, SiteContext } from '../types/site.types.js';
import { buildUrl } from '../utils/url-builder.js';

const DEFAULT_COUNTRY = 'ca';
const DEFAULT_LANGUAGE = 'en';

function readCliOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inlineArg = process.argv.find((arg) => arg.startsWith(prefix));

  if (inlineArg) {
    return inlineArg.slice(prefix.length);
  }

  const flagIndex = process.argv.indexOf(`--${name}`);
  const nextValue = flagIndex >= 0 ? process.argv[flagIndex + 1] : undefined;

  return nextValue && !nextValue.startsWith('--') ? nextValue : undefined;
}

function resolveOption(name: string, envName: string, defaultValue: string): string {
  return readCliOption(name) ?? process.env[envName] ?? defaultValue;
}

function normalizeLocalePart(value: string): string {
  return value.trim().toLowerCase();
}

export function createSiteContext(): SiteContext {
  const brandId = resolveOption('brand', 'BRAND', defaultBrandId) as BrandId;
  const country = normalizeLocalePart(resolveOption('country', 'COUNTRY', DEFAULT_COUNTRY));
  const language = normalizeLocalePart(resolveOption('language', 'LANGUAGE', DEFAULT_LANGUAGE));
  const brand = getBrand(brandId);

  return {
    brand,
    country,
    language,
    locale: `${country}-${language}`,
    baseUrl: buildUrl({ brand, country, language }),
  };
}

export const siteContext = createSiteContext();
