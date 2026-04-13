import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    settings: {
      react: { version: '19' },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;

