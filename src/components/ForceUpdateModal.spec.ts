import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ForceUpdateModal from "./ForceUpdateModal.vue";

describe("ForceUpdateModal.vue", () => {
  // JSDOM (our test environment) doesn't allow direct reassignment of window.location
  // out of the box, so we need to mock it before each test runs.
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost:5000/" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the critical update warning correctly", () => {
    const wrapper = mount(ForceUpdateModal);

    // Assert that the component mounted and contains our expected text
    expect(wrapper.text()).toContain("CRITICAL UPDATE REQUIRED");
    expect(wrapper.text()).toContain("INITIATE SYSTEM REBOOT");
  });

  it("appends a timestamp query parameter and reloads when reboot is initiated", async () => {
    // We use fake timers so Date.now() returns a predictable number for our assertion
    vi.useFakeTimers();
    const mockTimestamp = 1700000000000;
    vi.setSystemTime(mockTimestamp);

    const wrapper = mount(ForceUpdateModal);

    // Find the reboot button and simulate a user click
    await wrapper.find("button").trigger("click");

    // Assert that the URL was updated to bypass the cache!
    expect(window.location.href).toBe(
      `http://localhost:5000/?t=${mockTimestamp}`,
    );
  });
});
