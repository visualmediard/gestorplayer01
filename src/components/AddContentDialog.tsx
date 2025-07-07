import React, { useState, useCallback, useRef } from 'react';
import { Content } from '../types/content';
import { useToast } from '../hooks/use-toast';
import { generateId } from '../lib/utils';
import { StorageService } from '../services/storageService';
import {
  X,
  Upload,
  File,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  Cloud
} from 'lucide-react';

interface AddContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: Content) => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  isValid: boolean;
  error?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

const SUPPORTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/mov'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
  text: ['text/plain', 'text/html', 'text/css', 'text/javascript']
};

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB - coincide con el límite de Supabase

function AddContentDialog({ isOpen, onClose, onAddContent }: AddContentDialogProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccessToast, showErrorToast } = useToast();
  const storageService = StorageService.getInstance();

  // Validar tipo de archivo
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string; type?: 'image' | 'video' | 'audio' | 'text' } => {
    // Verificar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: 'El archivo es demasiado grande (máximo 15MB)' };
    }

    // Verificar tipo
    let detectedType: 'image' | 'video' | 'audio' | 'text' | null = null;
    
    for (const [type, mimeTypes] of Object.entries(SUPPORTED_TYPES)) {
      if (mimeTypes.includes(file.type)) {
        detectedType = type as 'image' | 'video' | 'audio' | 'text';
        break;
      }
    }

    if (!detectedType) {
      return { isValid: false, error: 'Tipo de archivo no soportado' };
    }

    return { isValid: true, type: detectedType };
  }, []);

  // Crear preview del archivo
  const createPreview = useCallback((file: File, type: string): Promise<string> => {
    return new Promise((resolve) => {
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(''); // Para videos y otros tipos, no generamos preview por ahora
      }
    });
  }, []);

  // Procesar archivos
  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      let preview = '';
      if (validation.isValid && validation.type === 'image') {
        preview = await createPreview(file, validation.type);
      }

      newFiles.push({
        file,
        preview,
        id: generateId(),
        type: validation.type || 'text',
        isValid: validation.isValid,
        error: validation.error,
        isUploading: false,
        uploadProgress: 0
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [validateFile, createPreview]);

  // Manejar drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  }, [processFiles]);

  // Eliminar archivo
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Obtener icono por tipo
  const getFileIcon = (type: string, isValid: boolean) => {
    const iconClass = `w-8 h-8 ${isValid ? 'text-corporate-dark-blue' : 'text-gray-400'}`;
    
    switch (type) {
      case 'image':
        return <ImageIcon className={iconClass} />;
      case 'video':
        return <VideoIcon className={iconClass} />;
      case 'audio':
        return <Music className={iconClass} />;
      case 'text':
        return <FileText className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Añadir contenido
  const handleAddContent = useCallback(async () => {
    const validFiles = files.filter(f => f.isValid);
    
    if (validFiles.length === 0) {
      showErrorToast('No hay archivos válidos para añadir');
      return;
    }

    setIsUploading(true);

    try {
      const successfulUploads: Content[] = [];
      
      for (const fileData of validFiles) {
        // Marcar archivo como subiendo
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, isUploading: true, uploadProgress: 0 }
            : f
        ));

        // Subir archivo a Supabase Storage
        const uploadResult = await storageService.uploadFile(fileData.file);
        
        if (uploadResult.success && uploadResult.url && uploadResult.path) {
          // Obtener duración estimada
          let duration = 10; // Duración por defecto
          if (fileData.type === 'video') {
            duration = 30; // Videos más largos
          } else if (fileData.type === 'image') {
            duration = 8; // Imágenes más cortas
          }

          const newContent: Content = {
            id: generateId(),
            name: fileData.file.name,
            type: fileData.type === 'image' ? 'image' : 'video',
            url: uploadResult.url,
            duration: duration,
            frequency: 1,
            originalFrequency: 1,
            remainingPlays: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            totalPlays: 0,
            // Campos de Supabase Storage
            filePath: uploadResult.path,
            isStorageFile: true
          };

          successfulUploads.push(newContent);
          
          // Marcar como completado
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, isUploading: false, uploadProgress: 100 }
              : f
          ));
        } else {
          showErrorToast(`Error subiendo ${fileData.file.name}: ${uploadResult.error}`);
          
          // Marcar como fallido
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, isUploading: false, error: uploadResult.error }
              : f
          ));
        }
      }

      // Añadir contenidos exitosos
      for (const content of successfulUploads) {
        onAddContent(content);
      }

      if (successfulUploads.length > 0) {
        showSuccessToast(`${successfulUploads.length} archivo(s) subido(s) a Supabase Storage`);
        setFiles([]);
        onClose();
      }
    } catch (error) {
      showErrorToast('Error al subir archivos');
    } finally {
      setIsUploading(false);
    }
  }, [files, onAddContent, showSuccessToast, showErrorToast, onClose, storageService]);

  // Añadir contenido de ejemplo
  const addSampleContent = useCallback(() => {
    const contentId = generateId();
    
    const sampleContent: Content = {
      id: contentId,
      name: `Contenido de ejemplo ${Date.now()}`,
      type: Math.random() > 0.5 ? 'image' : 'video',
      duration: Math.floor(Math.random() * 20) + 5,
      frequency: Math.floor(Math.random() * 5) + 1,
      originalFrequency: Math.floor(Math.random() * 5) + 1,
      remainingPlays: Math.floor(Math.random() * 5) + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalPlays: 0,
      isStorageFile: false
    };

    onAddContent(sampleContent);
    showSuccessToast(`Contenido de ejemplo añadido`);
  }, [onAddContent, showSuccessToast]);

  // Limpiar archivos al cerrar
  const handleClose = useCallback(() => {
    setFiles([]);
    setDragOver(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-corporate-dark-blue">
                Añadir Contenido
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Los archivos se subirán a Supabase Storage permanentemente
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-corporate-dark-blue bg-corporate-light-blue/10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              o haz clic para seleccionar archivos
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-corporate-dark-blue text-white px-6 py-2 rounded-lg hover:bg-corporate-deep-blue transition-colors flex items-center space-x-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Seleccionar Archivos</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Tipos de archivo soportados */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">
              <Cloud className="w-4 h-4 inline mr-2" />
              Tipos de archivo soportados:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-corporate-warm-yellow" />
                  <span className="font-medium">Imágenes</span>
                </div>
                <div className="text-gray-600 text-xs">
                  JPEG, PNG, GIF, WebP
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <VideoIcon className="w-4 h-4 text-corporate-dark-blue" />
                  <span className="font-medium">Videos</span>
                </div>
                <div className="text-gray-600 text-xs">
                  MP4, WebM, MOV
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
              <Cloud className="w-3 h-3" />
              <span>Tamaño máximo: 15MB por archivo • Almacenamiento permanente en Supabase</span>
            </div>
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Archivos seleccionados ({files.length})
              </h4>
              <div className="space-y-3">
                {files.map((fileData) => (
                  <div
                    key={fileData.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      fileData.isValid
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    {/* Preview o icono */}
                    <div className="flex-shrink-0">
                      {fileData.preview ? (
                        <img
                          src={fileData.preview}
                          alt={fileData.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(fileData.type, fileData.isValid)
                      )}
                    </div>

                    {/* Información del archivo */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {fileData.file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(fileData.file.size)} • {fileData.type.toUpperCase()}
                      </div>
                      {fileData.isUploading && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                          <Upload className="w-3 h-3" />
                          <span>Subiendo a Supabase Storage...</span>
                        </div>
                      )}
                      {fileData.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {fileData.error}
                        </div>
                      )}
                    </div>

                    {/* Estado y acciones */}
                    <div className="flex items-center space-x-2">
                      {fileData.isUploading ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : fileData.isValid ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <button
                        onClick={() => removeFile(fileData.id)}
                        disabled={fileData.isUploading}
                        className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de contenido de ejemplo */}
          <div className="mt-6 p-4 bg-corporate-warm-yellow/10 rounded-lg">
            <h4 className="font-medium text-corporate-dark-blue mb-2">
              ¿Quieres probar rápidamente?
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Añade contenido de ejemplo para probar las funcionalidades
            </p>
            <button
              onClick={addSampleContent}
              className="flex items-center space-x-2 bg-corporate-warm-yellow text-corporate-deep-blue px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Contenido de Ejemplo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>{files.filter(f => f.isValid).length} de {files.length} archivos válidos</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddContent}
                disabled={files.filter(f => f.isValid).length === 0 || isUploading}
                className="px-6 py-2 bg-corporate-dark-blue text-white rounded-lg hover:bg-corporate-deep-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Subir a Storage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddContentDialog; 