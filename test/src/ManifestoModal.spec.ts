import { mount } from "@vue/test-utils";
import ManifestoModal from "../src/components/modals/ManifestoModal.vue";

describe("ManifestoModal.vue", () => {
  it("disables sign buttons until scrolled to end", async () => {
    const wrapper = mount(ManifestoModal);
    expect(wrapper.find(".action-btn").attributes("disabled")).toBeDefined();
  });

  it("opens signature modal when button clicked", async () => {
    const wrapper = mount(ManifestoModal);
    // Enable buttons (scrolledToEnd is a ref, not data)
    wrapper.vm.scrolledToEnd.value = true;
    await wrapper.vm.$nextTick();
    await wrapper.findAll(".action-btn")[0].trigger("click");
    expect(wrapper.vm.showSignatureModal.value).toBe(true);
  });
});
