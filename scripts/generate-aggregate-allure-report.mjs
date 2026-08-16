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

const aggregateDirectory = path.join(reportsDirectory, 'allure-aggregate');
const aggregateResultsDirectory = path.join(aggregateDirectory, 'allure-results');
const aggregateReportDirectory = path.join(aggregateDirectory, 'allure-report');

const args = process.argv.slice(2);

function getArgument(name) {
  const inline = args.find((arg) => arg.startsWith(`--${name}=`));

  if (inline) {
    return inline.substring(`--${name}=`.length);
  }

  const index = args.indexOf(`--${name}`);

  if (index >= 0) {
    return args[index + 1];
  }

  return undefined;
}

const brand = getArgument('brand');
const locale = getArgument('locale');
const shouldOpen = args.includes('--open');

if (!brand || !locale) {
  console.error('');
  console.error('Brand and locale are required.');
  console.error('');
  console.error('Example:');
  console.error('npm run report:allure:aggregate -- --brand seadoo --locale ca-en');
  console.error('');

  process.exit(1);
}

if (!existsSync(reportsDirectory)) {
  console.error('');
  console.error('No reports directory was found.');
  console.error('');

  process.exit(1);
}

const runSuffix = `_${brand}_${locale}`;

const runDirectories = readdirSync(reportsDirectory, {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((directory) => {
    if (directory === 'allure-history' || directory === 'allure-aggregate') {
      return false;
    }

    if (!directory.endsWith(runSuffix)) {
      return false;
    }

    const allureResultsDirectory = path.join(reportsDirectory, directory, 'allure-results');

    return existsSync(allureResultsDirectory);
  })
  .sort();

if (runDirectories.length === 0) {
  console.error('');
  console.error(`No Allure runs found for ${brand} ${locale}.`);
  console.error('');

  process.exit(1);
}

const latestResults = new Map();

for (const runDirectory of runDirectories) {
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

    const identity = result.historyId ?? result.testCaseId ?? result.fullName ?? result.name;

    if (!identity) {
      continue;
    }

    const executionTime = result.stop ?? result.start ?? 0;

    const existing = latestResults.get(identity);

    if (!existing || executionTime >= existing.executionTime) {
      latestResults.set(identity, {
        runDirectory,
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

const selectedResultUuids = new Set();

for (const selected of latestResults.values()) {
  selectedResultUuids.add(selected.result.uuid);

  const sourceResult = path.join(selected.resultsDirectory, selected.resultFile);

  const targetResult = path.join(aggregateResultsDirectory, selected.resultFile);

  copyFileSync(sourceResult, targetResult);

  const attachments = collectAttachments(selected.result);

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

console.log('');
console.log('========================================');
console.log('Allure Aggregate Report');
console.log('========================================');
console.log(`Brand:          ${brand}`);
console.log(`Locale:         ${locale}`);
console.log(`Runs found:     ${runDirectories.length}`);
console.log(`Unique tests:   ${latestResults.size}`);
console.log('');
console.log('Runs included:');

for (const runDirectory of runDirectories) {
  console.log(`- ${runDirectory}`);
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
  console.log('Aggregate report generated successfully.');
  console.log('');
  console.log(`Runs processed: ${runDirectories.length}`);
  console.log(`Unique tests:   ${latestResults.size}`);
  console.log(`Report:         ${aggregateReportDirectory}`);
  console.log('');

  if (!shouldOpen) {
    console.log('Open aggregate report with:');
    console.log(`npm run report:allure:aggregate:open -- --brand ${brand} --locale ${locale}`);
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
