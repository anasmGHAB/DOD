export interface ScanResult {
    id: string;
    type: 'cookies' | 'datalayer' | 'ga4';
    timestamp: string;
    url: string;
    data: any;
}

const STORAGE_KEYS = {
    COOKIES: 'dod_cookies_scan',
    DATALAYER: 'dod_datalayer_scan',
    GA4: 'dod_ga4_scan',
    ALL_SCANS: 'dod_all_scans',
};

// Save a scan result
export function saveScan(type: ScanResult['type'], url: string, data: any) {
    const scan: ScanResult = {
        id: `${type}_${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        url,
        data,
    };

    // Save to specific type key
    const typeKey = type === 'cookies' ? STORAGE_KEYS.COOKIES
        : type === 'datalayer' ? STORAGE_KEYS.DATALAYER
            : STORAGE_KEYS.GA4;

    localStorage.setItem(typeKey, JSON.stringify(scan));

    // Add to all scans history
    const allScans = getAllScans();
    allScans.push(scan);
    localStorage.setItem(STORAGE_KEYS.ALL_SCANS, JSON.stringify(allScans));

    return scan;
}

// Get a specific scan type
export function getScan(type: ScanResult['type']): ScanResult | null {
    const typeKey = type === 'cookies' ? STORAGE_KEYS.COOKIES
        : type === 'datalayer' ? STORAGE_KEYS.DATALAYER
            : STORAGE_KEYS.GA4;

    const data = localStorage.getItem(typeKey);
    return data ? JSON.parse(data) : null;
}

// Get all scans
export function getAllScans(): ScanResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_SCANS);
    return data ? JSON.parse(data) : [];
}

// Clear a specific scan type
export function clearScan(type: ScanResult['type']) {
    const typeKey = type === 'cookies' ? STORAGE_KEYS.COOKIES
        : type === 'datalayer' ? STORAGE_KEYS.DATALAYER
            : STORAGE_KEYS.GA4;

    localStorage.removeItem(typeKey);

    // Remove from all scans history
    const allScans = getAllScans().filter(scan => scan.type !== type);
    localStorage.setItem(STORAGE_KEYS.ALL_SCANS, JSON.stringify(allScans));
}

// Get scans in date range
export function getScansInDateRange(startDate: Date, endDate: Date): ScanResult[] {
    const allScans = getAllScans();
    return allScans.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate >= startDate && scanDate <= endDate;
    });
}

// Clear all scans
export function clearAllScans() {
    localStorage.removeItem(STORAGE_KEYS.COOKIES);
    localStorage.removeItem(STORAGE_KEYS.DATALAYER);
    localStorage.removeItem(STORAGE_KEYS.GA4);
    localStorage.removeItem(STORAGE_KEYS.ALL_SCANS);
}
