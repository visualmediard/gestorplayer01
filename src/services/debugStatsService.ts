import { GlobalPlaybackService } from './globalPlaybackService';
import { RepetitionService } from './repetitionService';
import ReproductionStatsService from './reproductionStatsService';

export class DebugStatsService {
  private static instance: DebugStatsService;
  private globalPlayback: GlobalPlaybackService;
  private repetitionService: RepetitionService;
  private reproductionStatsService: ReproductionStatsService;

  constructor() {
    this.globalPlayback = GlobalPlaybackService.getInstance();
    this.repetitionService = RepetitionService.getInstance();
    this.reproductionStatsService = ReproductionStatsService.getInstance();
  }

  static getInstance(): DebugStatsService {
    if (!DebugStatsService.instance) {
      DebugStatsService.instance = new DebugStatsService();
    }
    return DebugStatsService.instance;
  }

  // Mostrar estadísticas completas del sistema
  showStats(): void {
    console.log('=== 📊 ESTADÍSTICAS DEL SISTEMA ===');
    
    // Estado del servicio global
    const globalStatus = this.globalPlayback.getStatus();
    console.log('\n🎬 Servicio Global de Reproducción:');
    console.log('- Estado:', globalStatus.isRunning ? '🟢 Activo' : '🔴 Detenido');
    console.log('- Programas activos:', globalStatus.activePrograms);
    console.log('- Zonas activas:', globalStatus.activeZones);
    console.log('- Total contenido:', globalStatus.totalContent);
    console.log('- Velocidad reproducción:', globalStatus.playbackSpeed + 'ms');
    
    // Estado de reproducción actual
    console.log('\n🎯 Estado de Reproducción Actual:');
    const playbackStats = this.globalPlayback.getCurrentPlaybackStats();
    Object.entries(playbackStats).forEach(([, programData]) => {
      console.log(`📋 Programa: ${programData.programName}`);
      Object.entries(programData.zones).forEach(([, zoneData]) => {
        console.log(`  📍 Zona: ${zoneData.zoneName}`);
        console.log(`    - Contenido actual: ${zoneData.currentContent}`);
        console.log(`    - Total contenido: ${zoneData.totalContent}`);
        console.log(`    - Contenido disponible: ${zoneData.availableContent}`);
      });
    });

    // Estadísticas de repetición
    console.log('\n🔄 Estadísticas de Repetición:');
    const repetitionStats = this.repetitionService.getAllStats();
    if (repetitionStats.length > 0) {
      repetitionStats.forEach(stat => {
        console.log(`📄 ${stat.contentId}:`);
        console.log(`  - Reproducciones hoy: ${stat.reproductionsToday}`);
        console.log(`  - Límite diario: ${stat.dailyLimit === -1 ? 'Ilimitado' : stat.dailyLimit}`);
        console.log(`  - Puede reproducir: ${stat.canPlayToday ? '✅' : '❌'}`);
      });
    } else {
      console.log('No hay datos de repetición disponibles');
    }

    // Estadísticas de reproducción
    console.log('\n📈 Estadísticas de Reproducción:');
    const reproductionStats = this.reproductionStatsService.getAllStats();
    if (reproductionStats.length > 0) {
      reproductionStats.forEach(stat => {
        console.log(`📄 ${stat.contentName}:`);
        console.log(`  - ID: ${stat.contentId}`);
        console.log(`  - Tipo: ${stat.contentType}`);
        console.log(`  - Reproducciones: ${stat.reproductions}`);
        console.log(`  - Última reproducción: ${stat.lastReproduction}`);
        console.log(`  - Tiempo total: ${stat.totalTime}s`);
      });
    } else {
      console.log('No hay datos de reproducción disponibles');
    }
  }

  // Mostrar estado resumido del sistema
  systemStatus(): void {
    const globalStatus = this.globalPlayback.getStatus();
    const repetitionStats = this.repetitionService.getAllStats();
    const reproductionStats = this.reproductionStatsService.getAllStats();

    console.log('=== 🔍 ESTADO RÁPIDO DEL SISTEMA ===');
    console.log(`🎬 Servicio Global: ${globalStatus.isRunning ? '🟢 Activo' : '🔴 Detenido'}`);
    console.log(`📋 Programas: ${globalStatus.activePrograms}`);
    console.log(`📍 Zonas: ${globalStatus.activeZones}`);
    console.log(`📄 Contenido: ${globalStatus.totalContent}`);
    console.log(`🔄 Registros repetición: ${repetitionStats.length}`);
    console.log(`📈 Registros reproducción: ${reproductionStats.length}`);
    console.log(`⏱️ Velocidad: ${globalStatus.playbackSpeed}ms`);
  }

