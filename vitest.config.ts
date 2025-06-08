import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{test,e2e}.ts'],
    globals: true,
    environment: 'node',
    env: {
      DATABASE: 'test',
      CONNECTION_URL: 'mongodb://root:example@localhost:27017',
    },
  },
});
