<template>
  <div class="wallet-substrate p-3 border border-zinc-800 bg-zinc-950 rounded shadow-info font-mono">
    <!-- Substrate Header -->
    <div class="d-flex justify-content-between align-items-center mb-3 border-b border-zinc-800 pb-2">
      <div class="header-logic">
        <h4 class="extra-tiny text-info font-black uppercase m-0">[NODE_WALLET_SUBSTRATE]</h4>
        <p class="extra-tiny text-zinc-600 m-0 italic">SUID: {{ person.id }}</p>
      </div>
      <div 
        class="resonance-tag d-flex flex-column align-items-center justify-content-center px-2 py-1 rounded bg-info text-black"
        title="Resonance Score"
      >
        <span class="extra-tiny font-black leading-none">R_SCORE</span>
        <span class="tiny font-black">{{ person.resonanceScore?.toFixed(2) || '0.00' }}</span>
      </div>
    </div>

    <!-- CoinX Balances -->
    <div class="balance-stack space-y-2">
      <div 
        v-for="balance in balances" 
        :key="balance.coin.id" 
        class="coin-entry p-2 border border-zinc-900 rounded bg-black transition-all hover-border-info"
      >
        <div class="d-flex justify-content-between align-items-start mb-1">
          <span class="tiny text-white font-black uppercase">{{ balance.coin.name }}</span>
          <span class="extra-tiny text-zinc-500 font-mono">{{ balance.coin.symbol }}</span>
        </div>
        
        <div class="d-flex justify-content-between align-items-end">
          <div class="base-equity">
            <p class="small text-info font-black mb-0">{{ balance.amount.toFixed(2) }}</p>
            <p class="extra-tiny text-zinc-600 uppercase mb-0">Base_Equity</p>
          </div>
          
          <div class="resonant-pulse text-end">
            <p class="small text-success font-black mb-0">
              {{ calculateResonant(balance.amount).toFixed(2) }}
            </p>
            <p class="extra-tiny text-zinc-600 uppercase mb-0">Pulse_{{ nodeMultiplier }}x</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Telemetry -->
    <div class="footer-telemetry mt-3 pt-2 border-t border-zinc-900 d-flex justify-content-between align-items-center">
      <span class="extra-tiny text-zinc-500 uppercase">System_Status: </span>
      <span 
        class="extra-tiny font-black italic"
        :class="person.status === 'GROUNDED' ? 'text-success' : 'text-warning'"
      >{{ person.status }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Person } from './personModel';
import type { CoinX } from './coinxModel';
import { treasury } from './treasury';

interface CoinBalance {
  coin: CoinX;
  amount: number;
}

const props = defineProps<{
  person: Person;
  balances: CoinBalance[];
  multiplier?: number;
}>();

/**
 * Default node multiplier is 1.1x (Maintenance Boost) if not specified.
 */
const nodeMultiplier = computed(() => props.multiplier || 1.1);

/**
 * Calculates the value of the balance relative to the node's current harmonic multiplier.
 */
const calculateResonant = (amount: number) => {
  return treasury.calculateResonantValue(amount, nodeMultiplier.value);
};
</script>

<style scoped>
.hover-border-info:hover {
  border-color: #00e5ff !important;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);
}
.leading-none { line-height: 1; }
</style>
