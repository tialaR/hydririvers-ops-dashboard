import type { Decorator, Preview } from '@storybook/nextjs-vite';
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
    a11y: {
      test: 'error',
    },
  },
};

export default preview;
