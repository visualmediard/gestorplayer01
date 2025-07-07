import { ReproductionStats, GlobalStats } from '../types/content';
declare class ReproductionStatsService {
    private static instance;
    private stats;
    private sessionStart;
    private autoSaveInterval;
    static getInstance(): ReproductionStatsService;
    constructor();
    private loadStats;
    private saveStats;
    private startAutoSave;
    recordReproduction(contentId: string, contentName: string, contentType: 'image' | 'video', programId: string, programName: string, duration?: number): void;
    syncReproductionCount(contentId: string, contentName: string, contentType: 'image' | 'video', programId: string, programName: string, exactCount: number, duration?: number): void;
    private calculateReproductionsPerMinute;
    getStats(): ReproductionStats;
    getAllStats(): Array<{
        contentId: string;
        contentName: string;
        contentType: 'image' | 'video';
        reproductions: number;
        lastReproduction: string;
        programId: string;
        programName: string;
        totalTime: number;
    }>;
    clearAllStats(): void;
    getGlobalStats(): GlobalStats;
    getTopContent(limit?: number): Array<{
        id: string;
        name: string;
        reproductions: number;
        type: 'image' | 'video';
    }>;
    getStatsByProgram(programId: string): ReproductionStats;
    getTotalReproductions(): number;
    getSessionDuration(): number;
    resetStats(): void;
    resetSessionStats(): void;
    exportStats(): string;
    importStats(data: string): boolean;
    destroy(): void;
    clearContentStats(contentId: string): void;
}
export default ReproductionStatsService;
