import { describe, it, expect, vi, beforeEach } from "vitest";

// 1. Mock the worker's postMessage function on the global 'self' object
// We must do this *before* importing the worker so it can use this mock.
self.postMessage = vi.fn();

// 2. Import the worker.
// Because the file has no exports and just executes `self.onmessage = ...`,
// importing it automatically attaches the handler to our simulated environment.
import "./csvWorker";

describe("csvWorker.ts Web Worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a CSV Blob and posts a DONE message for standard datasets", async () => {
    const mockData = {
      stats: [
        { id: "2024-01-01", count: 5, totalByteSize: 1024 },
        { id: "2024-01-02", count: 0, totalByteSize: 0 }, // Testing fallback/0 logic
      ],
      totalCount: 5,
      totalBytes: 1024,
    };

    // 3. Trigger the worker's message listener manually
    // We cast it as MessageEvent to satisfy TypeScript
    if (self.onmessage) {
      self.onmessage({ data: mockData } as MessageEvent);
    }

    // 4. Assert that the worker finished and sent the Blob
    expect(self.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "DONE" }),
    );

    // 5. Extract the blob from the mock call and verify its contents
    const doneCall = vi
      .mocked(self.postMessage)
      .mock.calls.find((c) => c[0].type === "DONE");
    const blob: Blob = doneCall![0].blob;

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/csv;charset=utf-8;");

    // Node 20 / JSDOM natively supports Blob.text()
    const csvText = await blob.text();

    expect(csvText).toContain("Date,Transmissions,Volume"); // Headers
    expect(csvText).toContain("2024-01-01,5,1 KB"); // Formatted row
    expect(csvText).toContain("2024-01-02,0,0 B"); // Fallback row
    expect(csvText).toContain("TOTAL,5,1 KB"); // Summary row
  });

  it("correctly formats different byte sizes (formatBytes logic)", async () => {
    const stats = [
      { id: "kb-test", count: 1, totalByteSize: 1536 }, // 1.5 KB
      { id: "mb-test", count: 1, totalByteSize: 1048576 }, // 1 MB
      { id: "gb-test", count: 1, totalByteSize: 1073741824 }, // 1 GB
    ];

    self.onmessage!({
      data: { stats, totalCount: 3, totalBytes: 0 },
    } as MessageEvent);

    const doneCall = vi
      .mocked(self.postMessage)
      .mock.calls.find((c) => c[0].type === "DONE");
    const csvText = await doneCall![0].blob.text();

    expect(csvText).toContain("kb-test,1,1.5 KB");
    expect(csvText).toContain("mb-test,1,1 MB");
    expect(csvText).toContain("gb-test,1,1 GB");
  });

  it("emits PROGRESS events periodically for large datasets", () => {
    // Create a massive array of 4000 items to trigger the `i % 2000 === 0` logic
    const stats = Array.from({ length: 4000 }, (_, i) => ({
      id: `day-${i}`,
      count: 1,
      totalByteSize: 100,
    }));

    self.onmessage!({
      data: { stats, totalCount: 4000, totalBytes: 400000 },
    } as MessageEvent);

    const progressCalls = vi
      .mocked(self.postMessage)
      .mock.calls.filter((c) => c[0].type === "PROGRESS");

    // We expect exactly two progress reports: one at i=2000, and one at the end (i=3999).
    expect(progressCalls.length).toBe(2);

    // (2001 / 4000) * 100 = 50.025 (rounds to 50%)
    expect(progressCalls[0][0].value).toBe(50);

    // (4000 / 4000) * 100 = 100%
    expect(progressCalls[1][0].value).toBe(100);
  });
});
