/**
 * COINX_MODEL.TS | IOPIC.01 Framework
 * * Defines the economic token substrate within the VRE.
 */

export interface CoinX {
  id: string;
  name: string;
  symbol: string;
  description: string;
  value: number;
  status: 'STABLE' | 'VOLATILE' | 'SYNCING';
  metadata?: Record<string, any>;
}

export const exampleCoinX01: CoinX = {
  id: 'coin-0001',
  name: 'Iopic Standard',
  symbol: 'IO$',
  description: 'The primary unit of account within the Iopic World.',
  value: 1.0,
  status: 'STABLE',
  metadata: { type: 'RESONANCE_CURRENCY' },
};

export const exampleCoinX10: CoinX = {
  id: 'coin-0010',
  name: 'Equity Pulse',
  symbol: 'EQP',
  description: 'A higher-density token used for structural stabilization.',
  value: 10.0,
  status: 'SYNCING',
  metadata: { type: 'EQUITY_TOKEN' },
};