import { BuilderOutput } from '@angular-devkit/architect';
import { hook } from '@berglund/angular-cli-hooks';
import {
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

export default [
  hook({
    name: 'build',
    after: async ({}, { workspaceRoot, target }): Promise<BuilderOutput> => {
      if (target?.project !== 'web-component') {
        return { success: true };
      }

      concatBundle(workspaceRoot);
      copyAssets(workspaceRoot);

      unlinkSync(join(workspaceRoot, 'dist/web-component/index.html'));
      unlinkSync(
        join(workspaceRoot, 'dist/web-component/3rdpartylicenses.txt')
      );

      return { success: true };
    },
  }),
];

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
