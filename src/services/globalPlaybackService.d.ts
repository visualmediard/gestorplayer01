import { Program } from '../types/content';
export declare class GlobalPlaybackService {
    private static instance;
    private programs;
    private playbackIntervals;
    private currentContentIndex;
    private isRunning;
    private playbackSpeed;
    private repetitionService;
    private reproductionStatsService;
    constructor();
    static getInstance(): GlobalPlaybackService;
    initializeWithPrograms(programs: Program[]): void;
    updatePrograms(programs: Program[]): void;
    startGlobalPlayback(): void;
    stopGlobalPlayback(): void;
    private startProgramPlayback;
    private advanceContent;
    private registerInitialPlaybacks;
    setPlaybackSpeed(milliseconds: number): void;
    getStatus(): {
        isRunning: boolean;
        activePrograms: number;
        activeZones: number;
        playbackSpeed: number;
        totalContent: number;
    };
    getCurrentPlaybackStats(): {
        [programId: string]: {
            programName: string;
            zones: {
                [zoneId: string]: {
                    zoneName: string;
                    currentContent: string;
                    totalContent: number;
                    availableContent: number;
                };
            };
        };
    };
    forceAdvanceContent(programId: string, zoneId: string): void;
}
declare global {
    interface Window {
        globalPlayback: GlobalPlaybackService;
    }
}
declare const globalPlaybackService: GlobalPlaybackService;
export default globalPlaybackService;