  // Simular una reproducción para testing
  simulatePlayback(): void {
    console.log('🧪 Simulando reproducción de prueba...');
    
    // Obtener el primer contenido disponible
    const playbackStats = this.globalPlayback.getCurrentPlaybackStats();
    const firstProgram = Object.values(playbackStats)[0];
    
    if (firstProgram) {
      const firstZone = Object.values(firstProgram.zones)[0];
      if (firstZone) {
        console.log(`📄 Simulando reproducción de: ${firstZone.currentContent}`);
        console.log('✅ Reproducción simulada completada');
      } else {
        console.log('❌ No hay zonas disponibles para simular');
      }
    } else {
      console.log('❌ No hay programas disponibles para simular');
    }
  }

  // Monitorear cambios en tiempo real
  startMonitoring(): void {
    console.log('🔍 Iniciando monitoreo en tiempo real...');
    console.log('📊 Mostrando estadísticas cada 10 segundos');
    
    const interval = setInterval(() => {
      console.log('\n⏰ Actualización automática:');
      this.systemStatus();
    }, 10000);

    // Guardar referencia para poder detener el monitoreo
    (window as any).stopMonitoring = () => {
      clearInterval(interval);
      console.log('⏹️ Monitoreo detenido');
    };
    
    console.log('💡 Para detener el monitoreo, ejecuta: stopMonitoring()');
  }

  // Limpiar todas las estadísticas
  clearAllStats(): void {
    console.log('🧹 Limpiando todas las estadísticas...');
    
    // Limpiar estadísticas de repetición
    const repetitionStats = this.repetitionService.getAllStats();
    repetitionStats.forEach(stat => {
      this.repetitionService.clearContentData(stat.contentId);
    });
    
    // Limpiar estadísticas de reproducción
    this.reproductionStatsService.clearAllStats();
    
    console.log('✅ Todas las estadísticas han sido limpiadas');
  }

  // Cambiar velocidad de reproducción
  setPlaybackSpeed(seconds: number): void {
    const milliseconds = seconds * 1000;
    this.globalPlayback.setPlaybackSpeed(milliseconds);
    console.log(`⚡ Velocidad de reproducción cambiada a ${seconds} segundos`);
  }

  // Forzar avance de contenido
  forceAdvance(programId: string, zoneId: string): void {
    this.globalPlayback.forceAdvanceContent(programId, zoneId);
    console.log(`⏭️ Contenido avanzado manualmente en programa ${programId}, zona ${zoneId}`);
  }

  // Mostrar comandos disponibles
  showCommands(): void {
    console.log('=== 🛠️ COMANDOS DISPONIBLES ===');
    console.log('debugStats.showStats()         - Mostrar estadísticas completas');
    console.log('debugStats.systemStatus()      - Estado rápido del sistema');
    console.log('debugStats.simulatePlayback()  - Simular reproducción');
    console.log('debugStats.startMonitoring()   - Monitorear en tiempo real');
    console.log('debugStats.clearAllStats()     - Limpiar todas las estadísticas');
    console.log('debugStats.setPlaybackSpeed(5) - Cambiar velocidad (segundos)');
    console.log('debugStats.showCommands()      - Mostrar estos comandos');
    console.log('\n🎬 Servicio Global:');
    console.log('globalPlayback.getStatus()     - Estado del servicio global');
    console.log('globalPlayback.getCurrentPlaybackStats() - Estadísticas actuales');
  }
}

// Hacer disponible globalmente
declare global {
  interface Window {
    debugStats: DebugStatsService;
  }
}

// Crear instancia global
const debugStatsService = DebugStatsService.getInstance();
window.debugStats = debugStatsService;

// Mostrar comandos al cargar
console.log('🛠️ Servicio de Debug cargado. Ejecuta debugStats.showCommands() para ver comandos disponibles');

export default debugStatsService; 