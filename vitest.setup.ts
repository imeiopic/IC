// c:/IO/IC/vitest.setup.ts
import { beforeAll, afterAll } from 'vitest';

// Example: Setting up a mock for a global API or a database connection
console.log('Global setup: Initializing test environment...');

// Assigning to globalThis satisfies the TypeScript declaration in env.d.ts
globalThis.myGlobalMock = {
  someValue: 'initialized',
  setup: () => console.log('myGlobalMock setup'),
  teardown: () => console.log('myGlobalMock teardown')
};

beforeAll(() => {
  // This code runs once before all test suites start
  console.log('Global setup: Running beforeAll hook for all test suites.');
  myGlobalMock.setup();
});

afterAll(() => {
  // This code runs once after all test suites have finished
  console.log('Global setup: Running afterAll hook for all test suites.');
  myGlobalMock.teardown();
});
