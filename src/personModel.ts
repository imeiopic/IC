// Person model for Iopic World
import type { CoinX } from './coinxModel';
import { exampleCoinX01 } from './coinxModel';

export interface IOWBAccount {
  accountNumber: string;
  balance: number; // IO$ dollars
}

export interface RealWorldBankAccount {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType?: string;
  country?: string;
}

export interface PaymentMethod {
  type: 'CashApp' | 'PayPal' | 'Other';
  label: string;
  details: string;
}

export interface Person {
  id: string; // Unique identifier, e.g. '01'
  name: string;
  description: string;
  avatar: string;
  language: string;
  currency: string;
  coinxs: CoinX[];
  vcard: string;
  dob: string; // Date of birth (ISO format)
  doe: string; // Date of entry into Iopic World (ISO format)
  iowb: IOWBAccount;
  realWorldBank?: RealWorldBankAccount;
  paymentMethods?: PaymentMethod[];
}

// Ime Iopic: Person 01 (model for others)
// Example IOWB account for person01
const iowb01: IOWBAccount = {
  accountNumber: 'IOWB-0001',
  balance: 0,
};

export const person01: Person = {
  id: '01',
  name: 'Ime Iopic',
  description: 'Founder of Iopic World. The model for all people objects.',
  avatar: '/src/assets/images/profile.png', // Update path if needed
  language: 'English',
  currency: 'USD',
  coinxs: [exampleCoinX01],
  vcard: 'BEGIN:VCARD\nFN:Ime Iopic\nORG:Iopic World\nEMAIL:ime@iopic.world\nEND:VCARD',
  dob: '1980-01-01', // Example date of birth
  doe: '2026-03-27', // Example date of entry into Iopic World
  iowb: iowb01,
  realWorldBank: {
    bankName: 'Bank of America',
    accountNumber: '1234567890',
    routingNumber: '026009593',
    accountType: 'Checking',
    country: 'USA',
  },
  paymentMethods: [
    { type: 'CashApp', label: 'CashApp', details: '$imeiopic' },
    { type: 'PayPal', label: 'PayPal', details: 'paypal.me/imeiopic' },
    { type: 'Other', label: 'Venmo', details: '@imeiopic' },
  ],
};
