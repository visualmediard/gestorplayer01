import { Program, Zone } from '../types/content';
import { RepetitionService } from './repetitionService';
import ReproductionStatsService from './reproductionStatsService';

export class GlobalPlaybackService {
  private static instance: GlobalPlaybackService;
  private programs: Program[] = [];
  private playbackIntervals: Map<string, NodeJS.Timeout> = new Map();
  private currentContentIndex: Map<string, number> = new Map();
  private isRunning: boolean = false;
  private playbackSpeed: number = 8000; // 8 segundos por defecto
  
  private repetitionService: RepetitionService;
  private reproductionStatsService: ReproductionStatsService;

  constructor() {
    this.repetitionService = RepetitionService.getInstance();
    this.reproductionStatsService = ReproductionStatsService.getInstance();
  }

  static getInstance(): GlobalPlaybackService {
    if (!GlobalPlaybackService.instance) {
      GlobalPlaybackService.instance = new GlobalPlaybackService();
    }
    return GlobalPlaybackService.instance;
  }

  // Inicializar el servicio con los programas disponibles
  initializeWithPrograms(programs: Program[]): void {
    this.programs = programs;
    console.log(`🎬 GlobalPlaybackService inicializado con ${programs.length} programa(s)`);
    
    if (programs.length > 0) {
      this.startGlobalPlayback();
    }
  }

  // Actualizar los programas cuando cambien
  updatePrograms(programs: Program[]): void {
    this.programs = programs;
    console.log(`📝 Programas actualizados: ${programs.length} programa(s)`);
    
    if (this.isRunning) {
      this.stopGlobalPlayback();
      this.startGlobalPlayback();
    }
  }

