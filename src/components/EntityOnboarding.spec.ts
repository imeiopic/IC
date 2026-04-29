import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import EntityOnboarding from "../EntityOnboarding.vue";

// Mock the useIOSettings composable to prevent errors from playSFX
vi.mock("../useIOSettings", () => ({
  useIOSettings: () => ({
    playSFX: vi.fn(),
  }),
}));

describe("EntityOnboarding.vue", () => {
  beforeEach(() => {
    // Use fake timers to control setTimeout during tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it("initializes in the correct EMERGENCY state", () => {
    const wrapper = mount(EntityOnboarding);

    expect(wrapper.find(".progress-bar").text()).toContain(
      "0 / 16 THREADS LOCKED",
    );
    expect(wrapper.find(".progress-bar").attributes("style")).toContain(
      "width: 0%",
    );
    expect(wrapper.find(".meta-info").text()).toContain("STATUS: EMERGENCY");
    expect(wrapper.find(".sovereign-message").exists()).toBe(false);

    const buttons = wrapper.findAll(".step-item button");
    expect((buttons[0].element as HTMLButtonElement).disabled).toBe(false);
    expect((buttons[1].element as HTMLButtonElement).disabled).toBe(true);
  });

  it("progresses through each step and reaches SOVEREIGN state", async () => {
    const wrapper = mount(EntityOnboarding);
    const steps = wrapper.findAll(".step-item");

    // --- Step 1: Spatial Lock ---
    await steps[0].find("button").trigger("click");
    expect(steps[0].find("button").text()).toBe("VERIFYING...");
    await vi.advanceTimersByTimeAsync(1500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".progress-bar").text()).toContain(
      "4 / 16 THREADS LOCKED",
    );
    expect(wrapper.find(".meta-info").text()).toContain("STATUS: EMERGENCY");
    expect(steps[1].classes()).toContain("status-pending");

    // --- Step 2: Identity Persistence ---
    await steps[1].find("button").trigger("click");
    await vi.advanceTimersByTimeAsync(1500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".progress-bar").text()).toContain(
      "8 / 16 THREADS LOCKED",
    );
    expect(wrapper.find(".meta-info").text()).toContain("STATUS: EMERGENCY");
    expect(steps[2].classes()).toContain("status-pending");

    // --- Step 3: Value Flow ---
    await steps[2].find("button").trigger("click");
    await vi.advanceTimersByTimeAsync(1500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".progress-bar").text()).toContain(
      "12 / 16 THREADS LOCKED",
    );
    expect(wrapper.find(".meta-info").text()).toContain("STATUS: DEGRADED"); // State changes at 12 threads
    expect(steps[3].classes()).toContain("status-pending");

    // --- Step 4: System Integrity ---
    await steps[3].find("button").trigger("click");
    await vi.advanceTimersByTimeAsync(1500);
    await wrapper.vm.$nextTick();

    // Final state check
    expect(wrapper.find(".progress-bar").text()).toContain(
      "16 / 16 THREADS LOCKED",
    );
    expect(wrapper.find(".meta-info").text()).toContain("STATUS: SOVEREIGN");
    expect(wrapper.find(".sovereign-message").exists()).toBe(true);
    expect(wrapper.find(".sovereign-message").text()).toContain(
      "SYNCHRONIZATION COMPLETE",
    );
  });
});
