import type { BrandConfig, BrandId } from '../types/site.types.js';

export const brands = {
  'canam-offroad': {
    id: 'canam-offroad',
    displayName: 'Can-Am Off-Road',
    origin: 'https://can-am.brp.com',
    productLinePath: 'off-road',
  },
  'canam-onroad': {
    id: 'canam-onroad',
    displayName: 'Can-Am On-Road',
    origin: 'https://can-am.brp.com',
    productLinePath: 'on-road',
  },
  seadoo: {
    id: 'seadoo',
    displayName: 'Sea-Doo',
    origin: 'https://sea-doo.brp.com',
  },
  skidoo: {
    id: 'skidoo',
    displayName: 'Ski-Doo',
    origin: 'https://ski-doo.brp.com',
  },
  lynx: {
    id: 'lynx',
    displayName: 'Lynx',
    origin: 'https://www.brplynx.com',
  },
} as const satisfies Record<BrandId, BrandConfig>;

export const defaultBrandId: BrandId = 'canam-offroad';

export function getBrand(brandId: string): BrandConfig {
  if (isBrandId(brandId)) {
    return brands[brandId];
  }

  const availableBrands = Object.keys(brands).join(', ');
  throw new Error(`Unknown brand "${brandId}". Available brands: ${availableBrands}`);
}

export function isBrandId(brandId: string): brandId is BrandId {
  return Object.hasOwn(brands, brandId);
}
