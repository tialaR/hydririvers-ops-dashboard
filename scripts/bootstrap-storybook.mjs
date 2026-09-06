import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const write = (path, content) => {
  mkdirSync(path.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(path, content, 'utf8');
};

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  storybook: 'storybook dev -p 6006',
  'build-storybook': 'storybook build',
};
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

write('.storybook/main.ts', `import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;
`);

write('.storybook/preview.tsx', `import type { Decorator, Preview } from '@storybook/nextjs-vite';
import React from 'react';

import '../src/shared/design-system/foundations/semantic-tokens.css';
import './storybook.css';

const withHydroTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'light' ? 'light' : 'dark';

  return (
    <div className="hy-storybook-canvas" data-hy-theme={theme}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withHydroTheme],
  globalTypes: {
    theme: {
      description: 'HydroRivers semantic color theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
    layout: 'centered',
    a11y: { test: 'todo' },
  },
};

export default preview;
`);

write('.storybook/storybook.css', `.hy-storybook-canvas {
  box-sizing: border-box;
  min-height: 100vh;
  width: 100%;
  padding: 3rem;
  display: grid;
  place-items: center;
  background: var(--hy-color-canvas);
  color: var(--hy-color-text-primary);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hy-storybook-canvas *,
.hy-storybook-canvas *::before,
.hy-storybook-canvas *::after {
  box-sizing: border-box;
}
`);

write('src/shared/design-system/foundations/semantic-tokens.css', `:root,
[data-hy-theme='dark'] {
  color-scheme: dark;
  --hy-color-canvas: #080a0d;
  --hy-color-surface: #10151b;
  --hy-color-surface-raised: #161d25;
  --hy-color-border: #2a3440;
  --hy-color-text-primary: #f5f7fa;
  --hy-color-text-secondary: #8f9baa;
  --hy-color-accent: #31c6d6;
  --hy-color-info: #42a5ff;
  --hy-color-success: #27c982;
  --hy-color-warning: #f0b847;
  --hy-color-critical: #ff5b6d;
  --hy-shadow-soft: 0 18px 48px rgba(0, 0, 0, 0.24);
  --hy-radius-control: 999px;

  /* Legacy aliases kept while the application migrates to semantic tokens. */
  --brand: var(--hy-color-accent);
  --river: var(--hy-color-info);
  --surface: var(--hy-color-surface);
  --text: var(--hy-color-text-primary);
  --muted-soft: var(--hy-color-text-secondary);
  --line-strong: var(--hy-color-border);
  --brand-soft-line: color-mix(in srgb, var(--hy-color-accent) 54%, transparent);
  --glow: color-mix(in srgb, var(--hy-color-accent) 22%, transparent);
  --shadow-soft: var(--hy-shadow-soft);
  --radius-pill: var(--hy-radius-control);
}

[data-hy-theme='light'] {
  color-scheme: light;
  --hy-color-canvas: #f4f7fa;
  --hy-color-surface: #ffffff;
  --hy-color-surface-raised: #f7f9fb;
  --hy-color-border: #d7dee6;
  --hy-color-text-primary: #14202a;
  --hy-color-text-secondary: #687686;
  --hy-color-accent: #087f8c;
  --hy-color-info: #1a78c8;
  --hy-color-success: #168a5b;
  --hy-color-warning: #a96c00;
  --hy-color-critical: #c83b4a;
  --hy-shadow-soft: 0 14px 36px rgba(20, 32, 42, 0.10);
}
`);

write('src/shared/ui/button/button.stories.tsx', `import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';

const meta = {
  title: 'Foundations/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'HydroRivers shared action primitive. Stories exercise semantic themes and behavioral states without redefining product behavior.',
      },
    },
  },
  args: {
    children: 'Abrir contexto',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingLabel: 'Atualizando operação',
    children: 'Atualizar operação',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Ação indisponível',
  },
};
`);

write('docs/design-system/STORYBOOK.md', `# HydroRivers Design System — Storybook

## Purpose

Storybook is the living catalog for reusable HydroRivers UI. It documents component contracts, states, semantic themes and accessibility before those pieces are composed into product screens.

## Commands

\`npm run storybook\` starts the local catalog on port 6006.  
\`npm run build-storybook\` verifies that the catalog can be statically built.

## Theme contract

Stories use \`data-hy-theme="dark|light"\` and the semantic bridge in \`src/shared/design-system/foundations/semantic-tokens.css\`.

The \`--hy-*\` variables are the forward-facing semantic contract. Existing variables remain aliases only while production components migrate incrementally.

## Promotion rule

A story is not proof that a component is APPROVED/DIAMOND. Storybook proves implementation states. Product homologation still follows the canonical HydroRivers Source of Truth.

## First published primitive

\`Foundations/Button\` exposes primary, secondary, ghost, loading and disabled states in both themes through the global theme control.
`);

console.log('[storybook-bootstrap] Storybook config, semantic theme bridge, docs and first stories written.');
