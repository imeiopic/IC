import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("File Uploads", () => {
  test("Method 1: Uploads a physical file from the file system", async ({
    page,
  }) => {
    await page.goto("/your-upload-route");

    // 1. Target the actual <input type="file"> element
    const fileInput = page.locator('input[type="file"]');

    // 2. Pass the absolute path to the file you want to upload
    const filePath = path.join(__dirname, "fixtures", "test-image.png");
    await fileInput.setInputFiles(filePath);

    // 3. Verify the application reacted to the upload
    await expect(
      page.locator("text=test-image.png successfully attached"),
    ).toBeVisible();
  });

  test("Method 2: Uploads a file directly from memory (Great for CI)", async ({
    page,
  }) => {
    await page.goto("/your-upload-route");

    const fileInput = page.locator('input[type="file"]');

    // Instead of a file path, pass an object with name, mimeType, and a Node Buffer.
    // This prevents you from needing to commit a bunch of dummy images/files to your repo!
    await fileInput.setInputFiles({
      name: "mock-attachment.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image data payload"),
    });

    // Verify the application reacted
    await expect(
      page.locator("text=mock-attachment.png successfully attached"),
    ).toBeVisible();

    // Optional: You can clear the selected files by passing an empty array
    // await fileInput.setInputFiles([]);
  });

  test("Method 3: Simulates a drag-and-drop file upload", async ({ page }) => {
    await page.goto("/your-upload-route");

    // Target the element that acts as the drop area (e.g., a dashed border box)
    const dropzone = page.locator(".dropzone-container");

    // Create a native DataTransfer object in the browser context
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(["fake image data payload"], "drag-drop-mock.png", {
        type: "image/png",
      });
      dt.items.add(file);
      return dt;
    });

    // Dispatch the sequence of events to simulate a user dropping the file
    await dropzone.dispatchEvent("dragenter", { dataTransfer });
    await dropzone.dispatchEvent("dragover", { dataTransfer });
    await dropzone.dispatchEvent("drop", { dataTransfer });

    // Verify the application reacted to the dropped file
    await expect(
      page.locator("text=drag-drop-mock.png successfully attached"),
    ).toBeVisible();
  });

  test("Method 4: Uploads multiple files at once", async ({ page }) => {
    await page.goto("/your-upload-route");

    const fileInput = page.locator('input[type="file"]');

    // Pass an array of file payloads to upload multiple files simultaneously
    await fileInput.setInputFiles([
      {
        name: "mock-attachment-1.png",
        mimeType: "image/png",
        buffer: Buffer.from("fake image data payload 1"),
      },
      {
        name: "mock-attachment-2.png",
        mimeType: "image/png",
        buffer: Buffer.from("fake image data payload 2"),
      },
    ]);

    // Verify the application reacted to multiple files being attached
    await expect(
      page.locator("text=2 files successfully attached"),
    ).toBeVisible();
  });

  test("Method 5: Downloads a file and verifies its contents", async ({
    page,
  }) => {
    await page.goto("/your-download-route");

    // 1. Setup the promise to wait for the download event BEFORE clicking
    const downloadPromise = page.waitForEvent("download");

    // 2. Trigger the download action
    await page.getByRole("button", { name: /Download File/i }).click();

    // 3. Wait for the download to initialize
    const download = await downloadPromise;

    // 4. Verify the file's metadata
    expect(download.suggestedFilename()).toBe("expected-file.txt");

    // 5. Retrieve the temporary path where Playwright saved the file
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // 6. Read the file into memory and verify its actual contents
    // (Assuming it's a text-based file like CSV, JSON, or TXT)
    const fileContents = fs.readFileSync(downloadPath!, "utf-8");
    expect(fileContents).toContain("Expected file content string");
  });

  test("Method 6: Downloads and parses a CSV file's data structure", async ({
    page,
  }) => {
    // 1. Intercept the API call that provides the data for the CSV worker
    await page.route("**/api/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          stats: [{ id: "2024-01-01", count: 5, totalByteSize: 1024 }],
          totalCount: 5,
          totalBytes: 1024,
        }),
      });
    });

    await page.goto("/your-download-route");

    // 2. Wait for the download event to trigger
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Export CSV/i }).click();
    const download = await downloadPromise;

    // 3. Verify the expected file type extension
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);

    // 4. Read the temporary file contents into memory
    const downloadPath = await download.path();
    const csvText = fs.readFileSync(downloadPath!, "utf-8");

    // 5. Basic CSV Parsing: Split into rows, then columns
    const rows = csvText.trim().split("\n");
    expect(rows.length).toBeGreaterThan(1); // Ensure we have headers + at least 1 data row

    // 6. Verify the CSV column headers match the worker's output
    const headers = rows[0].split(",");
    expect(headers).toEqual(["Date", "Transmissions", "Volume"]);

    // 7. Verify the structural integrity of the first data row matches our mock!
    const firstDataRow = rows[1].split(",");
    expect(firstDataRow.length).toBe(3); // Should have exactly 3 columns
    expect(firstDataRow).toEqual(["2024-01-01", "5", "1 KB"]);
  });

  test("Method 7: Downloads a PDF file buffer directly from an API", async ({
    page,
  }) => {
    // 1. Intercept the API call and fulfill it with a mock PDF buffer
    await page.route("**/api/download-report", async (route) => {
      // A minimal valid PDF header for testing
      const mockPdfBuffer = Buffer.from("%PDF-1.4\n%MockPDFContent");

      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        headers: {
          // This header tells the browser to treat the response as a downloadable file
          "Content-Disposition": "attachment; filename=annual-report.pdf",
        },
        body: mockPdfBuffer,
      });
    });

    await page.goto("/your-download-route");

    // 2. Setup the listener and trigger the download
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download PDF/i }).click();
    const download = await downloadPromise;

    // 3. Verify the browser parsed the Content-Disposition header correctly
    expect(download.suggestedFilename()).toBe("annual-report.pdf");

    // 4. Verify the downloaded file's contents match our mocked buffer
    const downloadPath = await download.path();
    const fileContents = fs.readFileSync(downloadPath!, "utf-8");
    expect(fileContents).toContain("%PDF-1.4");
  });
});
