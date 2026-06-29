import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // 1. Frontend Project
  {
    // Inherit all resolution and plugin logic (like Vue) from Vite
    extends: './vite.config.ts',
    test: {
      name: 'frontend',
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      // Target your Vue/TypeScript frontend tests (e.g., index.spec.ts)
      include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      exclude: ['node_modules/**', 'dist/**', 'src/e2e/**'],
    },
  },
  // 2. Backend Project
  {
    test: {
      name: 'backend',
      environment: 'node',
      setupFiles: ['./backend.setup.ts'],
      // Target your Express/Firebase JavaScript tests (e.g., index.spec.js)
      include: ['**/*.spec.js'],
      // Exclude Firebase Security Rules tests (which use their own emulator test-runner)
      exclude: ['node_modules/**', 'dist/**', '*.rules.spec.js'],
    },
  },
  // 3. Security Rules Project
  {
    test: {
      name: 'rules',
      environment: 'node',
      globalSetup: ['./vitest.rules.setup.ts'],
      // Target your Firebase Security Rules tests
      include: ['**/*.spec.ts', '**/*.rules.spec.js', '**/*.rules.test.ts'],
      exclude: ['node_modules/**', 'dist/**'],
    },
  },
]);
