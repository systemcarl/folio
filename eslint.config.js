import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  stylistic.configs.recommended,
  {
    languageOptions : {
      globals : { ...globals.browser, ...globals.node },
    },
    rules : {
      '@stylistic/brace-style' : ['error', '1tbs', { allowSingleLine : true }],
      '@stylistic/key-spacing' : ['error', {
        beforeColon : true,
        afterColon : true,
        ignoredNodes : [
          'TSTypeLiteral',
          'TSInterfaceBody',
        ],
      }],
      '@stylistic/max-len' : ['error', { code : 80 }],
      '@stylistic/max-statements-per-line' : 'off',
      '@stylistic/member-delimiter-style' : ['error', {
        multiline : { delimiter : 'semi' },
        singleline : { delimiter : 'semi', requireLast : true },
      }],
      '@stylistic/operator-linebreak' : ['error', 'before', {
        overrides : { '=' : 'after' },
      }],
      '@stylistic/semi' : ['error', 'always'],
      '@stylistic/type-annotation-spacing' : ['error', {
        before : true,
        after : true,
      }],
      '@typescript-eslint/no-unused-vars' : [
        'error',
        {
          argsIgnorePattern : '^_',
          varsIgnorePattern : '^_',
          caughtErrorsIgnorePattern : '^_',
        },
      ],
      'svelte/no-at-html-tags' : 'off',
      'no-undef' : 'off',
    },
  },
  {
    files : [
      '**/*.svelte',
      '**/*.svelte.ts',
      '**/*.svelte.js',
    ],
    languageOptions : {
      parserOptions : {
        projectService : true,
        extraFileExtensions : ['.svelte'],
        parser : ts.parser,
        svelteConfig,
      },
    },
  },
);
