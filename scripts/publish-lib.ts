import { readCachedProjectGraph } from '@nrwl/devkit';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import cmp from 'semver-compare';

for (const name of ['core', 'angular', 'react']) {
  publish(name);
  process.exit(0);
}

function publish(name: string) {
  console['log']('Library to publish:', name);

  const graph = readCachedProjectGraph();
  const project = graph.nodes[name];

  invariant(
    project,
    `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
  );

  const outputPath = project.data?.targets?.build?.options?.outputPath;
  invariant(
    outputPath,
    `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`
  );

  process.chdir(outputPath);

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
  }

  console['log'](
    chalk.bold.green(`Publishing new version ${localVersion} to registry...`)
  );

  execSync('npm publish', { stdio: 'inherit' });
}

function invariant(condition: unknown, message: string) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}
