// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

export default [
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },
  
  // Base recommended configs
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  
  // Project-specific overrides
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'react': reactPlugin,
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      
      // General
      'no-unused-vars': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // Config file specific rules
  {
    files: ['tailwind.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    }
  },
  {
    files: ['next.config.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    }
  }
];