import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'reports/**',
      'screenshots/**',
      '**/*-snapshots/**',
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    ...playwright.configs['flat/recommended'],

    files: [
      'tests/**/*.ts',
      'pages/**/*.ts',
      'fixtures/**/*.ts',
      'utils/**/*.ts',
    ],

    rules: {
      ...playwright.configs['flat/recommended'].rules,

      /*
       * Les annotations et test.step font partie de notre stratégie
       * de lisibilité et de traçabilité.
       */
      'playwright/expect-expect': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-focused-test': 'error',
    },
  },

  /*
   * Doit rester en dernier pour neutraliser les règles de formatage
   * susceptibles d’entrer en conflit avec Prettier.
   */
  prettier,
);
