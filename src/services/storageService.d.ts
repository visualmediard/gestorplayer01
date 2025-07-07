export declare class StorageService {
    private static instance;
    private bucketName;
    static getInstance(): StorageService;
    constructor();
    private initializeBucket;
    private generateFileName;
    uploadFile(file: File): Promise<{
        success: boolean;
        url?: string;
        path?: string;
        error?: string;
    }>;
    deleteFile(filePath: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    isSupabaseStorageUrl(url: string): boolean;
    extractFilePathFromUrl(url: string): string | null;
    getFileInfo(filePath: string): Promise<{
        size?: number;
        lastModified?: string;
        error?: string;
    }>;
    cleanupOrphanedFiles(): Promise<{
        deleted: number;
        errors: string[];
    }>;
    isStorageAvailable(): Promise<boolean>;
    getStorageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        error?: string;
    }>;
}
