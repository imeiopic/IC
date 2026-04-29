import { computed, type Ref } from 'vue';
import { type OrderBond } from '../orderTakerModel';

/**
 * usePersistence: Composable for calculating logic-gate thresholds and rank progression
 * based on fulfilled bonds in the IO fabric.
 */
export function usePersistence(assignedBonds: Ref<OrderBond[]>) {
    /**
     * Persistence Score (P): Derived from the total count of FULFILLED bonds.
     */
    const persistenceScore = computed(() => assignedBonds.value.filter(b => b.status === 'FULFILLED').length);

    /**
     * Persistence Rank: Categorical classification based on score thresholds.
     */
    const persistenceRank = computed(() => {
        const s = persistenceScore.value;
        if (s >= 50) return 'ETERNAL';
        if (s >= 25) return 'ARCHITECT';
        if (s >= 10) return 'STABLE';
        if (s >= 1) return 'INITIATE';
        return 'GHOST';
    });

    /**
     * Persistence Progress: Calculates percentage toward the next rank.
     */
    const persistenceProgress = computed(() => {
        const s = persistenceScore.value;
        if (s >= 50) return 100; // ETERNAL is maxed
        if (s >= 25) return ((s - 25) / (50 - 25)) * 100; // Progress toward ETERNAL
        if (s >= 10) return ((s - 10) / (25 - 10)) * 100; // Progress toward ARCHITECT
        if (s >= 1) return ((s - 1) / (10 - 1)) * 100;   // Progress toward STABLE
        return s > 0 ? 100 : 0; // Handle the step from GHOST to INITIATE
    });

    /**
     * Persistence Tooltip: Provides exact feedback on remaining bonds for the next rank.
     */
    const persistenceTooltip = computed(() => {
        const s = persistenceScore.value;
        if (s >= 50) return 'Maximum Persistence achieved: ETERNAL';

        let remaining = 0;
        let next = '';
        if (s >= 25) { remaining = 50 - s; next = 'ETERNAL'; }
        else if (s >= 10) { remaining = 25 - s; next = 'ARCHITECT'; }
        else if (s >= 1) { remaining = 10 - s; next = 'STABLE'; }
        else { remaining = 1 - s; next = 'INITIATE'; }

        return `${remaining} bond${remaining !== 1 ? 's' : ''} remaining until ${next} status.`;
    });

    return {
        persistenceScore,
        persistenceRank,
        persistenceProgress,
        persistenceTooltip
    };
}