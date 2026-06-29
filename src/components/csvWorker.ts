/**
 * IOPIC CSV Substrate Worker
 * Handles background transmutation of stats data to CSV.
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

self.onmessage = (e: MessageEvent) => {
    const { stats, totalCount, totalBytes } = e.data;
    const totalRows = stats.length;
    const rows: string[] = [];

    const headers = ['Date', 'Transmissions', 'Volume'];
    rows.push(headers.join(','));

    for (let i = 0; i < totalRows; i++) {
        const s = stats[i];
        rows.push([s.id, s.count || 0, formatBytes(s.totalByteSize || 0)].join(','));

        // Report progress periodically to avoid saturating the event loop
        if (i > 0 && (i % 2000 === 0 || i === totalRows - 1)) {
            self.postMessage({ 
                type: 'PROGRESS', 
                value: Math.round(((i + 1) / totalRows) * 100) 
            });
        }
    }

    const summaryRow = ['TOTAL', totalCount, formatBytes(totalBytes)].join(',');
    rows.push(summaryRow);

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    self.postMessage({ type: 'DONE', blob });
};