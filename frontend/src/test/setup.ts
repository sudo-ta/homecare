import '@testing-library/jest-dom/vitest';

// jsdom has no crypto.randomUUID in some versions, and the API client and the
// upload component both use it for local ids.
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
    configurable: true,
  });
}
