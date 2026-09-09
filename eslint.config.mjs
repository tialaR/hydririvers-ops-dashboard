import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    name: 'hydrorivers/generated-artifacts',
    ignores: ['storybook-static/**'],
  },
];

export default config;
