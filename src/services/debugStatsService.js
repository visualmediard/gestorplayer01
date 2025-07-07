import { GlobalPlaybackService } from './globalPlaybackService';
import { RepetitionService } from './repetitionService';
import ReproductionStatsService from './reproductionStatsService';
var DebugStatsService = /** @class */ (function () {
    function DebugStatsService() {
        this.globalPlayback = GlobalPlaybackService.getInstance();
        this.repetitionService = RepetitionService.getInstance();
        this.reproductionStatsService = ReproductionStatsService.getInstance();
    }
    DebugStatsService.getInstance = function () {
        if (!DebugStatsService.instance) {
            DebugStatsService.instance = new DebugStatsService();
        }
        return DebugStatsService.instance;
    };
    // Mostrar estadísticas completas del sistema
    DebugStatsService.prototype.showStats = function () {
        console.log('=== 📊 ESTADÍSTICAS DEL SISTEMA ===');
        // Estado del servicio global
        var globalStatus = this.globalPlayback.getStatus();
        console.log('\n🎬 Servicio Global de Reproducción:');
        console.log('- Estado:', globalStatus.isRunning ? '🟢 Activo' : '🔴 Detenido');
        console.log('- Programas activos:', globalStatus.activePrograms);
        console.log('- Zonas activas:', globalStatus.activeZones);
        console.log('- Total contenido:', globalStatus.totalContent);
        console.log('- Velocidad reproducción:', globalStatus.playbackSpeed + 'ms');
        // Estado de reproducción actual
        console.log('\n🎯 Estado de Reproducción Actual:');
        var playbackStats = this.globalPlayback.getCurrentPlaybackStats();
        Object.entries(playbackStats).forEach(function (_a) {
            var programData = _a[1];
            console.log("\uD83D\uDCCB Programa: ".concat(programData.programName));
            Object.entries(programData.zones).forEach(function (_a) {
                var zoneData = _a[1];
                console.log("  \uD83D\uDCCD Zona: ".concat(zoneData.zoneName));
                console.log("    - Contenido actual: ".concat(zoneData.currentContent));
                console.log("    - Total contenido: ".concat(zoneData.totalContent));
                console.log("    - Contenido disponible: ".concat(zoneData.availableContent));
            });
        });
        // Estadísticas de repetición
        console.log('\n🔄 Estadísticas de Repetición:');
        var repetitionStats = this.repetitionService.getAllStats();
        if (repetitionStats.length > 0) {
            repetitionStats.forEach(function (stat) {
                console.log("\uD83D\uDCC4 ".concat(stat.contentId, ":"));
                console.log("  - Reproducciones hoy: ".concat(stat.reproductionsToday));
                console.log("  - L\u00EDmite diario: ".concat(stat.dailyLimit === -1 ? 'Ilimitado' : stat.dailyLimit));
                console.log("  - Puede reproducir: ".concat(stat.canPlayToday ? '✅' : '❌'));
            });
        }
        else {
            console.log('No hay datos de repetición disponibles');
        }
        // Estadísticas de reproducción
        console.log('\n📈 Estadísticas de Reproducción:');
        var reproductionStats = this.reproductionStatsService.getAllStats();
        if (reproductionStats.length > 0) {
            reproductionStats.forEach(function (stat) {
                console.log("\uD83D\uDCC4 ".concat(stat.contentName, ":"));
                console.log("  - ID: ".concat(stat.contentId));
                console.log("  - Tipo: ".concat(stat.contentType));
                console.log("  - Reproducciones: ".concat(stat.reproductions));
                console.log("  - \u00DAltima reproducci\u00F3n: ".concat(stat.lastReproduction));
                console.log("  - Tiempo total: ".concat(stat.totalTime, "s"));
            });
        }
        else {
            console.log('No hay datos de reproducción disponibles');
        }
    };
    // Mostrar estado resumido del sistema
    DebugStatsService.prototype.systemStatus = function () {
        var globalStatus = this.globalPlayback.getStatus();
        var repetitionStats = this.repetitionService.getAllStats();
        var reproductionStats = this.reproductionStatsService.getAllStats();
        console.log('=== 🔍 ESTADO RÁPIDO DEL SISTEMA ===');
        console.log("\uD83C\uDFAC Servicio Global: ".concat(globalStatus.isRunning ? '🟢 Activo' : '🔴 Detenido'));
        console.log("\uD83D\uDCCB Programas: ".concat(globalStatus.activePrograms));
        console.log("\uD83D\uDCCD Zonas: ".concat(globalStatus.activeZones));
        console.log("\uD83D\uDCC4 Contenido: ".concat(globalStatus.totalContent));
        console.log("\uD83D\uDD04 Registros repetici\u00F3n: ".concat(repetitionStats.length));
        console.log("\uD83D\uDCC8 Registros reproducci\u00F3n: ".concat(reproductionStats.length));
        console.log("\u23F1\uFE0F Velocidad: ".concat(globalStatus.playbackSpeed, "ms"));
    };
    // Simular una reproducción para testing
    DebugStatsService.prototype.simulatePlayback = function () {
        console.log('🧪 Simulando reproducción de prueba...');
        // Obtener el primer contenido disponible
        var playbackStats = this.globalPlayback.getCurrentPlaybackStats();
        var firstProgram = Object.values(playbackStats)[0];
        if (firstProgram) {
            var firstZone = Object.values(firstProgram.zones)[0];
            if (firstZone) {
                console.log("\uD83D\uDCC4 Simulando reproducci\u00F3n de: ".concat(firstZone.currentContent));
                console.log('✅ Reproducción simulada completada');
            }
            else {
                console.log('❌ No hay zonas disponibles para simular');
            }
        }
        else {
            console.log('❌ No hay programas disponibles para simular');
        }
    };
    // Monitorear cambios en tiempo real
    DebugStatsService.prototype.startMonitoring = function () {
        var _this = this;
        console.log('🔍 Iniciando monitoreo en tiempo real...');
        console.log('📊 Mostrando estadísticas cada 10 segundos');
        var interval = setInterval(function () {
            console.log('\n⏰ Actualización automática:');
            _this.systemStatus();
        }, 10000);
        // Guardar referencia para poder detener el monitoreo
        window.stopMonitoring = function () {
            clearInterval(interval);
            console.log('⏹️ Monitoreo detenido');
        };
        console.log('💡 Para detener el monitoreo, ejecuta: stopMonitoring()');
    };
    // Limpiar todas las estadísticas
    DebugStatsService.prototype.clearAllStats = function () {
        var _this = this;
        console.log('🧹 Limpiando todas las estadísticas...');
        // Limpiar estadísticas de repetición
        var repetitionStats = this.repetitionService.getAllStats();
        repetitionStats.forEach(function (stat) {
            _this.repetitionService.clearContentData(stat.contentId);
        });
        // Limpiar estadísticas de reproducción
        this.reproductionStatsService.clearAllStats();
        console.log('✅ Todas las estadísticas han sido limpiadas');
    };
    // Cambiar velocidad de reproducción
    DebugStatsService.prototype.setPlaybackSpeed = function (seconds) {
        var milliseconds = seconds * 1000;
        this.globalPlayback.setPlaybackSpeed(milliseconds);
        console.log("\u26A1 Velocidad de reproducci\u00F3n cambiada a ".concat(seconds, " segundos"));
    };
    // Forzar avance de contenido
    DebugStatsService.prototype.forceAdvance = function (programId, zoneId) {
        this.globalPlayback.forceAdvanceContent(programId, zoneId);
        console.log("\u23ED\uFE0F Contenido avanzado manualmente en programa ".concat(programId, ", zona ").concat(zoneId));
    };
    // Mostrar comandos disponibles
    DebugStatsService.prototype.showCommands = function () {
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
    };
    return DebugStatsService;
}());
export { DebugStatsService };
// Crear instancia global
var debugStatsService = DebugStatsService.getInstance();
window.debugStats = debugStatsService;
// Mostrar comandos al cargar
console.log('🛠️ Servicio de Debug cargado. Ejecuta debugStats.showCommands() para ver comandos disponibles');
export default debugStatsService;
