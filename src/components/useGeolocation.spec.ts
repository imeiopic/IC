import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { useGeolocation } from "./useGeolocation";
import { defineComponent } from "vue";

// 1. Create a dummy component to trigger Vue lifecycle hooks (onMounted, onUnmounted)
const TestComponent = defineComponent({
  setup() {
    return useGeolocation();
  },
  template: "<div />",
});

describe("useGeolocation.ts Composable", () => {
  afterEach(() => {
    vi.clearAllMocks();
    // Important: Restore the original global.navigator after every test!
    vi.unstubAllGlobals();
  });

  it("sets an error if geolocation is not supported by the browser", () => {
    // Mock navigator without the geolocation property
    vi.stubGlobal("navigator", {});

    const wrapper = mount(TestComponent);

    // Access the exposed setup state via wrapper.vm
    expect(wrapper.vm.geolocationError).toBe(
      "Geolocation is not supported by your browser.",
    );
    expect(wrapper.vm.currentCoords).toBeNull();
  });

  it("updates coordinates when watchPosition succeeds", () => {
    // Create a mock that immediately invokes the success callback (the first argument)
    const mockWatchPosition = vi.fn((successCb) => {
      successCb({
        coords: { latitude: 34.0522, longitude: -118.2437 },
      });
      return 123; // Return a mock watchId
    });

    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: mockWatchPosition,
        clearWatch: vi.fn(),
      },
    });

    const wrapper = mount(TestComponent);

    expect(mockWatchPosition).toHaveBeenCalled();
    expect(wrapper.vm.currentCoords).toEqual({ lat: 34.0522, lon: -118.2437 });
    expect(wrapper.vm.geolocationError).toBeNull();
  });

  it("handles PERMISSION_DENIED error correctly", () => {
    // Create a mock that invokes the error callback (the second argument)
    const mockWatchPosition = vi.fn((_, errorCb) => {
      errorCb({ code: 1, PERMISSION_DENIED: 1 });
      return 124;
    });

    vi.stubGlobal("navigator", {
      geolocation: { watchPosition: mockWatchPosition, clearWatch: vi.fn() },
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.vm.geolocationError).toBe(
      "Spatial Access Denied: Logical Truth requires GPS synchronization.",
    );
  });

  it("handles POSITION_UNAVAILABLE error correctly", () => {
    const mockWatchPosition = vi.fn((_, errorCb) => {
      errorCb({ code: 2, POSITION_UNAVAILABLE: 2 });
      return 125;
    });

    vi.stubGlobal("navigator", {
      geolocation: { watchPosition: mockWatchPosition, clearWatch: vi.fn() },
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.vm.geolocationError).toBe(
      "Spatial Data Stream Disrupted: Location information unavailable.",
    );
  });

  it("clears the geolocation watcher when the component unmounts", () => {
    const mockClearWatch = vi.fn();
    const mockWatchPosition = vi.fn(() => 999); // Return a specific watchId

    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: mockWatchPosition,
        clearWatch: mockClearWatch,
      },
    });

    const wrapper = mount(TestComponent);

    // Ensure clearWatch hasn't been called prematurely
    expect(mockClearWatch).not.toHaveBeenCalled();

    // Unmount the component to trigger the onUnmounted hook
    wrapper.unmount();

    // Assert clearWatch was called exactly once with the ID returned by watchPosition
    expect(mockClearWatch).toHaveBeenCalledTimes(1);
    expect(mockClearWatch).toHaveBeenCalledWith(999);
  });
});
