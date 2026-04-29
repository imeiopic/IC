import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRankHistory } from './useRankHistory';

describe('useRankHistory', () => {
  const RANK_HISTORY_KEY = 'io_rank_history';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with an empty array when localStorage is empty', () => {
    const { rankHistory } = useRankHistory();
    expect(rankHistory.value).toEqual([]);
  });

  it('should initialize with values persisted in the local substrate', () => {
    const mockData = [{ rank: 'INITIATE', timestamp: '2024-01-01T00:00:00.000Z' }];
    localStorage.setItem(RANK_HISTORY_KEY, JSON.stringify(mockData));
    
    const { rankHistory } = useRankHistory();
    expect(rankHistory.value).toEqual(mockData);
  });

  it('should add a new rank entry and persist it to localStorage', () => {
    const { rankHistory, addRankEntry } = useRankHistory();
    const rank = 'STABLE';
    
    addRankEntry(rank);
    
    expect(rankHistory.value[0].rank).toBe(rank);
    expect(rankHistory.value[0].timestamp).toBeDefined();
    
    const stored = JSON.parse(localStorage.getItem(RANK_HISTORY_KEY) || '[]');
    expect(stored[0].rank).toBe(rank);
  });

  it('should prepend new entries to maintain temporal logic (newest first)', () => {
    const { rankHistory, addRankEntry } = useRankHistory();
    
    addRankEntry('INITIATE');
    addRankEntry('STABLE');
    
    expect(rankHistory.value[0].rank).toBe('STABLE');
    expect(rankHistory.value[1].rank).toBe('INITIATE');
  });

  it('should limit history to MAX_RANK_HISTORY (50) entries to prevent logical drift', () => {
    const { rankHistory, addRankEntry } = useRankHistory();
    
    for (let i = 0; i < 60; i++) {
      addRankEntry(`RANK_${i}`);
    }
    
    expect(rankHistory.value.length).toBe(50);
    expect(rankHistory.value[0].rank).toBe('RANK_59');
    expect(rankHistory.value[49].rank).toBe('RANK_10');
  });

  it('should purge the history from the reactive state and substrate', () => {
    const { rankHistory, addRankEntry, clearHistory } = useRankHistory();
    
    addRankEntry('INITIATE');
    expect(rankHistory.value.length).toBe(1);
    
    clearHistory();
    
    expect(rankHistory.value).toEqual([]);
    expect(localStorage.getItem(RANK_HISTORY_KEY)).toBeNull();
  });
});