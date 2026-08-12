import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

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

for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const args = process.argv.slice(2);
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

  process.exit(code ?? 1);
});
