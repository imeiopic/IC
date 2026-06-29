import { describe, it, expect, beforeEach } from 'vitest';
import { Group } from '../Entity';

describe('Group Class (GCP Substrate)', () => {
  let group: Group;
  const TEST_ID = 'Alpha-Quadrant-7';

  beforeEach(() => {
    group = new Group(TEST_ID);
  });

  it('should initialize with default metabolic integrity and Schumann pulse', () => {
    expect(group.id).toBe(TEST_ID);
    expect(group.resonanceFidelity).toBe(1.0);
    expect(group.currentFrequency).toBe(7.83);
    expect(group.entropyIndex).toBe(0.0);
    expect(group.threadAlignment).toHaveLength(16);
    expect(group.threadAlignment.every(t => t === true)).toBe(true);
  });

  it('should evaluate phase-lock status correctly', () => {
    // Default state is locked
    expect(group.isPhaseLocked()).toBe(true);
    
    // High entropy breaks the lock
    group.entropyIndex = 0.2; 
    expect(group.isPhaseLocked()).toBe(false);
  });

  it('should calculate symmetry shunt according to the 1:16 Mandate', () => {
    group.localBaseline = 10;
    group.totalPulse = 100; // 10 * 16 = 160. 100 is within bounds.
    expect(group.calculateSymmetryShunt()).toBe(0);

    group.totalPulse = 200; // 200 - 160 = 40 excess for the Treasury.
    expect(group.calculateSymmetryShunt()).toBe(40);
  });

  it('should partition specific threads to isolate noise', () => {
    group.partitionThread(5);
    expect(group.threadAlignment[5]).toBe(false);
    expect(group.threadAlignment[0]).toBe(true); // Other threads remain aligned
  });

  it('should realign the internal bus and reset entropy', () => {
    group.resonanceFidelity = 0.5;
    group.entropyIndex = 0.8;
    group.threadAlignment.fill(false);
    
    group.realign();
    
    expect(group.resonanceFidelity).toBe(1.0);
    expect(group.entropyIndex).toBe(0.0);
    expect(group.threadAlignment.every(t => t === true)).toBe(true);
  });
});
