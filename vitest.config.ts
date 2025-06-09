import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    typecheck: {
      tsconfig: './tsconfig.spec.ts',
    },
    include: ['**/*.{test,e2e}.ts'],
    globals: true,
    environment: 'node',
    env: {
      LOG_LEVEL: 'silent',
      NODE_ENV: 'test',
      DATABASE: 'test',
    },
  },
});
