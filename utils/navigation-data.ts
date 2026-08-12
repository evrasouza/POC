import fs from 'node:fs/promises';
import path from 'node:path';

import type { BrandId } from '../types/site.types.js';

export type NavigationItem = {
  text: string;
  href: string;
};

export type NavigationData = {
  brand: BrandId;
  locale: string;
  baseUrl: string;
  navigationItems: NavigationItem[];
};

export async function loadNavigationData(brand: BrandId, locale: string): Promise<NavigationData> {
  const filePath = path.resolve('data', 'navigation', brand, `${locale}.json`);

  const content = await fs.readFile(filePath, 'utf-8');

  return JSON.parse(content) as NavigationData;
}
