export declare class DebugStatsService {
    private static instance;
    private globalPlayback;
    private repetitionService;
    private reproductionStatsService;
    constructor();
    static getInstance(): DebugStatsService;
    showStats(): void;
    systemStatus(): void;
    simulatePlayback(): void;
    startMonitoring(): void;
    clearAllStats(): void;
    setPlaybackSpeed(seconds: number): void;
    forceAdvance(programId: string, zoneId: string): void;
    showCommands(): void;
}
declare global {
    interface Window {
        debugStats: DebugStatsService;
    }
}
declare const debugStatsService: DebugStatsService;
export default debugStatsService;
