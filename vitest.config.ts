import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [vue() as any, tsconfigPaths() as any],
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.spec.ts', '**/*.test.ts'],
  },
});