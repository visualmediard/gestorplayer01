import { FrequencySettings } from '../types/content';
declare class FrequencyService {
    private static instance;
    private settings;
    private dailyStats;
    static getInstance(): FrequencyService;
    constructor();
    private loadSettings;
    private saveSettings;
    private cleanupOldStats;
    setFrequencyLimit(contentId: string, limit: number, isUnlimited?: boolean): void;
    canPlayContent(contentId: string): boolean;
    recordPlayback(contentId: string): void;
    getContentStats(contentId: string): {
        count: number;
        limit: number;
        isUnlimited: boolean;
        remainingPlays: number;
    };
    getAllStats(): {
        [contentId: string]: {
            count: number;
            limit: number;
            isUnlimited: boolean;
            remainingPlays: number;
        };
    };
    resetDailyStats(): void;
    removeContent(contentId: string): void;
    getFrequencySettings(): FrequencySettings;
    updateFrequencySettings(settings: FrequencySettings): void;
    exportSettings(): string;
    importSettings(data: string): boolean;
}
export default FrequencyService;
