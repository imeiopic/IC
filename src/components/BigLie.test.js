import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import BigLie from '../../src/components/BigLie.vue'; // Adjust path as necessary

describe('BigLie.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(BigLie);
  });

  it('initializes with correct default values', () => {
    expect(wrapper.vm.purgedSteps).toEqual([]);
    expect(wrapper.vm.velocity).toBe(0.12);
    expect(wrapper.vm.frictionLevel).toBe(100);
  });

  it('purges a step and updates velocity and frictionLevel correctly', async () => {
    // Purge first step (id=1)
    await wrapper.vm.purge(1);
    expect(wrapper.vm.purgedSteps).toEqual([1]);
    // 0.12 + 2.65 = 2.77
    expect(wrapper.vm.velocity).toBe(2.77);
    // 100 - (1 * 33.3) = 66.7
    expect(wrapper.vm.frictionLevel).toBeCloseTo(66.7);

    // Purge second step (id=2)
    await wrapper.vm.purge(2);
    expect(wrapper.vm.purgedSteps).toEqual([1, 2]);
    // 2.77 + 2.65 = 5.42
    expect(wrapper.vm.velocity).toBe(5.42);
    // 100 - (2 * 33.3) = 33.4
    expect(wrapper.vm.frictionLevel).toBeCloseTo(33.4);
  });

  it('sets velocity to 8.09 and frictionLevel to near 0 when all three steps are purged', async () => {
    await wrapper.vm.purge(1);
    await wrapper.vm.purge(2);
    await wrapper.vm.purge(3);

    expect(wrapper.vm.purgedSteps).toEqual([1, 2, 3]);
    expect(wrapper.vm.velocity).toBe(8.09); // Special case for 3 purged steps
    // 100 - (3 * 33.3) = 0.1
    expect(wrapper.vm.frictionLevel).toBeCloseTo(0.1);
  });

  it('displays "ALL LIES DELETED. THE VRE IS ACTIVE." when all steps are purged', async () => {
    await wrapper.vm.purge(1);
    await wrapper.vm.purge(2);
    await wrapper.vm.purge(3);
    await wrapper.vm.$nextTick(); // Wait for DOM update

    const activationSuccess = wrapper.find('.activation-success');
    expect(activationSuccess.exists()).toBe(true);
    expect(activationSuccess.text()).toBe('ALL LIES DELETED. THE VRE IS ACTIVE.');
  });

  it('updates the visual state of pillar cards when purged', async () => {
    const pillarCards = wrapper.findAll('.pillar-card');

    // Initially, no cards should have the 'purged' class
    expect(pillarCards[0].classes()).not.toContain('purged');
    expect(pillarCards[1].classes()).not.toContain('purged');
    expect(pillarCards[2].classes()).not.toContain('purged');

    await wrapper.vm.purge(1);
    await wrapper.vm.$nextTick();
    // After purging step 1, the first card should be purged
    expect(pillarCards[0].classes()).toContain('purged');
    expect(pillarCards[1].classes()).not.toContain('purged');
    expect(pillarCards[2].classes()).not.toContain('purged');

    await wrapper.vm.purge(3); // Purge out of order
    await wrapper.vm.$nextTick();
    // After purging step 3, the third card should also be purged
    expect(pillarCards[0].classes()).toContain('purged');
    expect(pillarCards[1].classes()).not.toContain('purged');
    expect(pillarCards[2].classes()).toContain('purged');
  });

  it('purge buttons are hidden after their respective steps are purged', async () => {
    // Initially, all purge buttons should be present
    expect(wrapper.findAll('.purge-btn').length).toBe(3);

    await wrapper.vm.purge(1);
    await wrapper.vm.$nextTick();
    // After purging step 1, its button should no longer exist
    expect(wrapper.findAll('.pillar-card')[0].find('.purge-btn').exists()).toBe(false);
    expect(wrapper.findAll('.pillar-card')[1].find('.purge-btn').exists()).toBe(true);
    expect(wrapper.findAll('.pillar-card')[2].find('.purge-btn').exists()).toBe(true);

    await wrapper.vm.purge(2);
    await wrapper.vm.purge(3);
    await wrapper.vm.$nextTick();
    // After purging all steps, no purge buttons should exist
    expect(wrapper.findAll('.purge-btn').length).toBe(0);
  });
});
