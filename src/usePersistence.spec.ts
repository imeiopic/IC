import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { usePersistence } from './usePersistence';
import { type OrderBond } from '../orderTakerModel';

describe('usePersistence', () => {
    const createBonds = (count: number, status: string = 'FULFILLED'): OrderBond[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: `bond-${i}`,
            status,
            payload: { description: 'test', items: [], totalValue: 0, currency: 'IO$' }
        } as unknown as OrderBond));
    };

    it('should return initial GHOST status for zero fulfilled bonds', () => {
        const assignedBonds = ref<OrderBond[]>([]);
        const { persistenceRank, persistenceScore, persistenceProgress, persistenceTooltip } = usePersistence(assignedBonds);

        expect(persistenceScore.value).toBe(0);
        expect(persistenceRank.value).toBe('GHOST');
        expect(persistenceProgress.value).toBe(0);
        expect(persistenceTooltip.value).toBe('1 bond remaining until INITIATE status.');
    });

    it('should transition to INITIATE at 1 fulfilled bond', () => {
        const assignedBonds = ref<OrderBond[]>(createBonds(1));
        const { persistenceRank, persistenceProgress, persistenceTooltip } = usePersistence(assignedBonds);

        expect(persistenceRank.value).toBe('INITIATE');
        expect(persistenceProgress.value).toBe(0); // ((1-1)/(10-1)) * 100
        expect(persistenceTooltip.value).toBe('9 bonds remaining until STABLE status.');
    });

    it('should calculate progress correctly within INITIATE range (1-9)', () => {
        const assignedBonds = ref<OrderBond[]>(createBonds(5));
        const { persistenceProgress } = usePersistence(assignedBonds);
        
        // ((5 - 1) / (10 - 1)) * 100 = 4/9 * 100 = 44.44...
        expect(persistenceProgress.value).toBeCloseTo(44.44, 1);
    });

    it('should transition to STABLE at 10 fulfilled bonds', () => {
        const assignedBonds = ref<OrderBond[]>(createBonds(10));
        const { persistenceRank, persistenceProgress, persistenceTooltip } = usePersistence(assignedBonds);

        expect(persistenceRank.value).toBe('STABLE');
        expect(persistenceProgress.value).toBe(0);
        expect(persistenceTooltip.value).toBe('15 bonds remaining until ARCHITECT status.');
    });

    it('should transition to ARCHITECT at 25 fulfilled bonds', () => {
        const assignedBonds = ref<OrderBond[]>(createBonds(25));
        const { persistenceRank, persistenceProgress, persistenceTooltip } = usePersistence(assignedBonds);

        expect(persistenceRank.value).toBe('ARCHITECT');
        expect(persistenceProgress.value).toBe(0);
        expect(persistenceTooltip.value).toBe('25 bonds remaining until ETERNAL status.');
    });

    it('should transition to ETERNAL and max progress at 50 fulfilled bonds', () => {
        const assignedBonds = ref<OrderBond[]>(createBonds(50));
        const { persistenceRank, persistenceProgress, persistenceTooltip } = usePersistence(assignedBonds);

        expect(persistenceRank.value).toBe('ETERNAL');
        expect(persistenceProgress.value).toBe(100);
        expect(persistenceTooltip.value).toBe('Maximum Persistence achieved: ETERNAL');
    });

    it('should reactively update when bonds are added', () => {
        const assignedBonds = ref<OrderBond[]>([]);
        const { persistenceRank, persistenceScore } = usePersistence(assignedBonds);

        expect(persistenceScore.value).toBe(0);
        expect(persistenceRank.value).toBe('GHOST');

        assignedBonds.value = createBonds(10);

        expect(persistenceScore.value).toBe(10);
        expect(persistenceRank.value).toBe('STABLE');
    });
});