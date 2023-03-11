import chalk from 'chalk';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import cmp from 'semver-compare';

for (const name of ['core', 'angular', 'react']) {
  publish(name);
}

process.exit(0);

function publish(name: string) {
  console['log']('Library to publish:', name);

  const libraryPath = join(__dirname, '..', `dist/libs/${name}`);
  process.chdir(libraryPath);

  let localVersion = '0.0.0';

  try {
    const json = JSON.parse(readFileSync(`package.json`).toString());
    localVersion = json.version;
  } catch (e) {
    console.error(
      chalk.bold.red(
        `Error reading package.json file from library build output.`
      )
    );

    return;
  }

  const registryVersion = execSync(`npm show @berg-layout/${name} version`)
    .toString()
    .replace(/\r\n/, '')
    .replace(/\n/, '');

  const localIsNewer = cmp(localVersion, registryVersion) > 0;

  if (!localIsNewer) {
    console['log'](
      chalk.yellow(
        `Publish skipped. Version (${localVersion}) is same or older as registry (${registryVersion}).`
      )
    );

    return;
  }

  console['log'](
    chalk.bold.green(`Publishing new version ${localVersion} to registry...`)
  );

  execSync('npm publish', { stdio: 'inherit' });
}
