import { RepetitionService } from './repetitionService';
import ReproductionStatsService from './reproductionStatsService';
var GlobalPlaybackService = /** @class */ (function () {
    function GlobalPlaybackService() {
        this.programs = [];
        this.playbackIntervals = new Map();
        this.currentContentIndex = new Map();
        this.isRunning = false;
        this.playbackSpeed = 8000; // 8 segundos por defecto
        this.repetitionService = RepetitionService.getInstance();
        this.reproductionStatsService = ReproductionStatsService.getInstance();
    }
    GlobalPlaybackService.getInstance = function () {
        if (!GlobalPlaybackService.instance) {
            GlobalPlaybackService.instance = new GlobalPlaybackService();
        }
        return GlobalPlaybackService.instance;
    };
    // Inicializar el servicio con los programas disponibles
    GlobalPlaybackService.prototype.initializeWithPrograms = function (programs) {
        this.programs = programs;
        console.log("\uD83C\uDFAC GlobalPlaybackService inicializado con ".concat(programs.length, " programa(s)"));
        if (programs.length > 0) {
            this.startGlobalPlayback();
        }
    };
    // Actualizar los programas cuando cambien
    GlobalPlaybackService.prototype.updatePrograms = function (programs) {
        this.programs = programs;
        console.log("\uD83D\uDCDD Programas actualizados: ".concat(programs.length, " programa(s)"));
        if (this.isRunning) {
            this.stopGlobalPlayback();
            this.startGlobalPlayback();
        }
    };
    // Iniciar reproducción global automática
    GlobalPlaybackService.prototype.startGlobalPlayback = function () {
        var _this = this;
        if (this.isRunning) {
            console.log('⚠️ El servicio de reproducción ya está ejecutándose');
            return;
        }
        this.isRunning = true;
        console.log('🚀 Iniciando reproducción global automática en segundo plano');
        // Procesar cada programa
        this.programs.forEach(function (program) {
            if (program.zones && program.zones.length > 0) {
                _this.startProgramPlayback(program);
            }
        });
        // Registrar reproducciones iniciales
        this.registerInitialPlaybacks();
    };
    // Detener reproducción global
    GlobalPlaybackService.prototype.stopGlobalPlayback = function () {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        console.log('⏹️ Deteniendo reproducción global automática');
        // Limpiar todos los intervalos
        this.playbackIntervals.forEach(function (interval) {
            clearInterval(interval);
        });
        this.playbackIntervals.clear();
        this.currentContentIndex.clear();
    };
    // Iniciar reproducción de un programa específico
    GlobalPlaybackService.prototype.startProgramPlayback = function (program) {
        var _this = this;
        var _a;
        (_a = program.zones) === null || _a === void 0 ? void 0 : _a.forEach(function (zone) {
            if (zone.content && zone.content.length > 0) {
                var zoneKey = "".concat(program.id, "-").concat(zone.id);
                // Inicializar índice de contenido
                _this.currentContentIndex.set(zoneKey, 0);
                // Crear intervalo de reproducción para esta zona
                var interval = setInterval(function () {
                    _this.advanceContent(program, zone);
                }, _this.playbackSpeed);
                _this.playbackIntervals.set(zoneKey, interval);
                console.log("\uD83C\uDFAF Zona \"".concat(zone.name, "\" del programa \"").concat(program.name, "\" iniciada en segundo plano"));
            }
        });
    };
    // Avanzar al siguiente contenido en una zona
    GlobalPlaybackService.prototype.advanceContent = function (program, zone) {
        var _this = this;
        var zoneKey = "".concat(program.id, "-").concat(zone.id);
        // Filtrar contenido disponible para reproducir hoy
        var availableContent = zone.content.filter(function (content) {
            return _this.repetitionService.canPlayToday(content.id);
        });
        if (availableContent.length === 0) {
            console.log("\u23ED\uFE0F No hay contenido disponible para reproducir en zona \"".concat(zone.name, "\""));
            return;
        }
        // Obtener índice actual y avanzar
        var currentIndex = this.currentContentIndex.get(zoneKey) || 0;
        var nextIndex = (currentIndex + 1) % availableContent.length;
        this.currentContentIndex.set(zoneKey, nextIndex);
        // Obtener el contenido actual
        var currentContent = availableContent[nextIndex];
        if (currentContent) {
            // Registrar reproducción solo para imagen y video
            if (currentContent.type === 'image' || currentContent.type === 'video') {
                // IMPORTANTE: Registrar en sistema de repeticiones PRIMERO
                this.repetitionService.recordPlayback(currentContent.id);
                // Obtener el conteo actualizado del sistema de repeticiones
                var repetitionStats = this.repetitionService.getContentStats(currentContent.id);
                var reproductionsCount = repetitionStats ? repetitionStats.reproductionsToday : 1;
                // Sincronizar con estadísticas de reproducción usando el conteo exacto
                this.reproductionStatsService.syncReproductionCount(currentContent.id, currentContent.name, currentContent.type, program.id, program.name, reproductionsCount, currentContent.type === 'video' ? 15 : 8);
                console.log("\uD83D\uDD04 [SEGUNDO PLANO] Reproducci\u00F3n #".concat(reproductionsCount, " registrada: \"").concat(currentContent.name, "\" en \"").concat(zone.name, "\" (").concat(program.name, ")"));
            }
        }
    };
    // Registrar reproducciones iniciales al iniciar
    GlobalPlaybackService.prototype.registerInitialPlaybacks = function () {
        var _this = this;
        console.log('🎬 Registrando reproducciones iniciales en segundo plano...');
        this.programs.forEach(function (program) {
            var _a;
            (_a = program.zones) === null || _a === void 0 ? void 0 : _a.forEach(function (zone) {
                if (zone.content && zone.content.length > 0) {
                    // Filtrar contenido disponible
                    var availableContent = zone.content.filter(function (content) {
                        return _this.repetitionService.canPlayToday(content.id);
                    });
                    if (availableContent.length > 0) {
                        var firstContent = availableContent[0];
                        if (firstContent.type === 'image' || firstContent.type === 'video') {
                            // IMPORTANTE: Registrar en sistema de repeticiones PRIMERO
                            _this.repetitionService.recordPlayback(firstContent.id);
                            // Obtener el conteo actualizado del sistema de repeticiones
                            var repetitionStats = _this.repetitionService.getContentStats(firstContent.id);
                            var reproductionsCount = repetitionStats ? repetitionStats.reproductionsToday : 1;
                            // Sincronizar con estadísticas de reproducción usando el conteo exacto
                            _this.reproductionStatsService.syncReproductionCount(firstContent.id, firstContent.name, firstContent.type, program.id, program.name, reproductionsCount, firstContent.type === 'video' ? 15 : 8);
                            console.log("\uD83C\uDFAF [SEGUNDO PLANO] Reproducci\u00F3n inicial #".concat(reproductionsCount, ": \"").concat(firstContent.name, "\" en \"").concat(zone.name, "\" (").concat(program.name, ")"));
                        }
                    }
                }
            });
        });
    };
    // Cambiar velocidad de reproducción
    GlobalPlaybackService.prototype.setPlaybackSpeed = function (milliseconds) {
        this.playbackSpeed = milliseconds;
        console.log("\u26A1 Velocidad de reproducci\u00F3n cambiada a ".concat(milliseconds, "ms"));
        // Reiniciar si está corriendo
        if (this.isRunning) {
            this.stopGlobalPlayback();
            this.startGlobalPlayback();
        }
    };
    // Obtener estado actual
    GlobalPlaybackService.prototype.getStatus = function () {
        var totalContent = this.programs.reduce(function (sum, program) {
            var _a;
            return sum + (((_a = program.zones) === null || _a === void 0 ? void 0 : _a.reduce(function (zoneSum, zone) { var _a; return zoneSum + (((_a = zone.content) === null || _a === void 0 ? void 0 : _a.length) || 0); }, 0)) || 0);
        }, 0);
        return {
            isRunning: this.isRunning,
            activePrograms: this.programs.length,
            activeZones: this.playbackIntervals.size,
            playbackSpeed: this.playbackSpeed,
            totalContent: totalContent
        };
    };
    // Obtener estadísticas de reproducción actual
    GlobalPlaybackService.prototype.getCurrentPlaybackStats = function () {
        var _this = this;
        var stats = {};
        this.programs.forEach(function (program) {
            if (program.zones && program.zones.length > 0) {
                stats[program.id] = {
                    programName: program.name,
                    zones: {}
                };
                program.zones.forEach(function (zone) {
                    var _a, _b;
                    var zoneKey = "".concat(program.id, "-").concat(zone.id);
                    var currentIndex = _this.currentContentIndex.get(zoneKey) || 0;
                    var availableContent = ((_a = zone.content) === null || _a === void 0 ? void 0 : _a.filter(function (content) {
                        return _this.repetitionService.canPlayToday(content.id);
                    })) || [];
                    var currentContent = availableContent[currentIndex];
                    stats[program.id].zones[zone.id] = {
                        zoneName: zone.name,
                        currentContent: (currentContent === null || currentContent === void 0 ? void 0 : currentContent.name) || 'Sin contenido',
                        totalContent: ((_b = zone.content) === null || _b === void 0 ? void 0 : _b.length) || 0,
                        availableContent: availableContent.length
                    };
                });
            }
        });
        return stats;
    };
    // Forzar avance manual de contenido
    GlobalPlaybackService.prototype.forceAdvanceContent = function (programId, zoneId) {
        var _a;
        var program = this.programs.find(function (p) { return p.id === programId; });
        var zone = (_a = program === null || program === void 0 ? void 0 : program.zones) === null || _a === void 0 ? void 0 : _a.find(function (z) { return z.id === zoneId; });
        if (program && zone) {
            this.advanceContent(program, zone);
            console.log("\u23ED\uFE0F Contenido avanzado manualmente en zona \"".concat(zone.name, "\""));
        }
    };
    return GlobalPlaybackService;
}());
export { GlobalPlaybackService };
// Crear instancia global
var globalPlaybackService = GlobalPlaybackService.getInstance();
window.globalPlayback = globalPlaybackService;
export default globalPlaybackService;
