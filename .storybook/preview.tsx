import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

import ptBRMessages from '../messages/pt-BR.json';
import '../src/shared/design-system/foundations/semantic-tokens.css';
import '../src/shared/design-system/foundations/page-61-contract-tokens.css';
import './storybook.css';

const withHydroTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'light' ? 'light' : 'dark';

  return (
    <NextIntlClientProvider locale="pt-BR" messages={ptBRMessages}>
      <div className="hy-storybook-canvas root" data-hy-theme={theme} data-theme={theme}>
        <Story />
      </div>
    </NextIntlClientProvider>
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
    nextjs: { appDirectory: true },
    a11y: {
      test: 'error',
    },
  },
};

export default preview;
