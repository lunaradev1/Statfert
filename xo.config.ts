import type { FlatXoConfig } from 'xo'

export default [
  {
    files: ['**/*.{ts,js,mjs,json}'],
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      'unicorn/filename-case': ['error', { case: 'snakeCase' }],
      'dot-notation': 'off',
      '@typescript-eslint/dot-notation': 'off',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/indent': ['error', 2],
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/comma-dangle': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/indent-binary-ops': 'off',
      'max-params': 'off',
      'new-cap': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      curly: 'off',
      'no-warning-comments': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'import-x/extensions': 'off',
      'guard-for-in': 'off',
      '@stylistic/semi': 'off', // We don't use semicolons here.
    },
  },
  {
    ignores: [
      '**/node_modules/',
      '**/cache/',
      '**/temp/',
      '**/dist/',
      '**/tsconfig*',
      '**/package-lock.json',
      '**/package.json',
      '**/bun.lock',
    ],
  },
] satisfies FlatXoConfig[]
