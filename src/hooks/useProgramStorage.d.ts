import { Program } from '../types/content';
export declare const useProgramStorage: () => {
    programs: Program[];
    isLoading: boolean;
    isLoaded: boolean;
    updatePrograms: (newPrograms: Program[] | ((prev: Program[]) => Program[])) => void;
    addProgram: (program: Program) => void;
    updateProgram: (updatedProgram: Program) => void;
    deleteProgram: (programId: string) => void;
    clearAllPrograms: () => void;
    exportData: () => string;
    importData: (jsonData: string) => boolean;
    downloadBackup: () => void;
    getStorageInfo: () => {
        totalPrograms: number;
        storageSize: string;
        lastModified: string;
    };
};
