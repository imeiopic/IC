import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Homepage from "../HomePage.vue";
import EntityOnboarding from "../EntityOnboarding.vue";

// Mock Three.js WebGLRenderer for JSDOM
// @ts-ignore
vi.mock("three", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement("canvas"),
    })),
  };
});

// Mock Vue Router
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock Firebase Live AI to prevent initialization errors in the test
vi.mock("@firebase/ai", () => ({
  getAI: vi.fn(),
  getLiveGenerativeModel: vi.fn(() => ({
    startChat: vi.fn(() => ({
      sendMessage: vi.fn().mockResolvedValue({ response: {} }),
    })),
    connect: vi.fn(),
  })),
  ResponseModality: { AUDIO: "AUDIO" },
  startAudioConversation: vi.fn(),
}));

vi.mock("../firebase", () => ({ app: {} }));

// Mock System Composables
vi.mock("../useIOSettings", () => ({
  useIOSettings: () => ({ playSFX: vi.fn() }),
}));

vi.mock("../useSystemBus", () => ({
  useSystemBus: () => ({
    isIOsticAcknowledged: { value: true }, // Pretend the user already clicked "I ACKNOWLEDGE..."
    lockBit: vi.fn(),
    addLog: vi.fn(),
  }),
}));

// Mock animation frame functions to prevent infinite rendering loops in tests
vi.stubGlobal("requestAnimationFrame", vi.fn());
vi.stubGlobal("cancelAnimationFrame", vi.fn());

describe("Homepage.vue Routing and Onboarding Flow", () => {
  it("triggers Entity Onboarding instead of routing immediately when a name is entered", async () => {
    const wrapper = mount(Homepage);
    const vm = wrapper.vm as any;

    // 1. Force the UI into the name input state
    vm.showNameInput = true;
    await vm.$nextTick();

    // Verify the onboarding overlay is hidden initially
    expect(vm.showOnboarding).toBe(false);

    // 2. Simulate entering a new username and triggering the route
    vm.username = "I.T Real";
    vm.tryRoute();
    await vm.$nextTick();

    // 3. Verify the direct route was interrupted and the onboarding overlay appeared
    expect(vm.showOnboarding).toBe(true);

    const onboardingOverlay = wrapper.findComponent(EntityOnboarding);
    expect(onboardingOverlay.exists()).toBe(true);

    // 4. Simulate the Onboarding component completing the 16-thread sequence
    onboardingOverlay.vm.$emit("complete");
    await vm.$nextTick();

    // 5. Verify the overlay closes, paving the way for the cinematic Gateway zoom
    expect(vm.showOnboarding).toBe(false);
  });

  it('skips onboarding and proceeds directly when the admin username "ime iopic" is entered', async () => {
    const wrapper = mount(Homepage);
    const vm = wrapper.vm as any;

    vm.showNameInput = true;
    await vm.$nextTick();

    // Simulate entering the backdoor username (case insensitive)
    vm.username = "Ime Iopic";
    vm.tryRoute();
    await vm.$nextTick();

    // Verify the onboarding overlay was completely bypassed
    expect(vm.showOnboarding).toBe(false);
    expect(wrapper.findComponent(EntityOnboarding).exists()).toBe(false);
  });
});
