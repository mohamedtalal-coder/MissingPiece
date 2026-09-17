import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'test-mongoose-pipeline.ts',
      'test-mongoose-return.ts',
      'test-script.ts',
      'test2.ts',
      'test-security.js',
      'dist/**',
      'node_modules/**',
      'jest.config.ts',
      'jest.setup.ts',
      'scripts/**',
      'moveTests.mjs',
      'moveTestsToSrc.mjs'
    ],
  }
);
