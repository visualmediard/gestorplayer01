export declare class RepetitionService {
    private static instance;
    private storageKey;
    static getInstance(): RepetitionService;
    private getCurrentDate;
    private loadRepetitionData;
    private saveRepetitionData;
    private getRepetitionData;
    private updateRepetitionData;
    setDailyLimit(contentId: string, limit: number, isUnlimited?: boolean): void;
    canPlayToday(contentId: string): boolean;
    recordPlayback(contentId: string): void;
    getPlaybackInfo(contentId: string): {
        played: number;
        limit: number;
        canPlay: boolean;
        isUnlimited: boolean;
    };
    getContentStats(contentId: string): {
        reproductionsToday: number;
        dailyLimit: number;
        isUnlimited: boolean;
    } | null;
    clearContentData(contentId: string): void;
    clearAllData(): void;
    getStats(): {
        totalContents: number;
        activeToday: number;
        completedToday: number;
    };
    getAllStats(): Array<{
        contentId: string;
        reproductionsToday: number;
        dailyLimit: number;
        lastPlayDate: string;
        canPlayToday: boolean;
        isUnlimited: boolean;
    }>;
    showDetailedStats(): void;
}
