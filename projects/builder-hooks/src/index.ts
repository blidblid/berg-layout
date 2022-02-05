import { BuilderOutput, Target } from '@angular-devkit/architect';
import { hook } from '@berglund/angular-cli-hooks';
import {
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { sync } from 'glob';
import { join, parse } from 'path';
import { basename } from 'path/posix';
import { compile } from 'sass';

export default [
  hook({
    name: 'build',
    after: async ({}, { workspaceRoot, target }): Promise<BuilderOutput> => {
      webComponentBuildHook(workspaceRoot, target);
      return { success: true };
    },
  }),
  hook({
    name: 'build-lib',
    after: async ({}, { workspaceRoot, target }): Promise<BuilderOutput> => {
      preBuildThemes(workspaceRoot, target);
      return { success: true };
    },
  }),
];

function preBuildThemes(workspaceRoot: string, target?: Target) {
  if (target?.project !== 'styling') {
    return;
  }

  const stylingDist = join(workspaceRoot, 'dist', 'styling');

  for (const preBuiltThemePath of sync(
    join(workspaceRoot, 'projects/styling/src/prebuilt/*.scss')
  )) {
    const cssFileName =
      basename(preBuiltThemePath, parse(preBuiltThemePath).ext) + '.css';

    writeFileSync(
      join(stylingDist, cssFileName),
      compile(preBuiltThemePath).css
    );
  }
}

function webComponentBuildHook(workspaceRoot: string, target?: Target): void {
  if (target?.project !== 'web-component') {
    return;
  }

  concatBundle(workspaceRoot);
  copyAssets(workspaceRoot);

  unlinkSync(join(workspaceRoot, 'dist/web-component/index.html'));
  unlinkSync(join(workspaceRoot, 'dist/web-component/3rdpartylicenses.txt'));
}

function copyAssets(workspaceRoot: string): void {
  const assets = [
    {
      from: 'package.json',
      to: 'package.json',
    },
  ];

  for (const asset of assets) {
    copyFileSync(
      join(workspaceRoot, 'projects', 'web-component', asset.from),
      join(workspaceRoot, 'dist', 'web-component', asset.to)
    );
  }
}

let readPolyfills: string;
let readRuntime: string;

function concatBundle(workspaceRoot: string): void {
  const mainPath = join(workspaceRoot, 'dist/web-component/main.js');
  const runtimePath = join(workspaceRoot, 'dist/web-component/runtime.js');
  const polyfillsPath = join(workspaceRoot, 'dist/web-component/polyfills.js');

  const runtime = readRuntime ?? readFileSync(runtimePath);
  const polyfills = readPolyfills ?? readFileSync(polyfillsPath);

  readRuntime = runtime;
  readPolyfills = polyfills;

  safeUnlinkSync(runtimePath);
  safeUnlinkSync(polyfillsPath);

  writeFileSync(
    mainPath,
    readFileSync(mainPath, 'utf8') + readRuntime + readPolyfills
  );
}

function safeUnlinkSync(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}
