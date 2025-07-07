import { Program } from '../types/content';
declare class ProgramStorageService {
    private static instance;
    private constructor();
    static getInstance(): ProgramStorageService;
    loadPrograms(): Program[];
    savePrograms(programs: Program[]): void;
    saveProgram(program: Program, programs: Program[]): Program[];
    deleteProgram(programId: string, programs: Program[]): Program[];
    clearPrograms(): void;
    exportData(): string;
    importData(jsonData: string): boolean;
    downloadBackup(): void;
    getStorageInfo(): {
        totalPrograms: number;
        storageSize: string;
        lastModified: string;
    };
}
export default ProgramStorageService;
