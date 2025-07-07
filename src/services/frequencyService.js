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
var FrequencyService = /** @class */ (function () {
    function FrequencyService() {
        this.settings = {};
        this.dailyStats = {};
        this.loadSettings();
        this.cleanupOldStats();
    }
    FrequencyService.getInstance = function () {
        if (!FrequencyService.instance) {
            FrequencyService.instance = new FrequencyService();
        }
        return FrequencyService.instance;
    };
    FrequencyService.prototype.loadSettings = function () {
        try {
            var savedSettings = localStorage.getItem('gestorplayer-frequency-settings');
            var savedStats = localStorage.getItem('gestorplayer-daily-stats');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            }
            if (savedStats) {
                this.dailyStats = JSON.parse(savedStats);
            }
        }
        catch (error) {
            console.error('Error loading frequency settings:', error);
            this.settings = {};
            this.dailyStats = {};
        }
    };
    FrequencyService.prototype.saveSettings = function () {
        try {
            localStorage.setItem('gestorplayer-frequency-settings', JSON.stringify(this.settings));
            localStorage.setItem('gestorplayer-daily-stats', JSON.stringify(this.dailyStats));
        }
        catch (error) {
            console.error('Error saving frequency settings:', error);
        }
    };
    FrequencyService.prototype.cleanupOldStats = function () {
        var _this = this;
        var today = new Date().toDateString();
        Object.keys(this.dailyStats).forEach(function (contentId) {
            if (_this.dailyStats[contentId].date !== today) {
                _this.dailyStats[contentId] = { count: 0, date: today };
            }
        });
        this.saveSettings();
    };
    FrequencyService.prototype.setFrequencyLimit = function (contentId, limit, isUnlimited) {
        if (isUnlimited === void 0) { isUnlimited = false; }
        if (!this.settings[contentId]) {
            this.settings[contentId] = {
                count: 0,
                date: new Date().toDateString(),
                limit: limit,
                isUnlimited: isUnlimited
            };
        }
        else {
            this.settings[contentId].limit = limit;
            this.settings[contentId].isUnlimited = isUnlimited;
        }
        this.saveSettings();
    };
    FrequencyService.prototype.canPlayContent = function (contentId) {
        var today = new Date().toDateString();
        // Verificar si existe configuración para este contenido
        var setting = this.settings[contentId];
        if (!setting) {
            return true; // Sin configuración = sin límites
        }
        // Si es ilimitado, siempre puede reproducir
        if (setting.isUnlimited) {
            return true;
        }
        // Inicializar stats diarios si no existen
        if (!this.dailyStats[contentId]) {
            this.dailyStats[contentId] = { count: 0, date: today };
        }
        // Resetear contador si cambió el día
        if (this.dailyStats[contentId].date !== today) {
            this.dailyStats[contentId] = { count: 0, date: today };
        }
        // Verificar límite diario
        return this.dailyStats[contentId].count < setting.limit;
    };
    FrequencyService.prototype.recordPlayback = function (contentId) {
        var today = new Date().toDateString();
        // Inicializar stats diarios si no existen
        if (!this.dailyStats[contentId]) {
            this.dailyStats[contentId] = { count: 0, date: today };
        }
        // Resetear contador si cambió el día
        if (this.dailyStats[contentId].date !== today) {
            this.dailyStats[contentId] = { count: 0, date: today };
        }
        // Incrementar contador
        this.dailyStats[contentId].count++;
        // Actualizar configuración si existe
        if (this.settings[contentId]) {
            this.settings[contentId].count = this.dailyStats[contentId].count;
            this.settings[contentId].date = today;
        }
        this.saveSettings();
    };
    FrequencyService.prototype.getContentStats = function (contentId) {
        var today = new Date().toDateString();
        var setting = this.settings[contentId];
        var dailyStat = this.dailyStats[contentId];
        if (!setting) {
            return {
                count: 0,
                limit: 0,
                isUnlimited: true,
                remainingPlays: Infinity
            };
        }
        var currentCount = dailyStat && dailyStat.date === today ? dailyStat.count : 0;
        var remainingPlays = setting.isUnlimited ? Infinity : Math.max(0, setting.limit - currentCount);
        return {
            count: currentCount,
            limit: setting.limit,
            isUnlimited: setting.isUnlimited,
            remainingPlays: remainingPlays
        };
    };
    FrequencyService.prototype.getAllStats = function () {
        var _this = this;
        var stats = {};
        Object.keys(this.settings).forEach(function (contentId) {
            stats[contentId] = _this.getContentStats(contentId);
        });
        return stats;
    };
    FrequencyService.prototype.resetDailyStats = function () {
        var _this = this;
        var today = new Date().toDateString();
        Object.keys(this.dailyStats).forEach(function (contentId) {
            _this.dailyStats[contentId] = { count: 0, date: today };
        });
        Object.keys(this.settings).forEach(function (contentId) {
            _this.settings[contentId].count = 0;
            _this.settings[contentId].date = today;
        });
        this.saveSettings();
    };
    FrequencyService.prototype.removeContent = function (contentId) {
        delete this.settings[contentId];
        delete this.dailyStats[contentId];
        this.saveSettings();
    };
    FrequencyService.prototype.getFrequencySettings = function () {
        return __assign({}, this.settings);
    };
    FrequencyService.prototype.updateFrequencySettings = function (settings) {
        this.settings = __assign({}, settings);
        this.saveSettings();
    };
    FrequencyService.prototype.exportSettings = function () {
        return JSON.stringify({
            settings: this.settings,
            dailyStats: this.dailyStats,
            exportDate: new Date().toISOString()
        }, null, 2);
    };
    FrequencyService.prototype.importSettings = function (data) {
        try {
            var parsed = JSON.parse(data);
            if (parsed.settings && typeof parsed.settings === 'object') {
                this.settings = parsed.settings;
                if (parsed.dailyStats && typeof parsed.dailyStats === 'object') {
                    this.dailyStats = parsed.dailyStats;
                }
                this.saveSettings();
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error importing frequency settings:', error);
            return false;
        }
    };
    return FrequencyService;
}());
export default FrequencyService;
