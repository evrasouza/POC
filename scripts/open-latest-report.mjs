import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const playwrightCli = require.resolve('@playwright/test/cli');

const reportsDirectory = path.resolve('reports');

if (!existsSync(reportsDirectory)) {
  console.error('');
  console.error('No reports directory was found.');
  console.error('');
  console.error('Run the tests first:');
  console.error('npm test -- --brand seadoo --locale ca-en --project=chromium');
  console.error('');

  process.exit(1);
}

const reportDirectories = readdirSync(reportsDirectory, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((directory) => {
    const indexFile = path.join(reportsDirectory, directory, 'html', 'index.html');

    return existsSync(indexFile);
  })
  .sort()
  .reverse();

if (reportDirectories.length === 0) {
  console.error('');
  console.error('No Playwright HTML reports were found.');
  console.error('');
  console.error('Run the tests first:');
  console.error('npm test -- --brand seadoo --locale ca-en --project=chromium');
  console.error('');

  process.exit(1);
}

const latestReport = reportDirectories[0];

const htmlReportDirectory = path.join(reportsDirectory, latestReport, 'html');

console.log('');
console.log('========================================');
console.log('Opening Latest Playwright Report');
console.log('========================================');
console.log(`Run: ${latestReport}`);
console.log(`Path: ${htmlReportDirectory}`);
console.log('========================================');
console.log('');

const child = spawn(process.execPath, [playwrightCli, 'show-report', htmlReportDirectory], {
  shell: false,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
