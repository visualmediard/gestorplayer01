import React, { useState, useRef, useEffect } from 'react';
import { Zone, CanvasSettings, Program, Content, MediaContent } from '../types/content';
import { Plus, Grid, Settings, Upload, X, ChevronUp, ChevronDown, Image, Video, FileText, ArrowLeft, Infinity, RotateCcw } from 'lucide-react';
import { generateId } from '../lib/utils';
import { RepetitionService } from '../services/repetitionService';
import { RepetitionConfigDialog } from './RepetitionConfigDialog';
import { StorageService } from '../services/storageService';
import ReproductionStatsService from '../services/reproductionStatsService';

interface CanvasEditorProps {
  program: Program;
  onUpdateProgram: (program: Program) => void;
  onClose: () => void;
  viewOnly?: boolean;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ program, onUpdateProgram, onClose, viewOnly = false }) => {
  const [zones, setZones] = useState<Zone[]>(program.zones || []);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [settings, setSettings] = useState<CanvasSettings>({
    gridSize: 20,
    showGrid: true,
    snapToGrid: true,
    showRulers: false,
    zoom: 1
  });

  // Estados para el formulario manual
  const [manualZone, setManualZone] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    name: ''
  });

  // Estados para gestión de contenido
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentContentIndex, setCurrentContentIndex] = useState<{ [zoneId: string]: number }>({});
  const [isPlaying, setIsPlaying] = useState<{ [zoneId: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para repeticiones
  const [repetitionDialogOpen, setRepetitionDialogOpen] = useState(false);
  const [selectedContentForRepetition, setSelectedContentForRepetition] = useState<MediaContent | null>(null);
  const repetitionService = RepetitionService.getInstance();
  const storageService = StorageService.getInstance();
  const reproductionStatsService = ReproductionStatsService.getInstance();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const [showBack, setShowBack] = useState(false);

  // Efecto para rotación automática de contenidos en loop
  useEffect(() => {
    const interval = setInterval(() => {
      zones.forEach(zone => {
        if (zone.content.length > 1) {
          // Filtrar contenidos disponibles para reproducir hoy
          const availableContent = zone.content.filter(content => 
            repetitionService.canPlayToday(content.id)
          );
          
          if (availableContent.length > 0) {
            const currentIndex = currentContentIndex[zone.id] || 0;
            const nextIndex = (currentIndex + 1) % availableContent.length;
            
            // Manejar transición suave
            handleContentTransition(zone.id);
            
            // Cambiar al siguiente contenido
            setCurrentContentIndex(prev => ({
              ...prev,
              [zone.id]: nextIndex
            }));
            
            // Registrar la reproducción del nuevo contenido
            const nextContent = availableContent[nextIndex];
            if (nextContent && isPlaying[zone.id]) {
              // Registrar en sistema de repeticiones
              repetitionService.recordPlayback(nextContent.id);
              
              // Registrar en estadísticas de reproducción (solo para imagen y video)
              if (nextContent.type === 'image' || nextContent.type === 'video') {
                reproductionStatsService.recordReproduction(
                  nextContent.id,
                  nextContent.name,
                  nextContent.type,
                  program.id,
                  program.name,
                  nextContent.type === 'video' ? 15 : 8
                );
              }
              
              console.log(`🔄 Loop - Reproducción registrada: ${nextContent.name} (ID: ${nextContent.id})`);
            }
          }
        }
      });
    }, 8000); // Cambia cada 8 segundos para dar más tiempo de visualización

    return () => clearInterval(interval);
  }, [zones, currentContentIndex, isPlaying, repetitionService, reproductionStatsService, program.id, program.name]);

  // Auto-reproducir videos cuando se carga contenido
  useEffect(() => {
    zones.forEach(zone => {
      if (zone.content.length > 0) {
        setIsPlaying(prev => ({
          ...prev,
          [zone.id]: true
        }));
        
        // Reiniciar el índice si es necesario
        if (currentContentIndex[zone.id] === undefined && zone.content.length > 0) {
          setCurrentContentIndex(prev => ({
            ...prev,
            [zone.id]: 0
          }));
          
          // Registrar la reproducción inicial del primer contenido
          const availableContent = zone.content.filter(content => 
            repetitionService.canPlayToday(content.id)
          );
          if (availableContent.length > 0) {
            const firstContent = availableContent[0];
            
            // Registrar en sistema de repeticiones
            repetitionService.recordPlayback(firstContent.id);
            
            // Registrar en estadísticas de reproducción (solo para imagen y video)
            if (firstContent.type === 'image' || firstContent.type === 'video') {
              reproductionStatsService.recordReproduction(
                firstContent.id,
                firstContent.name,
                firstContent.type,
                program.id,
                program.name,
                firstContent.type === 'video' ? 15 : 8
              );
            }
            
            console.log(`🎬 Reproducción inicial registrada: ${firstContent.name} (ID: ${firstContent.id})`);
          }
        }
      }
    });
  }, [zones, currentContentIndex, repetitionService, reproductionStatsService, program.id, program.name]);

  // Efecto para manejar el autoplay cuando cambia el contenido actual
  useEffect(() => {
    zones.forEach(zone => {
      const currentContent = getCurrentContent(zone);
      if (currentContent?.type === 'video') {
        // Intentar reproducir videos automáticamente
        setTimeout(() => {
          const videoElement = document.querySelector(`video[key="${zone.id}-${currentContent.id}"]`) as HTMLVideoElement;
          if (videoElement && isPlaying[zone.id]) {
            videoElement.play().catch(() => {
              console.log(`Autoplay bloqueado para video en zona ${zone.name}`);
            });
          }
        }, 100);
      }
    });
  }, [currentContentIndex, zones, isPlaying]);

  // Efecto para escuchar cambios de sincronización
  useEffect(() => {
    const handleSyncChange = () => {
      console.log('🔄 Cambios detectados en sincronización, actualizando interfaz...');
      // Forzar re-renderizado del componente
      setCurrentContentIndex(prev => ({ ...prev }));
    };

    // Suscribirse a cambios de sincronización
    repetitionService.onSyncChange(handleSyncChange);

    // Limpiar suscripción al desmontar
    return () => {
      repetitionService.removeSyncCallback(handleSyncChange);
    };
  }, [repetitionService]);

  // Función para obtener el contenido actual de una zona
  const getCurrentContent = (zone: Zone) => {
    if (zone.content.length === 0) return null;
    
    // Filtrar contenidos disponibles para reproducir hoy
    const availableContent = zone.content.filter(content => 
      repetitionService.canPlayToday(content.id)
    );
    
    if (availableContent.length === 0) {
      // Si no hay contenido disponible, NO mostrar nada
      console.log(`🚫 Zona ${zone.name}: No hay contenido disponible para reproducir hoy`);
      return null;
    }
    
    const index = currentContentIndex[zone.id] || 0;
    const content = availableContent[index] || availableContent[0];
    
    return content;
  };

  // Función para manejar la transición entre contenidos
  const handleContentTransition = (zoneId: string) => {
    // Pausar videos cuando se cambia de contenido
    const videos = document.querySelectorAll(`video[key^="${zoneId}-"]`);
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement;
      videoElement.pause();
      videoElement.currentTime = 0;
    });

    // Reiniciar estado de reproducción
    setIsPlaying(prev => ({ ...prev, [zoneId]: true }));
  };

  // Ajustar el tamaño del canvas al contenedor
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const maxWidth = container.clientWidth - 40;
          const maxHeight = container.clientHeight - 200;
          
          const scale = Math.min(maxWidth / program.width, maxHeight / program.height, 1);
          setCanvasSize({
            width: program.width * scale,
            height: program.height * scale
          });
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [program.width, program.height]);

  // Función para crear una nueva zona
  const createZone = (x: number, y: number, width: number, height: number, name?: string) => {
    const newZone: Zone = {
      id: generateId(),
      name: name || `Zona ${zones.length + 1}`,
      x,
      y,
      width,
      height,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: '#2563eb',
      borderWidth: 2,
      content: [],
      isSelected: false,
      zIndex: zones.length
    };

    const updatedZones = [...zones, newZone];
    setZones(updatedZones);
    setSelectedZone(newZone);
    
    // Actualizar el programa
    const updatedProgram = {
      ...program,
      zones: updatedZones,
      content: updatedZones.reduce((sum, zone) => sum + zone.content.length, 0)
    };
    onUpdateProgram(updatedProgram);
  };

  // Crear zona manual
  const handleManualZoneCreate = () => {
    const { x, y, width, height, name } = manualZone;
    
    // Validaciones
    if (x < 0 || y < 0 || x + width > program.width || y + height > program.height) {
      alert('La zona debe estar dentro de los límites del canvas');
      return;
    }
    
    if (width <= 0 || height <= 0) {
      alert('El ancho y alto deben ser mayores que 0');
      return;
    }

    createZone(x, y, width, height, name || `Zona ${zones.length + 1}`);
    
    // Resetear formulario
    setManualZone({
      x: 0,
      y: 0,
      width: 200,
      height: 150,
      name: ''
    });
    setShowManualForm(false);
  };

  // Función para validar archivos
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/mov'];
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo no puede pesar más de 15MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de archivo no soportado. Use imágenes (JPEG, PNG, GIF, WebP) o videos (MP4, WebM, MOV)' };
    }
    
    return { isValid: true };
  };

  // Función para crear contenido desde archivo subido a Supabase Storage
  const createContentFromFile = (file: File, storageUrl: string, filePath: string): Content => {
    const isVideo = file.type.startsWith('video/');
    const contentId = generateId();
    
    // Asegurar que el contenido nuevo comience desde cero (limpiar cualquier dato previo)
    repetitionService.clearContentData(contentId);
    
    return {
      id: contentId,
      name: file.name,
      type: isVideo ? 'video' : 'image',
      url: storageUrl,
      duration: isVideo ? 30 : 10, // 30 segundos para video, 10 para imagen
      frequency: 1,
      originalFrequency: 1,
      remainingPlays: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalPlays: 0,
      filePath: filePath,
      isStorageFile: true
    };
  };

  // Manejar subida de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedZone) return;

    setIsUploadingContent(true);
    setUploadError(null);

    const newContent: Content[] = [];
    const errors: string[] = [];

    // Procesar archivos uno por uno
    for (const file of Array.from(files)) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        // Subir archivo a Supabase Storage
        const uploadResult = await storageService.uploadFile(file);
        
        if (uploadResult.success && uploadResult.url && uploadResult.path) {
          // Crear contenido con URL de Supabase Storage
          const content = createContentFromFile(file, uploadResult.url, uploadResult.path);
          newContent.push(content);
        } else {
          errors.push(`${file.name}: ${uploadResult.error || 'Error al subir archivo'}`);
        }
      } catch (error) {
        errors.push(`${file.name}: Error inesperado al subir`);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join('\n'));
    }

    if (newContent.length > 0) {
      const updatedZones = zones.map(zone => 
        zone.id === selectedZone.id 
          ? { ...zone, content: [...zone.content, ...newContent] }
          : zone
      );
      
      setZones(updatedZones);
      setSelectedZone(prev => prev ? { ...prev, content: [...prev.content, ...newContent] } : null);
      
      // Actualizar programa
      const updatedProgram = {
        ...program,
        zones: updatedZones,
        content: updatedZones.reduce((sum, zone) => sum + zone.content.length, 0),
        lastModified: new Date().toISOString()
      };
      onUpdateProgram(updatedProgram);
    }

    setIsUploadingContent(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar contenido
  const removeContent = async (contentId: string) => {
    if (!selectedZone) return;

    // Encontrar el contenido a eliminar
    const contentToRemove = selectedZone.content.find(c => c.id === contentId);
    
    // Si el archivo está en Supabase Storage, eliminarlo
    if (contentToRemove?.isStorageFile && contentToRemove.filePath) {
      try {
        await storageService.deleteFile(contentToRemove.filePath);
      } catch (error) {
        console.warn('Error al eliminar archivo del storage:', error);
        // Continuar con la eliminación del contenido aunque falle la eliminación del archivo
      }
    }

    // Limpiar datos de repetición para este contenido
    repetitionService.clearContentData(contentId);

    const updatedZones = zones.map(zone => 
      zone.id === selectedZone.id 
        ? { ...zone, content: zone.content.filter(c => c.id !== contentId) }
        : zone
    );
    
    setZones(updatedZones);
    setSelectedZone(prev => prev ? { ...prev, content: prev.content.filter(c => c.id !== contentId) } : null);
    
    // Reiniciar índice si es necesario
    const updatedZone = updatedZones.find(z => z.id === selectedZone.id);
    if (updatedZone && updatedZone.content.length > 0) {
      const currentIndex = currentContentIndex[selectedZone.id] || 0;
      if (currentIndex >= updatedZone.content.length) {
        setCurrentContentIndex(prev => ({
          ...prev,
          [selectedZone.id]: 0
        }));
      }
    } else {
      // Limpiar estados si no hay contenido
      setCurrentContentIndex(prev => {
        const newState = { ...prev };
        delete newState[selectedZone.id];
        return newState;
      });
      setIsPlaying(prev => {
        const newState = { ...prev };
        delete newState[selectedZone.id];
        return newState;
      });
    }
    
    // Actualizar programa
    const updatedProgram = {
      ...program,
      zones: updatedZones,
      content: updatedZones.reduce((sum, zone) => sum + zone.content.length, 0),
      lastModified: new Date().toISOString()
    };
    onUpdateProgram(updatedProgram);
  };

  // Reordenar contenido
  const moveContent = (contentId: string, direction: 'up' | 'down') => {
    if (!selectedZone) return;

    const currentIndex = selectedZone.content.findIndex(c => c.id === contentId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedZone.content.length) return;

    const newContent = [...selectedZone.content];
    [newContent[currentIndex], newContent[newIndex]] = [newContent[newIndex], newContent[currentIndex]];

    const updatedZones = zones.map(zone => 
      zone.id === selectedZone.id 
        ? { ...zone, content: newContent }
        : zone
    );
    
    setZones(updatedZones);
    setSelectedZone(prev => prev ? { ...prev, content: newContent } : null);
    
    // Actualizar programa
    const updatedProgram = {
      ...program,
      zones: updatedZones,
      content: updatedZones.reduce((sum, zone) => sum + zone.content.length, 0),
      lastModified: new Date().toISOString()
    };
    onUpdateProgram(updatedProgram);
  };

  // Función para obtener el icono según el tipo de contenido
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Funciones para manejar repeticiones
  const openRepetitionDialog = (content: Content) => {
    const mediaContent: MediaContent = {
      id: content.id,
      name: content.name,
      type: content.type as 'image' | 'video',
      file: null,
      url: content.url,
      size: 0,
      lastModified: Date.now(),
      dailyLimit: -1,
      isUnlimited: true,
      dailyCount: 0,
      lastPlayDate: new Date().toISOString().split('T')[0],
      isAvailableToday: true
    };
    
    setSelectedContentForRepetition(mediaContent);
    setRepetitionDialogOpen(true);
  };

  const closeRepetitionDialog = () => {
    setRepetitionDialogOpen(false);
    setSelectedContentForRepetition(null);
  };

  const getRepetitionInfo = (contentId: string) => {
    return repetitionService.getPlaybackInfo(contentId);
  };

  // Manejar click en el canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isCreatingZone) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scale = canvasSize.width / program.width;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (dragStart) {
      // Finalizar creación de zona
      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);
      const startX = Math.min(x, dragStart.x);
      const startY = Math.min(y, dragStart.y);

      if (width > 20 && height > 20) {
        createZone(startX, startY, width, height);
      }
      
      setDragStart(null);
      setIsCreatingZone(false);
    } else {
      // Iniciar creación de zona
      setDragStart({ x, y });
    }
  };

  // Manejar movimiento del mouse para preview de zona
  const handleMouseMove = (_e: React.MouseEvent) => {
    if (!isCreatingZone || !dragStart) return;
  };

  // Seleccionar zona
  const selectZone = (zone: Zone) => {
    const updatedZones = zones.map(z => ({ ...z, isSelected: z.id === zone.id }));
    setZones(updatedZones);
    setSelectedZone(zone);
  };

  // Eliminar zona seleccionada
  const deleteSelectedZone = () => {
    if (!selectedZone) return;

    const updatedZones = zones.filter(z => z.id !== selectedZone.id);
    setZones(updatedZones);
    setSelectedZone(null);

    // Limpiar estados de la zona eliminada
    setCurrentContentIndex(prev => {
      const newState = { ...prev };
      delete newState[selectedZone.id];
      return newState;
    });
    setIsPlaying(prev => {
      const newState = { ...prev };
      delete newState[selectedZone.id];
      return newState;
    });

    const updatedProgram = {
      ...program,
      zones: updatedZones,
      content: updatedZones.reduce((sum, zone) => sum + zone.content.length, 0)
    };
    onUpdateProgram(updatedProgram);
  };

  // Guardar cambios
  const saveChanges = () => {
    const updatedProgram = {
      ...program,
      zones,
      content: zones.reduce((sum, zone) => sum + zone.content.length, 0),
      lastModified: new Date().toISOString()
    };
    onUpdateProgram(updatedProgram);
    onClose();
  };

  const handleRepetitionSave = () => {};

  return (
    <div className={viewOnly ? '' : 'fixed inset-0 bg-corporate-smoke-white z-50 flex flex-col'} style={viewOnly ? {background: '#111', width: '100vw', height: '100vh'} : {}}>
      {/* Solo mostrar el botón de volver atrás y el canvas en viewOnly */}
      {viewOnly ? (
        <>
          {/* Área sensible para mostrar el botón */}
          <div
            style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, zIndex: 1000 }}
            onMouseEnter={() => setShowBack(true)}
            onMouseLeave={() => setShowBack(false)}
          >
            {showBack && (
              <button
                onClick={onClose}
                style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
          </div>
          {/* Canvas alineado en (0,0) */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: program.width, height: program.height, background: '#000' }}>
            <div
              ref={canvasRef}
              style={{ width: program.width, height: program.height, position: 'relative', overflow: 'hidden' }}
            >
              {zones.length === 0 ? (
                <div style={{ color: '#fff', fontSize: 32, textAlign: 'center', marginTop: 200 }}>
                  No hay zonas configuradas para este programa
                </div>
              ) : zones.every(z => z.content.length === 0) ? (
                <div style={{ color: '#fff', fontSize: 32, textAlign: 'center', marginTop: 200 }}>
                  No hay contenido para reproducir
                </div>
              ) : (
                zones.map((zone) => (
                  <div
                    key={zone.id}
                    style={{
                      position: 'absolute',
                      left: zone.x,
                      top: zone.y,
                      width: zone.width,
                      height: zone.height,
                      zIndex: zone.zIndex
                    }}
                  >
                    {zone.content.length > 0 ? (
                      (() => {
                        const currentContent = getCurrentContent(zone);
                        if (!currentContent) return null;
                        return currentContent.type === 'image' ? (
                          <img
                            src={currentContent.url}
                            alt={currentContent.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : currentContent.type === 'video' ? (
                          <video
                            key={`${zone.id}-${currentContent.id}`}
                            src={currentContent.url}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : null;
                      })()
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Header Corporativo */}
          <div className="gradient-corporate-primary py-6 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="glass-effect p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-white" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-white text-shadow">
                      Editor de Canvas
                    </h1>
                    <p className="text-corporate-light-blue">
                      {program.name} - {program.width} x {program.height} px
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={saveChanges}
                    className="bg-corporate-success-green hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 flex overflow-hidden">
            {/* Panel Principal */}
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsCreatingZone(!isCreatingZone)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCreatingZone
                          ? 'bg-corporate-dark-blue text-white'
                          : 'bg-white text-corporate-charcoal-gray border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crear Zona</span>
                    </button>

                    <button
                      onClick={() => setShowManualForm(!showManualForm)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        showManualForm
                          ? 'bg-corporate-dark-blue text-white'
                          : 'bg-white text-corporate-charcoal-gray border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Manual</span>
                    </button>
                    
                    {selectedZone && (
                      <button
                        onClick={deleteSelectedZone}
                        className="flex items-center space-x-2 px-4 py-2 bg-corporate-soft-red text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="glass-effect px-3 py-1 rounded-lg">
                      <span className="text-sm text-corporate-charcoal-gray">
                        {zones.length} zonas
                      </span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.showGrid 
                          ? 'bg-corporate-dark-blue text-white' 
                          : 'bg-white text-corporate-charcoal-gray border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulario Manual */}
              {showManualForm && (
                <div className="bg-gradient-to-r from-corporate-light-blue/20 to-corporate-light-blue/10 border-b border-gray-200 p-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-corporate-charcoal-gray mb-4">Crear Zona Manual</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                          Posición X
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={program.width}
                          value={manualZone.x}
                          onChange={(e) => setManualZone(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                          Posición Y
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={program.height}
                          value={manualZone.y}
                          onChange={(e) => setManualZone(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                          Ancho
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={program.width}
                          value={manualZone.width}
                          onChange={(e) => setManualZone(prev => ({ ...prev, width: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                          Alto
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={program.height}
                          value={manualZone.height}
                          onChange={(e) => setManualZone(prev => ({ ...prev, height: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={manualZone.name}
                          onChange={(e) => setManualZone(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent"
                          placeholder="Zona personalizada"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleManualZoneCreate}
                          className="w-full bg-corporate-dark-blue hover:bg-corporate-deep-blue text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Canvas Area */}
              <div className="flex-1 overflow-hidden relative bg-corporate-smoke-white">
                <div className="absolute inset-0 overflow-auto p-6">
                  <div className="flex items-center justify-center min-h-full">
                    <div
                      ref={canvasRef}
                      className="relative bg-white shadow-xl rounded-lg border border-gray-200"
                      style={{
                        width: canvasSize.width,
                        height: canvasSize.height,
                        backgroundImage: settings.showGrid 
                          ? `radial-gradient(circle, #ddd 1px, transparent 1px)`
                          : 'none',
                        backgroundSize: settings.showGrid 
                          ? `${settings.gridSize * (canvasSize.width / program.width)}px ${settings.gridSize * (canvasSize.height / program.height)}px`
                          : 'auto'
                      }}
                      onClick={handleCanvasClick}
                      onMouseMove={handleMouseMove}
                    >
                      {/* Zonas */}
                      {zones.map((zone) => (
                        <div
                          key={zone.id}
                          className="absolute overflow-hidden"
                          style={{
                            left: (zone.x * canvasSize.width) / program.width,
                            top: (zone.y * canvasSize.height) / program.height,
                            width: (zone.width * canvasSize.width) / program.width,
                            height: (zone.height * canvasSize.height) / program.height,
                            backgroundColor: zone.content.length > 0 ? 'transparent' : 'rgba(255, 255, 255, 0.8)',
                            border: zone.content.length > 0 ? 'none' : '2px solid hsl(195, 73%, 85%)',
                            borderRadius: '8px',
                            zIndex: zone.zIndex
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectZone(zone);
                          }}
                        >
                          {/* Contenido de la zona */}
                          {zone.content.length > 0 ? (
                            <div className="absolute inset-0 rounded-md overflow-hidden">
                              {(() => {
                                const currentContent = getCurrentContent(zone);
                                if (!currentContent) return null;
                                
                                return currentContent.type === 'image' ? (
                                  <img
                                    src={currentContent.url}
                                    alt={currentContent.name}
                                    className="w-full h-full object-cover transition-opacity duration-500"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : currentContent.type === 'video' ? (
                                  <video
                                    key={`${zone.id}-${currentContent.id}`}
                                    ref={(video) => {
                                      if (video) {
                                        video.onloadeddata = () => {
                                          // Auto-reproducir en loop
                                          video.play().catch(() => {
                                            // Si falla el autoplay, intentar sin sonido
                                            video.muted = true;
                                            video.play().catch(() => {
                                              console.log('No se pudo reproducir el video automáticamente');
                                            });
                                          });
                                        };
                                        
                                        // Manejar el fin del video para loop continuo
                                        video.onended = () => {
                                          video.currentTime = 0;
                                          video.play().catch(() => {
                                            console.log('Error al reiniciar el video');
                                          });
                                        };
                                      }
                                    }}
                                    src={currentContent.url}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    onError={(e) => {
                                      (e.target as HTMLVideoElement).style.display = 'none';
                                    }}
                                  />
                                ) : null;
                              })()}
                            </div>
                          ) : (
                            // Zona vacía
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-sm font-semibold text-corporate-charcoal-gray">{zone.name}</div>
                                <div className="text-xs text-corporate-charcoal-gray/70">
                                  {Math.round(zone.width)} x {Math.round(zone.height)}
                                </div>
                                <div className="text-xs text-corporate-charcoal-gray/50 mt-1">
                                  Sin contenido
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Preview de zona siendo creada */}
                      {isCreatingZone && dragStart && (
                        <div
                          className="absolute border-2 border-dashed border-corporate-dark-blue bg-corporate-dark-blue/10 rounded-lg pointer-events-none"
                          style={{
                            left: (dragStart.x * canvasSize.width) / program.width,
                            top: (dragStart.y * canvasSize.height) / program.height,
                            width: 100,
                            height: 100
                          }}
                        />
                      )}

                      {/* Preview de zona manual */}
                      {showManualForm && (
                        <div
                          className="absolute border-2 border-dashed border-corporate-dark-blue bg-corporate-dark-blue/10 rounded-lg pointer-events-none"
                          style={{
                            left: (manualZone.x * canvasSize.width) / program.width,
                            top: (manualZone.y * canvasSize.height) / program.height,
                            width: (manualZone.width * canvasSize.width) / program.width,
                            height: (manualZone.height * canvasSize.height) / program.height
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-semibold text-corporate-dark-blue">Preview</div>
                              <div className="text-xs text-corporate-charcoal-gray">
                                {manualZone.width} x {manualZone.height}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de Contenido - Lateral derecho */}
            {!viewOnly && selectedZone && (
              <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                {/* Header del panel */}
                <div className="bg-gradient-to-r from-corporate-dark-blue to-corporate-deep-blue p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Playlist de Zona</h3>
                      <p className="text-corporate-light-blue text-sm">{selectedZone.name}</p>
                    </div>
                    {selectedZone.content.length > 0 && (
                      <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">LOOP</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 glass-effect rounded-lg p-2">
                    <div className="text-xs text-white/90 flex items-center justify-between">
                      <span>{selectedZone.content.length} elementos • {selectedZone.content.reduce((sum, c) => sum + c.duration, 0)}s total</span>
                      {selectedZone.content.length > 1 && (
                        <span className="text-corporate-light-blue">
                          Actual: {((currentContentIndex[selectedZone.id] || 0) + 1)}/{selectedZone.content.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="p-4 bg-corporate-smoke-white border-b border-gray-200">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingContent}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-corporate-dark-blue text-white rounded-lg font-medium hover:bg-corporate-deep-blue transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{isUploadingContent ? 'Subiendo...' : 'Subir Contenido'}</span>
                  </button>
                  <p className="text-xs text-corporate-charcoal-gray mt-2 text-center">
                    Máximo 15MB • Imágenes y videos • Almacenamiento permanente
                  </p>
                </div>

                {/* Errores de subida */}
                {uploadError && (
                  <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">Error al subir:</p>
                        <p className="text-xs text-red-600 mt-1 whitespace-pre-line">{uploadError}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Cerrar
                    </button>
                  </div>
                )}

                {/* Lista de contenido */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {selectedZone.content.length === 0 ? (
                    <div className="p-8 text-center text-corporate-charcoal-gray">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm font-medium">No hay contenido</p>
                      <p className="text-xs mt-1">Sube archivos para comenzar</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {selectedZone.content.map((content, index) => {
                        const repetitionInfo = getRepetitionInfo(content.id);
                        
                        return (
                          <div
                            key={content.id}
                            className={`p-3 bg-white rounded-lg shadow-sm border transition-shadow ${
                              repetitionInfo.canPlay 
                                ? 'border-gray-200 hover:shadow-md' 
                                : 'border-orange-200 bg-orange-50/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 p-2 bg-corporate-light-blue/20 rounded-lg">
                                {getContentIcon(content.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-corporate-charcoal-gray truncate">
                                  {content.name}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs text-corporate-charcoal-gray/70">
                                    {content.type === 'video' ? 'Video' : 'Imagen'} • {content.duration}s
                                    {content.isStorageFile && (
                                      <span className="text-green-600 font-medium"> • ☁️ Storage</span>
                                    )}
                                  </p>
                                  {/* Indicador de repeticiones */}
                                  <div className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                                    repetitionInfo.isUnlimited 
                                      ? 'bg-blue-100 text-blue-700'
                                      : repetitionInfo.canPlay
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {repetitionInfo.isUnlimited ? (
                                      <>
                                        <Infinity className="w-3 h-3" />
                                        <span>Ilimitado</span>
                                      </>
                                    ) : (
                                      <>
                                        <RotateCcw className="w-3 h-3" />
                                        <span>{repetitionInfo.played}/{repetitionInfo.limit}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => openRepetitionDialog(content)}
                                  className="p-1 text-corporate-charcoal-gray hover:text-corporate-dark-blue transition-colors"
                                  title="Configurar repeticiones"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => moveContent(content.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-corporate-charcoal-gray hover:text-corporate-dark-blue disabled:opacity-30 transition-colors"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => moveContent(content.id, 'down')}
                                  disabled={index === selectedZone.content.length - 1}
                                  className="p-1 text-corporate-charcoal-gray hover:text-corporate-dark-blue disabled:opacity-30 transition-colors"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeContent(content.id)}
                                  className="p-1 text-corporate-soft-red hover:text-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Estado de repeticiones */}
                            {!repetitionInfo.canPlay && (
                              <div className="mt-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded flex items-center space-x-1">
                                <span>⚠️ Límite diario alcanzado</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dialog de configuración de repeticiones */}
          {repetitionDialogOpen && selectedContentForRepetition && (
            <RepetitionConfigDialog
              content={selectedContentForRepetition}
              isOpen={repetitionDialogOpen}
              onClose={closeRepetitionDialog}
              onSave={handleRepetitionSave}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CanvasEditor; 