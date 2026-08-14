import type { BrandId } from '../types/site.types.js';

type DealerLocatorConfig = {
  path: string;
};

const dealerLocatorConfig: Partial<
  Record<BrandId, DealerLocatorConfig>
> = {
  seadoo: {
    path: '/shopping-tools/find-a-dealer.html#/search',
  },

  skidoo: {
    path: '/shopping-tools/find-a-dealer.html#/search',
  },

  lynx: {
    path: '/shopping-tools/find-a-dealer.html#/search',
  },

  'canam-offroad': {
    path: '/dealer-near-me.html#/search',
  },

  'canam-onroad': {
    path: '/dealer-near-me.html#/search',
  },
};

export function getDealerLocatorConfig(
  brand: BrandId,
): DealerLocatorConfig {
  const config = dealerLocatorConfig[brand];

  if (!config) {
    throw new Error(
      `Dealer Locator is not configured for brand: ${brand}`,
    );
  }

  return config;
}