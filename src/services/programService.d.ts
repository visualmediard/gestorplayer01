import { Program } from '../types/content';
export declare class ProgramService {
    private static instance;
    private isSupabaseEnabled;
    private connectionChecked;
    static getInstance(): ProgramService;
    constructor();
    private initializeConnection;
    private checkSupabaseConnection;
    getPrograms(): Promise<Program[]>;
    createProgram(program: Program): Promise<{
        success: boolean;
        data?: Program;
        error?: string;
    }>;
    updateProgram(program: Program): Promise<{
        success: boolean;
        data?: Program;
        error?: string;
    }>;
    deleteProgram(programId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    private getLocalPrograms;
    private createLocalProgram;
    private updateLocalProgram;
    private deleteLocalProgram;
    private mapSupabaseToProgram;
    syncData(): Promise<void>;
    clearLocalData(): void;
    getStats(): Promise<{
        total: number;
        local: number;
        remote: number;
    }>;
}
