import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface TaxDetails {
  performance_location: string | null;
  tax_code: string;
}

export interface HarmonicAnchor {
  id: string;
  object: string;
  active: boolean;
  attributes: any[];
  created: number;
  default_price: string;
  description: string | null;
  images: string[];
  livemode: boolean;
  marketing_features: any[];
  metadata: Record<string, string>;
  name: string;
  package_dimensions: any | null;
  shippable: boolean | null;
  statement_descriptor: string | null;
  tax_code: string;
  tax_details: TaxDetails;
  type: string;
  unit_label: string | null;
  updated: number;
  url: string | null;
}

export const useAnchorStore = defineStore('anchor', () => {
  // Suggestion: Move this hardcoded data to a JSON configuration file.
  const collectiveAnchors = ref<HarmonicAnchor[]>([]); 

  const uniqueAnchors = computed(() => {
    const seenIds = new Set();
    return collectiveAnchors.value.filter(anchor => {
      if (seenIds.has(anchor.id)) {
        return false;
      }
      seenIds.add(anchor.id);
      return true;
    });
  });

  return {
    collectiveAnchors,
    uniqueAnchors
  };
});
