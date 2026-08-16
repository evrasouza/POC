import { spawn } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const reportsDirectory = path.resolve('reports');

const aggregateDirectory = path.join(reportsDirectory, 'allure-aggregate-all');

const aggregateResultsDirectory = path.join(aggregateDirectory, 'allure-results');

const aggregateReportDirectory = path.join(aggregateDirectory, 'allure-report');

const args = process.argv.slice(2);

const shouldOpen = args.includes('--open');

if (!existsSync(reportsDirectory)) {
  console.error('');
  console.error('No reports directory was found.');
  console.error('');

  process.exit(1);
}

function parseRunDirectory(directory) {
  const match = directory.match(/^\d{4}-\d{2}-\d{2}T.+?_([^_]+)_([^_]+)$/);

  if (!match) {
    return null;
  }

  return {
    brand: match[1],
    locale: match[2],
  };
}

const runDirectories = readdirSync(reportsDirectory, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((directory) => {
    if (
      directory === 'allure-history' ||
      directory === 'allure-aggregate' ||
      directory === 'allure-aggregate-all'
    ) {
      return false;
    }

    const parsed = parseRunDirectory(directory);

    if (!parsed) {
      return false;
    }

    const allureResultsDirectory = path.join(reportsDirectory, directory, 'allure-results');

    return existsSync(allureResultsDirectory);
  })
  .sort();

if (runDirectories.length === 0) {
  console.error('');
  console.error('No Allure runs were found.');
  console.error('');

  process.exit(1);
}

const latestResults = new Map();

for (const runDirectory of runDirectories) {
  const runContext = parseRunDirectory(runDirectory);

  if (!runContext) {
    continue;
  }

  const allureResultsDirectory = path.join(reportsDirectory, runDirectory, 'allure-results');

  const resultFiles = readdirSync(allureResultsDirectory).filter((file) =>
    file.endsWith('-result.json'),
  );

  for (const file of resultFiles) {
    const source = path.join(allureResultsDirectory, file);

    let result;

    try {
      result = JSON.parse(readFileSync(source, 'utf8'));
    } catch {
      console.warn(`Skipping invalid Allure result: ${source}`);

      continue;
    }

    const historyIdentity = result.historyId ?? result.testCaseId ?? result.fullName ?? result.name;

    if (!historyIdentity) {
      continue;
    }

    const identity = [runContext.brand, runContext.locale, historyIdentity].join('::');

    const executionTime = result.stop ?? result.start ?? 0;

    const existing = latestResults.get(identity);

    if (!existing || executionTime >= existing.executionTime) {
      latestResults.set(identity, {
        runDirectory,
        runContext,
        resultsDirectory: allureResultsDirectory,
        resultFile: file,
        result,
        executionTime,
      });
    }
  }
}

if (latestResults.size === 0) {
  console.error('');
  console.error('No valid Allure test results were found.');
  console.error('');

  process.exit(1);
}

rmSync(aggregateDirectory, {
  recursive: true,
  force: true,
});

mkdirSync(aggregateResultsDirectory, {
  recursive: true,
});

function collectAttachments(object, sources = new Set()) {
  if (!object || typeof object !== 'object') {
    return sources;
  }

  if (Array.isArray(object)) {
    for (const item of object) {
      collectAttachments(item, sources);
    }

    return sources;
  }

  if (Array.isArray(object.attachments)) {
    for (const attachment of object.attachments) {
      if (attachment?.source) {
        sources.add(attachment.source);
      }
    }
  }

  for (const value of Object.values(object)) {
    if (value && typeof value === 'object') {
      collectAttachments(value, sources);
    }
  }

  return sources;
}

function ensureLabel(result, name, value) {
  result.labels ??= [];

  const exists = result.labels.some((label) => label.name === name && label.value === value);

  if (!exists) {
    result.labels.push({
      name,
      value,
    });
  }
}

function setLabel(result, name, value) {
  result.labels ??= [];

  const existing = result.labels.find((label) => label.name === name);

  if (existing) {
    existing.value = value;
    return;
  }

  result.labels.push({
    name,
    value,
  });
}

function prefixLabel(result, name, prefix) {
  result.labels ??= [];

  const existing = result.labels.find((label) => label.name === name);

  if (!existing) {
    return;
  }

  if (typeof existing.value !== 'string' || existing.value.startsWith(`${prefix}.`)) {
    return;
  }

  existing.value = `${prefix}.${existing.value}`;
}

const selectedResultUuids = new Set();

for (const selected of latestResults.values()) {
  selectedResultUuids.add(selected.result.uuid);

  const result = JSON.parse(JSON.stringify(selected.result));

  const environmentIdentity = [selected.runContext.brand, selected.runContext.locale].join('::');

  if (result.historyId) {
    result.historyId = `${environmentIdentity}::${result.historyId}`;
  }

  if (result.testCaseId) {
    result.testCaseId = `${environmentIdentity}::${result.testCaseId}`;
  }

  result.fullName = `${environmentIdentity}::${result.fullName ?? result.name}`;

  ensureLabel(result, 'brand', selected.runContext.brand);

  ensureLabel(result, 'locale', selected.runContext.locale);

  setLabel(result, 'parentSuite', selected.runContext.brand);

  setLabel(result, 'suite', selected.runContext.locale);

  prefixLabel(result, 'package', selected.runContext.brand);

  prefixLabel(result, 'titlePath', selected.runContext.brand);

  const targetResult = path.join(aggregateResultsDirectory, selected.resultFile);

  writeFileSync(targetResult, JSON.stringify(result), 'utf8');

  const attachments = collectAttachments(result);

  for (const attachment of attachments) {
    const sourceAttachment = path.join(selected.resultsDirectory, attachment);

    if (!existsSync(sourceAttachment)) {
      continue;
    }

    const targetAttachment = path.join(aggregateResultsDirectory, attachment);

    copyFileSync(sourceAttachment, targetAttachment);
  }
}

for (const runDirectory of runDirectories) {
  const resultsDirectory = path.join(reportsDirectory, runDirectory, 'allure-results');

  const containerFiles = readdirSync(resultsDirectory).filter((file) =>
    file.endsWith('-container.json'),
  );

  for (const containerFile of containerFiles) {
    const source = path.join(resultsDirectory, containerFile);

    let container;

    try {
      container = JSON.parse(readFileSync(source, 'utf8'));
    } catch {
      continue;
    }

    const children = container.children ?? [];

    const selectedChildren = children.filter((uuid) => selectedResultUuids.has(uuid));

    if (selectedChildren.length === 0) {
      continue;
    }

    container.children = selectedChildren;

    const target = path.join(aggregateResultsDirectory, containerFile);

    writeFileSync(target, JSON.stringify(container), 'utf8');

    const attachments = collectAttachments(container);

    for (const attachment of attachments) {
      const sourceAttachment = path.join(resultsDirectory, attachment);

      if (!existsSync(sourceAttachment)) {
        continue;
      }

      const targetAttachment = path.join(aggregateResultsDirectory, attachment);

      copyFileSync(sourceAttachment, targetAttachment);
    }
  }
}

const brands = new Set();
const locales = new Set();

for (const selected of latestResults.values()) {
  brands.add(selected.runContext.brand);

  locales.add(selected.runContext.locale);
}

console.log('');
console.log('========================================');
console.log('Allure Multi-Brand Aggregate Report');
console.log('========================================');
console.log(`Runs found:     ${runDirectories.length}`);
console.log(`Unique tests:   ${latestResults.size}`);
console.log(`Brands:         ${brands.size}`);
console.log(`Locales:        ${locales.size}`);
console.log('');
console.log('Brands included:');

for (const brand of [...brands].sort()) {
  console.log(`- ${brand}`);
}

console.log('');
console.log('Locales included:');

for (const locale of [...locales].sort()) {
  console.log(`- ${locale}`);
}

console.log('');
console.log(`Results: ${aggregateResultsDirectory}`);
console.log(`Report:  ${aggregateReportDirectory}`);
console.log('========================================');
console.log('');

const generateArgs = [
  'allure',
  'generate',
  aggregateResultsDirectory,
  '--output',
  aggregateReportDirectory,
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
  console.log('Multi-brand aggregate report generated successfully.');
  console.log('');
  console.log(`Runs processed: ${runDirectories.length}`);
  console.log(`Unique tests:   ${latestResults.size}`);
  console.log(`Brands:         ${brands.size}`);
  console.log(`Locales:        ${locales.size}`);
  console.log(`Report:         ${aggregateReportDirectory}`);
  console.log('');

  if (!shouldOpen) {
    console.log('Open multi-brand aggregate report with:');

    console.log('npm run report:allure:aggregate:all:open');

    console.log('');

    process.exit(0);

    return;
  }

  const open = spawn('npx', ['allure', 'open', aggregateReportDirectory], {
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
