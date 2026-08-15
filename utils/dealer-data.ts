import fs from 'node:fs/promises';
import path from 'node:path';

import type { BrandId } from '../types/site.types.js';

export type DealerData = {
  location: string;
};

export async function loadDealerData(brand: BrandId, locale: string): Promise<DealerData> {
  const filePath = path.resolve('data', 'dealers', brand, `${locale}.json`);

  const content = await fs.readFile(filePath, 'utf-8');

  return JSON.parse(content) as DealerData;
}
