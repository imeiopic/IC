import { mount } from "@vue/test-utils";
import Root from "../src/components/Root.vue";

describe("Root.vue", () => {
  it("renders onboarding UI and opens Manifesto modal", async () => {
    const wrapper = mount(Root, {
      global: {
        stubs: ["router-link"],
      },
    });
    expect(wrapper.text()).toContain("ACCEPT MANIFESTO");
    // Simulate click to open Manifesto modal
    await wrapper.find(".btn-0").trigger("click");
    // Check for ManifestoModal in DOM
    expect(wrapper.html()).toContain("MANIFESTO FOR THE IOPIC AGE");
  });
});
