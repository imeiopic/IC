/// <reference types="vitest/globals" />

declare global {
  var myGlobalMock: {
    someValue: string;
    setup: () => void;
    teardown: () => void;
  };
}

export {};
