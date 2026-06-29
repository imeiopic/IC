// c:/IO/IC/backend.setup.ts
import { beforeAll } from 'vitest';

globalThis.backendConfig = {
  apiKey: 'secret_backend_key',
  endpoint: 'http://localhost:3000'
};

beforeAll(() => {
  console.log('Backend workspace initialized with global config.');
});
