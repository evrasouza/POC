import * as allure from 'allure-js-commons';

type AllureSeverity = 'trivial' | 'minor' | 'normal' | 'critical' | 'blocker';

interface AllureMetadata {
  epic: string;
  feature: string;
  story: string;
  severity: AllureSeverity;
  layer: 'unit' | 'integration' | 'e2e';
}

export async function setAllureMetadata({
  epic,
  feature,
  story,
  severity,
  layer,
}: AllureMetadata): Promise<void> {
  await allure.epic(epic);
  await allure.feature(feature);
  await allure.story(story);
  await allure.severity(severity);
  await allure.label('layer', layer);
}
