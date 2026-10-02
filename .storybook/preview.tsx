import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

import ptBRMessages from '../messages/pt-BR.json';
import enUSMessages from '../messages/en-US.json';
import esMessages from '../messages/es.json';
import '../src/shared/design-system/foundations/semantic-tokens.css';
import '../src/shared/design-system/foundations/dashboard-visual-tokens.css';
import '../src/shared/design-system/foundations/page-61-contract-tokens.css';
import '../src/shared/design-system/foundations/page-62-semantic-tokens.css';
import './storybook.css';

const STORYBOOK_MESSAGES = {
  'pt-BR': ptBRMessages,
  'en-US': enUSMessages,
  es: esMessages,
} as const;

const withHydroTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'light' ? 'light' : 'dark';
  const locale = context.globals.locale === 'en-US' || context.globals.locale === 'es'
    ? context.globals.locale
    : 'pt-BR';

  return (
    <NextIntlClientProvider locale={locale} messages={STORYBOOK_MESSAGES[locale]}>
      <div className="hy-storybook-canvas root" data-hy-theme={theme} data-theme={theme}>
        <Story />
      </div>
    </NextIntlClientProvider>
  );
};

const preview: Preview = {
  decorators: [withHydroTheme],
  globalTypes: {
    locale: {
      description: 'HydroRivers locale',
      defaultValue: 'pt-BR',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'pt-BR', title: 'Português' },
          { value: 'en-US', title: 'English' },
          { value: 'es', title: 'Español' },
        ],
        dynamicTitle: true,
      },
    },
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
