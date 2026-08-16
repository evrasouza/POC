import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const reportsDirectory = path.resolve('reports');
const historyDirectory = path.join(reportsDirectory, 'allure-history');

const shouldOpen = process.argv.includes('--open');

if (!existsSync(reportsDirectory)) {
  console.error('');
  console.error('No reports directory was found.');
  console.error('');
  console.error('Run the tests first:');
  console.error('npm test -- --brand seadoo --locale ca-en --project=chromium');
  console.error('');

  process.exit(1);
}

mkdirSync(historyDirectory, {
  recursive: true,
});

const runDirectories = readdirSync(reportsDirectory, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((directory) => {
    if (directory === 'allure-history') {
      return false;
    }

    const allureResultsDirectory = path.join(reportsDirectory, directory, 'allure-results');

    return existsSync(allureResultsDirectory);
  })
  .sort()
  .reverse();

if (runDirectories.length === 0) {
  console.error('');
  console.error('No Allure result directories were found.');
  console.error('');
  console.error('Run the tests first:');
  console.error('npm test -- --brand seadoo --locale ca-en --project=chromium');
  console.error('');

  process.exit(1);
}

const latestRun = runDirectories[0];

const allureResultsDirectory = path.join(reportsDirectory, latestRun, 'allure-results');

const allureReportDirectory = path.join(reportsDirectory, latestRun, 'allure-report');

const historyFile = path.join(historyDirectory, 'history.jsonl');

console.log('');
console.log('========================================');
console.log('Generating Allure Report');
console.log('========================================');
console.log(`Run:     ${latestRun}`);
console.log(`Results: ${allureResultsDirectory}`);
console.log(`Report:  ${allureReportDirectory}`);
console.log(`History: ${historyFile}`);
console.log('========================================');
console.log('');

const generateArgs = [
  'allure',
  'generate',
  allureResultsDirectory,
  '--output',
  allureReportDirectory,
  '--config',
  'allurerc.mjs',
];

const generate = spawn('npx', generateArgs, {
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

generate.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  if (code !== 0) {
    process.exit(code ?? 1);
    return;
  }

  console.log('');
  console.log('Allure report generated successfully.');
  console.log(`Report:  ${allureReportDirectory}`);
  console.log(`History: ${historyFile}`);
  console.log('');

  if (!shouldOpen) {
    console.log('Open the report with:');
    console.log('npm run report:allure:open');
    console.log('');

    process.exit(0);
    return;
  }

  console.log('Opening Allure report...');
  console.log('');

  const open = spawn('npx', ['allure', 'open', allureReportDirectory], {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  open.on('exit', (openCode, openSignal) => {
    if (openSignal) {
      process.kill(process.pid, openSignal);
      return;
    }

    process.exit(openCode ?? 0);
  });
});
