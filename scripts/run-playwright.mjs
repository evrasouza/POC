import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwrightCli = require.resolve('@playwright/test/cli');

const siteOptions = new Set(['brand', 'country', 'language', 'locale']);
const env = { ...process.env };
const forwardedArgs = [];

function applySiteOption(name, value) {
  if (!value) {
    throw new Error(`Missing value for --${name}`);
  }

  if (name === 'locale') {
    const [country, language] = value.split(/[-/]/);

    if (!country || !language) {
      throw new Error(`Expected --locale to use country-language format, for example ca-en.`);
    }

    env.COUNTRY = country;
    env.LANGUAGE = language;
    return;
  }

  env[name.toUpperCase()] = value;
}

const args = process.argv.slice(2);

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  const inlineMatch = arg.match(/^--([^=]+)=(.*)$/);

  if (inlineMatch && siteOptions.has(inlineMatch[1])) {
    applySiteOption(inlineMatch[1], inlineMatch[2]);
    continue;
  }

  if (arg.startsWith('--') && siteOptions.has(arg.slice(2))) {
    applySiteOption(arg.slice(2), args[index + 1]);
    index += 1;
    continue;
  }

  forwardedArgs.push(arg);
}

function sanitize(value) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
}

function createTimestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
}

const brand = sanitize(env.BRAND ?? 'default');
const country = sanitize(env.COUNTRY ?? 'default');
const language = sanitize(env.LANGUAGE ?? 'default');

const locale =
  country !== 'default' && language !== 'default' ? `${country}-${language}` : 'default';

const timestamp = createTimestamp();
const runId = `${timestamp}_${brand}_${locale}`;

const reportDirectory = path.join('reports', runId);

mkdirSync(reportDirectory, {
  recursive: true,
});

env.TEST_RUN_ID = runId;
env.TEST_REPORT_DIR = reportDirectory;
env.TEST_REPORT_TITLE = `BRP Playwright - ${brand} - ${locale}`;

console.log('');
console.log('========================================');
console.log('Playwright Test Execution');
console.log('========================================');
console.log(`Run ID:       ${runId}`);
console.log(`Brand:        ${brand}`);
console.log(`Locale:       ${locale}`);
console.log(`Report:       ${reportDirectory}`);
console.log('========================================');
console.log('');

const child = spawn(process.execPath, [playwrightCli, 'test', ...forwardedArgs], {
  env,
  shell: false,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  console.log('');
  console.log('========================================');
  console.log('Test Execution Finished');
  console.log('========================================');
  console.log(`Run ID: ${runId}`);
  console.log(`Report: ${path.join(reportDirectory, 'html')}`);
  console.log('');
  console.log('Open latest report with:');
  console.log('npm run report:latest');
  console.log('========================================');
  console.log('');

  process.exit(code ?? 1);
});
