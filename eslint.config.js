import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-native': reactNative,
      prettier: prettier,
      import: importPlugin,
    },

    rules: {
      // 기본 JS + Hooks 추천 규칙
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React Native 규칙
      ...reactNative.configs.all.rules,

      // Prettier 연동
      'prettier/prettier': 'error',

      // 기타 JS 스타일 설정
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      eqeqeq: ['error', 'always'],

      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'off',
    },
  },
);
