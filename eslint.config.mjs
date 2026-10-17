import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'tools/verify/output/**',
      'next-env.d.ts',
      // tonik's recovered bundle and our decoders — analysis material, not our
      // source. Linting it produces a hundred warnings about someone else's
      // minifier output. See docs/research/source/README.md.
      'docs/**',
      // The anatomy kit, vendored as shipped so it can be diffed against
      // upstream. Its terse style trips no-unused-expressions. D-064.
      'tools/figures/kit/**',
      'tools/figures/out/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;
