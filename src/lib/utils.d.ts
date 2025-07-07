import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
export declare function generateId(): string;
export declare function formatDate(date: Date): string;
export declare function formatFileSize(bytes: number): string;
export declare function isValidImageFile(file: File): boolean;
export declare function isValidVideoFile(file: File): boolean;
export declare function getMediaDuration(file: File): Promise<number>;
