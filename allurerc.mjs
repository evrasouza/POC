import { defineConfig } from 'allure';

export default defineConfig({
  name: 'BRP Websites Automation',

  historyPath: './reports/allure-history/history.jsonl',

  appendHistory: true,

  historyLimit: 50,

  plugins: {
    awesome: {
      options: {
        reportName: 'BRP Websites Automation',
        reportLanguage: 'en',
        singleFile: false,

        groupBy: ['parentSuite', 'suite', 'feature', 'story'],

        charts: [
          {
            type: 'currentStatus',
            title: 'Current Test Status',
          },
          {
            type: 'statusDynamics',
            title: 'Test Status History',
            limit: 20,
          },
          {
            type: 'durationDynamics',
            title: 'Execution Duration History',
            limit: 20,
          },
          {
            type: 'statusAgePyramid',
            title: 'Test Stability History',
            limit: 20,
          },
          {
            type: 'durations',
            title: 'Test Duration Distribution',
          },
        ],
      },
    },
  },
});
