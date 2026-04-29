import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./src/mocks/server";

// Start the server before all tests.
// 'error' ensures Vitest throws if you make a request that doesn't have a handler.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset any request handlers that we may add during the tests,
// so they don't leak into other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
