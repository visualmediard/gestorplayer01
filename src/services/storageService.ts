import { supabase } from '../config/supabase';

export class StorageService {
  private static instance: StorageService;
  private bucketName = 'gestorplayer-media';

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  constructor() {
    this.initializeBucket();
  }

  // Inicializar el bucket si no existe
  private async initializeBucket() {
    try {
      // Verificar si el bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Crear bucket público
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/*', 'video/*'],
          fileSizeLimit: 15 * 1024 * 1024 // 15MB
        });

        if (error) {
          console.error('Error creando bucket:', error);
        }
      }
    } catch (error) {
      console.error('Error inicializando bucket:', error);
    }
  }

  // Generar nombre único para archivo
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 50);
    
    return `${timestamp}_${randomId}_${sanitizedName}.${extension}`;
  }

  // Subir archivo a Supabase Storage
  async uploadFile(file: File): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
    try {
      const fileName = this.generateFileName(file);
      const filePath = `media/${fileName}`;

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir archivo'
      };
    }
  }

  // Eliminar archivo de Supabase Storage
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar archivo'
      };
    }
  }

  // Verificar si una URL es de Supabase Storage
  isSupabaseStorageUrl(url: string): boolean {
    return url.includes(this.bucketName) && url.includes('supabase');
  }

  // Extraer ruta del archivo desde la URL
  extractFilePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split(`${this.bucketName}/`);
      return urlParts.length > 1 ? urlParts[1] : null;
    } catch (error) {
      return null;
    }
  }

  // Obtener información del archivo
  async getFileInfo(filePath: string): Promise<{ size?: number; lastModified?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('media', { search: filePath });

      if (error) {
        return { error: error.message };
      }

      const fileInfo = data?.find(file => filePath.includes(file.name));
      return {
        size: fileInfo?.metadata?.size,
        lastModified: fileInfo?.updated_at
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Error obteniendo información del archivo'
      };
    }
  }

  // Limpiar archivos huérfanos (sin referencias en la base de datos)
  async cleanupOrphanedFiles(): Promise<{ deleted: number; errors: string[] }> {
    try {
      // Esta función podría implementarse para limpiar archivos no utilizados
      // Por ahora retorna valores por defecto
      return { deleted: 0, errors: [] };
    } catch (error) {
      return {
        deleted: 0,
        errors: [error instanceof Error ? error.message : 'Error en limpieza']
      };
    }
  }

  // Verificar si el servicio de storage está disponible
  async isStorageAvailable(): Promise<boolean> {
    try {
      const { data } = await supabase.storage.listBuckets();
      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Obtener estadísticas de uso del storage
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('media');

      if (error) {
        return { totalFiles: 0, totalSize: 0, error: error.message };
      }

      const totalFiles = data?.length || 0;
      const totalSize = data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

      return { totalFiles, totalSize };
    } catch (error) {
      return {
        totalFiles: 0,
        totalSize: 0,
        error: error instanceof Error ? error.message : 'Error obteniendo estadísticas'
      };
    }
  }
} 