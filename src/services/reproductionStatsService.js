var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var ReproductionStatsService = /** @class */ (function () {
    function ReproductionStatsService() {
        this.stats = {};
        this.sessionStart = Date.now();
        this.autoSaveInterval = null;
        this.loadStats();
        this.startAutoSave();
    }
    ReproductionStatsService.getInstance = function () {
        if (!ReproductionStatsService.instance) {
            ReproductionStatsService.instance = new ReproductionStatsService();
        }
        return ReproductionStatsService.instance;
    };
    ReproductionStatsService.prototype.loadStats = function () {
        try {
            var saved = localStorage.getItem('gestorplayer-reproduction-stats');
            if (saved) {
                var parsedStats = JSON.parse(saved);
                this.stats = parsedStats;
            }
        }
        catch (error) {
            console.error('Error loading reproduction stats:', error);
            this.stats = {};
        }
    };
    ReproductionStatsService.prototype.saveStats = function () {
        try {
            localStorage.setItem('gestorplayer-reproduction-stats', JSON.stringify(this.stats));
        }
        catch (error) {
            console.error('Error saving reproduction stats:', error);
        }
    };
    ReproductionStatsService.prototype.startAutoSave = function () {
        var _this = this;
        // Limpiar intervalo anterior si existe
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        // Guardar cada 30 segundos
        this.autoSaveInterval = setInterval(function () {
            _this.saveStats();
        }, 30000);
    };
    ReproductionStatsService.prototype.recordReproduction = function (contentId, contentName, contentType, programId, programName, duration) {
        var now = Date.now();
        if (!this.stats[contentId]) {
            this.stats[contentId] = {
                name: contentName,
                type: contentType,
                reproductions: 0,
                lastReproduction: 0,
                programId: programId,
                programName: programName,
                reproductionsPerMinute: 0,
                totalDuration: 0,
                averageSessionTime: 0
            };
        }
        // Actualizar estadísticas
        this.stats[contentId].reproductions++;
        this.stats[contentId].lastReproduction = now;
        if (duration) {
            this.stats[contentId].totalDuration = (this.stats[contentId].totalDuration || 0) + duration;
            this.stats[contentId].averageSessionTime = this.stats[contentId].totalDuration / this.stats[contentId].reproductions;
        }
        this.calculateReproductionsPerMinute(contentId);
        this.saveStats(); // Guardar inmediatamente después de registrar
    };
    // Sincronizar conteo exacto con RepetitionService
    ReproductionStatsService.prototype.syncReproductionCount = function (contentId, contentName, contentType, programId, programName, exactCount, duration) {
        var now = Date.now();
        if (!this.stats[contentId]) {
            this.stats[contentId] = {
                name: contentName,
                type: contentType,
                reproductions: 0,
                lastReproduction: 0,
                programId: programId,
                programName: programName,
                reproductionsPerMinute: 0,
                totalDuration: 0,
                averageSessionTime: 0
            };
        }
        // Actualizar con el conteo exacto
        this.stats[contentId].reproductions = exactCount;
        this.stats[contentId].lastReproduction = now;
        if (duration) {
            this.stats[contentId].totalDuration = (this.stats[contentId].totalDuration || 0) + duration;
            this.stats[contentId].averageSessionTime = this.stats[contentId].totalDuration / this.stats[contentId].reproductions;
        }
        this.calculateReproductionsPerMinute(contentId);
        this.saveStats(); // Guardar inmediatamente después de sincronizar
    };
    ReproductionStatsService.prototype.calculateReproductionsPerMinute = function (contentId) {
        var stat = this.stats[contentId];
        if (!stat)
            return;
        var sessionDurationMinutes = (Date.now() - this.sessionStart) / (1000 * 60);
        if (sessionDurationMinutes > 0) {
            stat.reproductionsPerMinute = Math.round((stat.reproductions / sessionDurationMinutes) * 100) / 100;
        }
    };
    ReproductionStatsService.prototype.getStats = function () {
        return __assign({}, this.stats);
    };
    // Obtener todas las estadísticas como array para debugging
    ReproductionStatsService.prototype.getAllStats = function () {
        return Object.entries(this.stats).map(function (_a) {
            var contentId = _a[0], stat = _a[1];
            return ({
                contentId: contentId,
                contentName: stat.name,
                contentType: stat.type,
                reproductions: stat.reproductions,
                lastReproduction: stat.lastReproduction ? new Date(stat.lastReproduction).toLocaleString() : 'Nunca',
                programId: stat.programId,
                programName: stat.programName,
                totalTime: stat.totalDuration || 0
            });
        });
    };
    // Limpiar todas las estadísticas
    ReproductionStatsService.prototype.clearAllStats = function () {
        this.stats = {};
        this.saveStats();
    };
    ReproductionStatsService.prototype.getGlobalStats = function () {
        var stats = Object.values(this.stats);
        var totalReproductions = stats.reduce(function (sum, stat) { return sum + stat.reproductions; }, 0);
        var sessionDurationMinutes = (Date.now() - this.sessionStart) / (1000 * 60);
        // Agrupar por programa para contar programas únicos
        var programsSet = new Set(stats.map(function (stat) { return stat.programId; }));
        return {
            totalPrograms: programsSet.size,
            totalContent: Object.keys(this.stats).length,
            totalReproductions: totalReproductions,
            sessionDuration: Math.floor(sessionDurationMinutes),
            reproductionsPerMinute: sessionDurationMinutes > 0 ? Math.round((totalReproductions / sessionDurationMinutes) * 100) / 100 : 0,
            topContent: this.getTopContent(5),
            lastUpdated: new Date().toISOString()
        };
    };
    ReproductionStatsService.prototype.getTopContent = function (limit) {
        if (limit === void 0) { limit = 5; }
        return Object.entries(this.stats)
            .map(function (_a) {
            var id = _a[0], stat = _a[1];
            return ({
                id: id,
                name: stat.name,
                reproductions: stat.reproductions,
                type: stat.type
            });
        })
            .sort(function (a, b) { return b.reproductions - a.reproductions; })
            .slice(0, limit);
    };
    ReproductionStatsService.prototype.getStatsByProgram = function (programId) {
        var programStats = {};
        Object.entries(this.stats).forEach(function (_a) {
            var contentId = _a[0], stat = _a[1];
            if (stat.programId === programId) {
                programStats[contentId] = stat;
            }
        });
        return programStats;
    };
    ReproductionStatsService.prototype.getTotalReproductions = function () {
        return Object.values(this.stats).reduce(function (total, stat) { return total + stat.reproductions; }, 0);
    };
    ReproductionStatsService.prototype.getSessionDuration = function () {
        return Math.floor((Date.now() - this.sessionStart) / (1000 * 60));
    };
    ReproductionStatsService.prototype.resetStats = function () {
        this.stats = {};
        this.saveStats();
    };
    ReproductionStatsService.prototype.resetSessionStats = function () {
        this.sessionStart = Date.now();
        Object.values(this.stats).forEach(function (stat) {
            stat.reproductionsPerMinute = 0;
        });
    };
    ReproductionStatsService.prototype.exportStats = function () {
        return JSON.stringify({
            stats: this.stats,
            sessionStart: this.sessionStart,
            exportDate: new Date().toISOString()
        }, null, 2);
    };
    ReproductionStatsService.prototype.importStats = function (data) {
        try {
            var parsed = JSON.parse(data);
            if (parsed.stats && typeof parsed.stats === 'object') {
                this.stats = parsed.stats;
                this.saveStats();
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error importing stats:', error);
            return false;
        }
    };
    ReproductionStatsService.prototype.destroy = function () {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    };
    // Borrar estadísticas de un contenido específico
    ReproductionStatsService.prototype.clearContentStats = function (contentId) {
        if (this.stats[contentId]) {
            delete this.stats[contentId];
            this.saveStats();
        }
    };
    return ReproductionStatsService;
}());
export default ReproductionStatsService;
