import baseConfig from '@hono/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
