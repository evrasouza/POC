import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';

const videoMode = process.env.VIDEO === 'on' ? 'on' : 'retain-on-failure';

const brand = process.env.BRAND ?? 'not-specified';

const country = process.env.COUNTRY ?? 'not-specified';

const language = process.env.LANGUAGE ?? 'not-specified';

const locale =
  country !== 'not-specified' && language !== 'not-specified'
    ? `${country}-${language}`
    : 'not-specified';

const runId = process.env.TEST_RUN_ID ?? 'latest';

const reportDirectory = process.env.TEST_REPORT_DIR ?? 'reports/latest';

const reportTitle = process.env.TEST_REPORT_TITLE ?? `BRP Playwright - ${brand} - ${locale}`;

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 1 : 0,

  workers: process.env.CI ? 2 : undefined,

  timeout: 45_000,

  expect: {
    timeout: 10_000,
  },

  outputDir: `${reportDirectory}/artifacts`,

  metadata: {
    runId,
    brand,
    locale,
  },

  reporter: [
    ['list'],

    [
      'html',
      {
        outputFolder: `${reportDirectory}/html`,
        open: 'never',
        title: reportTitle,
      },
    ],

    [
      'json',
      {
        outputFile: `${reportDirectory}/results.json`,
      },
    ],

    [
      'junit',
      {
        outputFile: `${reportDirectory}/junit.xml`,
        includeProjectInTestName: true,
        stripANSIControlSequences: true,
      },
    ],

    [
      'allure-playwright',
      {
        resultsDir: `${reportDirectory}/allure-results`,

        detail: true,

        environmentInfo: {
          brand,
          locale,
          run_id: runId,
          node_version: process.version,
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version(),
        },

        globalLabels: {
          brand,
          locale,
          framework: 'playwright',
        },
      },
    ],
  ],

  use: {
    actionTimeout: 10_000,

    navigationTimeout: 30_000,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: videoMode,
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