  // Iniciar reproducción global automática
  startGlobalPlayback(): void {
    if (this.isRunning) {
      console.log('⚠️ El servicio de reproducción ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando reproducción global automática en segundo plano');

    // Procesar cada programa
    this.programs.forEach(program => {
      if (program.zones && program.zones.length > 0) {
        this.startProgramPlayback(program);
      }
    });

    // Registrar reproducciones iniciales
    this.registerInitialPlaybacks();
  }

  // Detener reproducción global
  stopGlobalPlayback(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log('⏹️ Deteniendo reproducción global automática');

    // Limpiar todos los intervalos
    this.playbackIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.playbackIntervals.clear();
    this.currentContentIndex.clear();
  }

  // Iniciar reproducción de un programa específico
  private startProgramPlayback(program: Program): void {
    program.zones?.forEach(zone => {
      if (zone.content && zone.content.length > 0) {
        const zoneKey = `${program.id}-${zone.id}`;
        
        // Inicializar índice de contenido
        this.currentContentIndex.set(zoneKey, 0);
        
        // Crear intervalo de reproducción para esta zona
        const interval = setInterval(() => {
          this.advanceContent(program, zone);
        }, this.playbackSpeed);
        
        this.playbackIntervals.set(zoneKey, interval);
        
        console.log(`🎯 Zona "${zone.name}" del programa "${program.name}" iniciada en segundo plano`);
      }
    });
  }

  // Avanzar al siguiente contenido en una zona
  private advanceContent(program: Program, zone: Zone): void {
    const zoneKey = `${program.id}-${zone.id}`;
    
    // Filtrar contenido disponible para reproducir hoy
    const availableContent = zone.content.filter(content => 
      this.repetitionService.canPlayToday(content.id)
    );
    
    if (availableContent.length === 0) {
      console.log(`⏭️ No hay contenido disponible para reproducir en zona "${zone.name}"`);
      return;
    }

    // Obtener índice actual y avanzar
    const currentIndex = this.currentContentIndex.get(zoneKey) || 0;
    const nextIndex = (currentIndex + 1) % availableContent.length;
    this.currentContentIndex.set(zoneKey, nextIndex);

    // Obtener el contenido actual
    const currentContent = availableContent[nextIndex];
    
    if (currentContent) {
      // Registrar reproducción solo para imagen y video
      if (currentContent.type === 'image' || currentContent.type === 'video') {
        // IMPORTANTE: Registrar en sistema de repeticiones PRIMERO
        this.repetitionService.recordPlayback(currentContent.id);
        
        // Obtener el conteo actualizado del sistema de repeticiones
        const repetitionStats = this.repetitionService.getContentStats(currentContent.id);
        const reproductionsCount = repetitionStats ? repetitionStats.reproductionsToday : 1;
        
        // Sincronizar con estadísticas de reproducción usando el conteo exacto
        this.reproductionStatsService.syncReproductionCount(
          currentContent.id,
          currentContent.name,
          currentContent.type,
          program.id,
          program.name,
          reproductionsCount,
          currentContent.type === 'video' ? 15 : 8
        );
        
        console.log(`🔄 [SEGUNDO PLANO] Reproducción #${reproductionsCount} registrada: "${currentContent.name}" en "${zone.name}" (${program.name})`);
      }
    }
  }

  // Registrar reproducciones iniciales al iniciar
  private registerInitialPlaybacks(): void {
    console.log('🎬 Registrando reproducciones iniciales en segundo plano...');
    
    this.programs.forEach(program => {
      program.zones?.forEach(zone => {
        if (zone.content && zone.content.length > 0) {
          // Filtrar contenido disponible
          const availableContent = zone.content.filter(content => 
            this.repetitionService.canPlayToday(content.id)
          );
          
          if (availableContent.length > 0) {
            const firstContent = availableContent[0];
            
            if (firstContent.type === 'image' || firstContent.type === 'video') {
              // IMPORTANTE: Registrar en sistema de repeticiones PRIMERO
              this.repetitionService.recordPlayback(firstContent.id);
              
              // Obtener el conteo actualizado del sistema de repeticiones
              const repetitionStats = this.repetitionService.getContentStats(firstContent.id);
              const reproductionsCount = repetitionStats ? repetitionStats.reproductionsToday : 1;
              
              // Sincronizar con estadísticas de reproducción usando el conteo exacto
              this.reproductionStatsService.syncReproductionCount(
                firstContent.id,
                firstContent.name,
                firstContent.type,
                program.id,
                program.name,
                reproductionsCount,
                firstContent.type === 'video' ? 15 : 8
              );
              
              console.log(`🎯 [SEGUNDO PLANO] Reproducción inicial #${reproductionsCount}: "${firstContent.name}" en "${zone.name}" (${program.name})`);
            }
          }
        }
      });
    });
  }

  // Cambiar velocidad de reproducción
  setPlaybackSpeed(milliseconds: number): void {
    this.playbackSpeed = milliseconds;
    console.log(`⚡ Velocidad de reproducción cambiada a ${milliseconds}ms`);
    
    // Reiniciar si está corriendo
    if (this.isRunning) {
      this.stopGlobalPlayback();
      this.startGlobalPlayback();
    }
  }

  // Obtener estado actual
  getStatus(): {
    isRunning: boolean;
    activePrograms: number;
    activeZones: number;
    playbackSpeed: number;
    totalContent: number;
  } {
    const totalContent = this.programs.reduce((sum, program) => {
      return sum + (program.zones?.reduce((zoneSum, zone) => zoneSum + (zone.content?.length || 0), 0) || 0);
    }, 0);

    return {
      isRunning: this.isRunning,
      activePrograms: this.programs.length,
      activeZones: this.playbackIntervals.size,
      playbackSpeed: this.playbackSpeed,
      totalContent
    };
  }

  // Obtener estadísticas de reproducción actual
  getCurrentPlaybackStats(): {
    [programId: string]: {
      programName: string;
      zones: {
        [zoneId: string]: {
          zoneName: string;
          currentContent: string;
          totalContent: number;
          availableContent: number;
        }
      }
    }
  } {
    const stats: any = {};
    
    this.programs.forEach(program => {
      if (program.zones && program.zones.length > 0) {
        stats[program.id] = {
          programName: program.name,
          zones: {}
        };
        
        program.zones.forEach(zone => {
          const zoneKey = `${program.id}-${zone.id}`;
          const currentIndex = this.currentContentIndex.get(zoneKey) || 0;
          
          const availableContent = zone.content?.filter(content => 
            this.repetitionService.canPlayToday(content.id)
          ) || [];
          
          const currentContent = availableContent[currentIndex];
          
          stats[program.id].zones[zone.id] = {
            zoneName: zone.name,
            currentContent: currentContent?.name || 'Sin contenido',
            totalContent: zone.content?.length || 0,
            availableContent: availableContent.length
          };
        });
      }
    });
    
    return stats;
  }

  // Forzar avance manual de contenido
  forceAdvanceContent(programId: string, zoneId: string): void {
    const program = this.programs.find(p => p.id === programId);
    const zone = program?.zones?.find(z => z.id === zoneId);
    
    if (program && zone) {
      this.advanceContent(program, zone);
      console.log(`⏭️ Contenido avanzado manualmente en zona "${zone.name}"`);
    }
  }
}

// Hacer disponible globalmente para debugging
declare global {
  interface Window {
    globalPlayback: GlobalPlaybackService;
  }
}

// Crear instancia global
const globalPlaybackService = GlobalPlaybackService.getInstance();
window.globalPlayback = globalPlaybackService;

export default globalPlaybackService; 