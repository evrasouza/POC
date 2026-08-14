import type { BrandId, SiteContext } from '../types/site.types.js';

type DealerLocatorConfig = {
  getUrl: (site: SiteContext) => string;
};

const dealerLocatorConfig: Partial<Record<BrandId, DealerLocatorConfig>> = {
  seadoo: {
    getUrl: (site) => `${site.baseUrl}/shopping-tools/find-a-dealer.html#/search`,
  },

  skidoo: {
    getUrl: (site) => `${site.baseUrl}/shopping-tools/find-a-dealer.html#/search`,
  },

  lynx: {
    getUrl: (site) => `${site.baseUrl}/shopping-tools/find-a-dealer.html#/search`,
  },

  'canam-offroad': {
    getUrl: (site) => {
      const origin = new URL(site.baseUrl).origin;

      return `${origin}/${site.country}/${site.language}/dealer-near-me.html`;
    },
  },

  'canam-onroad': {
    getUrl: (site) => {
      const origin = new URL(site.baseUrl).origin;

      return `${origin}/${site.country}/${site.language}/dealer-near-me.html`;
    },
  },
};

export function getDealerLocatorConfig(brand: BrandId): DealerLocatorConfig {
  const config = dealerLocatorConfig[brand];

  if (!config) {
    throw new Error(`Dealer Locator is not configured for brand: ${brand}`);
  }

  return config;
}
