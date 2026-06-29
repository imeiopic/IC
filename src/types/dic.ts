export interface DICPacket {
  id: string | number;
  timestamp: number;
  from: 'me' | 'them';
  text: string;
  lang: string;
  targetLang: string;
  translation: string;
  status: 'transmitting' | 'synced' | 'fractured';
}

export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'info';
  retryAction?: () => void;
}

/**
 * Type guard to validate whether an unknown object conforms to the DICPacket interface.
 * Essential for sanitizing incoming WebSocket data before processing.
 */
export function isDICPacket(data: unknown): data is DICPacket {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Partial<DICPacket>;

  return (
    (typeof p.id === 'string' || typeof p.id === 'number') &&
    typeof p.timestamp === 'number' &&
    (p.from === 'me' || p.from === 'them') &&
    typeof p.text === 'string' &&
    typeof p.lang === 'string' &&
    typeof p.targetLang === 'string' &&
    typeof p.translation === 'string' &&
    (p.status === 'transmitting' || p.status === 'synced' || p.status === 'fractured')
  );
}
