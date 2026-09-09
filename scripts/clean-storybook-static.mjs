import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const outputDirectory = resolve(process.cwd(), 'storybook-static');

if (!outputDirectory.endsWith('/storybook-static')) {
  throw new Error(`Refusing to clean unexpected Storybook output: ${outputDirectory}`);
}

rmSync(outputDirectory, { recursive: true, force: true });
