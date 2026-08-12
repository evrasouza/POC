export type BrandId = 'canam-offroad' | 'canam-onroad' | 'seadoo' | 'skidoo' | 'lynx';

export type LocaleInput = {
  country: string;
  language: string;
};

export type BrandConfig = {
  id: BrandId;
  displayName: string;
  origin: string;
  productLinePath?: string;
};

export type SiteContext = LocaleInput & {
  brand: BrandConfig;
  locale: string;
  baseUrl: string;
};

export type BuildUrlOptions = LocaleInput & {
  brand: BrandId | BrandConfig;
  path?: string;
};
