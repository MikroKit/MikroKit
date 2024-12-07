module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  // plugins: ['@typescript-eslint', 'jest', '@mionkit/eslint-plugin'], // @mionkit/eslint-plugin is not jet published
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:jest/recommended'],
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
  },
  rules: {
    'no-empty-function': 'off',
    // 'jest/no-disabled-tests': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['**/*.routes.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-unused-vars': ['warn', {args: 'none'}],
        'no-unused-vars': ['warn', {args: 'none'}],
      },
    },
    {
      files: ['**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', {args: 'none'}],
        'no-unused-vars': ['warn', {args: 'none'}],
      },
    },
  ],
};
