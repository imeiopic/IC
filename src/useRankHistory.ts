import { ref, toRaw } from 'vue';

export interface RankEntry {
    rank: string;
    timestamp: string;
}

const RANK_HISTORY_KEY = 'io_rank_history';
const MAX_RANK_HISTORY = 50;

/**
 * useRankHistory: Composable for managing and persisting identity rank transitions.
 */
export function useRankHistory() {
    const rankHistory = ref<RankEntry[]>(
        JSON.parse(localStorage.getItem(RANK_HISTORY_KEY) || '[]')
    );

    const addRankEntry = (rank: string) => {
        const newEntry: RankEntry = { 
            rank, 
            timestamp: new Date().toISOString() 
        };
        
        // Prepend and slice to maintain substrate stability (MAX_RANK_HISTORY)
        rankHistory.value = [newEntry, ...rankHistory.value].slice(0, MAX_RANK_HISTORY);
        
        // Use toRaw for more efficient serialization of non-reactive storage
        localStorage.setItem(RANK_HISTORY_KEY, JSON.stringify(toRaw(rankHistory.value)));
    };

    const clearHistory = () => {
        rankHistory.value = [];
        localStorage.removeItem(RANK_HISTORY_KEY);
    };

    return {
        rankHistory,
        addRankEntry,
        clearHistory
    };
}