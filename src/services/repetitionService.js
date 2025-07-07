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
var RepetitionService = /** @class */ (function () {
    function RepetitionService() {
        this.storageKey = 'gestorplayer-repetitions';
    }
    RepetitionService.getInstance = function () {
        if (!RepetitionService.instance) {
            RepetitionService.instance = new RepetitionService();
        }
        return RepetitionService.instance;
    };
    // Obtener la fecha actual en formato YYYY-MM-DD
    RepetitionService.prototype.getCurrentDate = function () {
        return new Date().toISOString().split('T')[0];
    };
    // Cargar datos de repeticiones del localStorage
    RepetitionService.prototype.loadRepetitionData = function () {
        try {
            var data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        }
        catch (error) {
            return [];
        }
    };
    // Guardar datos de repeticiones en localStorage
    RepetitionService.prototype.saveRepetitionData = function (data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
        catch (error) {
            console.error('Error guardando datos de repeticiones:', error);
        }
    };
    // Obtener o crear datos de repetición para un contenido
    RepetitionService.prototype.getRepetitionData = function (contentId) {
        var allData = this.loadRepetitionData();
        return allData.find(function (data) { return data.contentId === contentId; }) || null;
    };
    // Actualizar datos de repetición para un contenido
    RepetitionService.prototype.updateRepetitionData = function (contentId, updates) {
        var allData = this.loadRepetitionData();
        var index = allData.findIndex(function (data) { return data.contentId === contentId; });
        if (index >= 0) {
            allData[index] = __assign(__assign({}, allData[index]), updates);
        }
        else {
            allData.push(__assign({ contentId: contentId, dailyCount: 0, lastPlayDate: this.getCurrentDate(), dailyLimit: -1, isUnlimited: true }, updates));
        }
        this.saveRepetitionData(allData);
    };
    // Configurar límite diario para un contenido
    RepetitionService.prototype.setDailyLimit = function (contentId, limit, isUnlimited) {
        if (isUnlimited === void 0) { isUnlimited = false; }
        this.updateRepetitionData(contentId, {
            dailyLimit: isUnlimited ? -1 : limit,
            isUnlimited: isUnlimited
        });
    };
    // Verificar si un contenido puede reproducirse hoy
    RepetitionService.prototype.canPlayToday = function (contentId) {
        var data = this.getRepetitionData(contentId);
        if (!data) {
            // Si no hay datos, puede reproducirse
            return true;
        }
        // Si es ilimitado, siempre puede reproducirse
        if (data.isUnlimited || data.dailyLimit === -1) {
            return true;
        }
        var today = this.getCurrentDate();
        // Si es un día diferente, resetear contador
        if (data.lastPlayDate !== today) {
            this.updateRepetitionData(contentId, {
                dailyCount: 0,
                lastPlayDate: today
            });
            return true;
        }
        // Verificar si aún puede reproducirse hoy
        return data.dailyCount < data.dailyLimit;
    };
    // Registrar una reproducción
    RepetitionService.prototype.recordPlayback = function (contentId) {
        var data = this.getRepetitionData(contentId);
        var today = this.getCurrentDate();
        if (!data) {
            // Crear nuevo registro
            this.updateRepetitionData(contentId, {
                dailyCount: 1,
                lastPlayDate: today
            });
            console.log("\uD83C\uDD95 Nuevo contenido reproducido - ID: ".concat(contentId, ", Contador: 1"));
        }
        else {
            // Si es un día diferente, resetear contador
            if (data.lastPlayDate !== today) {
                this.updateRepetitionData(contentId, {
                    dailyCount: 1,
                    lastPlayDate: today
                });
                console.log("\uD83D\uDDD3\uFE0F Nuevo d\u00EDa detectado - ID: ".concat(contentId, ", Contador reseteado a: 1"));
            }
            else {
                // Incrementar contador del día
                var newCount = data.dailyCount + 1;
                this.updateRepetitionData(contentId, {
                    dailyCount: newCount,
                    lastPlayDate: today
                });
                console.log("\uD83D\uDD22 Reproducci\u00F3n registrada - ID: ".concat(contentId, ", Contador: ").concat(newCount, ", L\u00EDmite: ").concat(data.isUnlimited ? 'Ilimitado' : data.dailyLimit));
            }
        }
    };
    // Obtener información de reproducción para un contenido
    RepetitionService.prototype.getPlaybackInfo = function (contentId) {
        var data = this.getRepetitionData(contentId);
        var today = this.getCurrentDate();
        if (!data) {
            return { played: 0, limit: -1, canPlay: true, isUnlimited: true };
        }
        // Si es un día diferente, el contador se resetea
        var played = data.lastPlayDate === today ? data.dailyCount : 0;
        return {
            played: played,
            limit: data.dailyLimit,
            canPlay: this.canPlayToday(contentId),
            isUnlimited: data.isUnlimited
        };
    };
    // Obtener estadísticas específicas de un contenido (para sincronización)
    RepetitionService.prototype.getContentStats = function (contentId) {
        var data = this.getRepetitionData(contentId);
        var today = this.getCurrentDate();
        if (!data) {
            return null;
        }
        // Si es un día diferente, el contador se resetea
        var reproductionsToday = data.lastPlayDate === today ? data.dailyCount : 0;
        return {
            reproductionsToday: reproductionsToday,
            dailyLimit: data.dailyLimit,
            isUnlimited: data.isUnlimited
        };
    };
    // Limpiar datos de repetición para un contenido específico
    RepetitionService.prototype.clearContentData = function (contentId) {
        var allData = this.loadRepetitionData();
        var filteredData = allData.filter(function (data) { return data.contentId !== contentId; });
        this.saveRepetitionData(filteredData);
        console.log("\uD83E\uDDF9 Datos de repetici\u00F3n eliminados para contenido ID: ".concat(contentId));
    };
    // Limpiar datos de repeticiones (para testing o mantenimiento)
    RepetitionService.prototype.clearAllData = function () {
        localStorage.removeItem(this.storageKey);
    };
    // Obtener estadísticas generales
    RepetitionService.prototype.getStats = function () {
        var allData = this.loadRepetitionData();
        var today = this.getCurrentDate();
        var activeToday = 0;
        var completedToday = 0;
        allData.forEach(function (data) {
            if (data.lastPlayDate === today) {
                if (data.isUnlimited || data.dailyCount < data.dailyLimit) {
                    activeToday++;
                }
                else {
                    completedToday++;
                }
            }
        });
        return {
            totalContents: allData.length,
            activeToday: activeToday,
            completedToday: completedToday
        };
    };
    // Obtener todas las estadísticas como array para debugging
    RepetitionService.prototype.getAllStats = function () {
        var _this = this;
        var allData = this.loadRepetitionData();
        var today = this.getCurrentDate();
        return allData.map(function (data) { return ({
            contentId: data.contentId,
            reproductionsToday: data.lastPlayDate === today ? data.dailyCount : 0,
            dailyLimit: data.dailyLimit,
            lastPlayDate: data.lastPlayDate,
            canPlayToday: _this.canPlayToday(data.contentId),
            isUnlimited: data.isUnlimited
        }); });
    };
    // Mostrar estadísticas detalladas en consola (para debugging)
    RepetitionService.prototype.showDetailedStats = function () {
        var _this = this;
        var allData = this.loadRepetitionData();
        var today = this.getCurrentDate();
        console.log('📊 === ESTADÍSTICAS DETALLADAS DE REPETICIONES ===');
        console.log("\uD83D\uDCC5 Fecha: ".concat(today));
        console.log("\uD83D\uDCDD Total de contenidos con datos: ".concat(allData.length));
        console.log('');
        if (allData.length === 0) {
            console.log('❌ No hay datos de repetición registrados');
            return;
        }
        console.log('📋 Detalle por contenido:');
        allData.forEach(function (data, index) {
            var isToday = data.lastPlayDate === today;
            var canPlay = _this.canPlayToday(data.contentId);
            var status = data.isUnlimited ? 'Ilimitado' :
                canPlay ? 'Activo' : 'Límite alcanzado';
            console.log("".concat(index + 1, ". ID: ").concat(data.contentId));
            console.log("   \uD83D\uDCCA Reproducciones hoy: ".concat(isToday ? data.dailyCount : 0));
            console.log("   \uD83C\uDFAF L\u00EDmite diario: ".concat(data.isUnlimited ? 'Ilimitado' : data.dailyLimit));
            console.log("   \uD83D\uDCC5 \u00DAltima reproducci\u00F3n: ".concat(data.lastPlayDate));
            console.log("   \u2705 Estado: ".concat(status));
            console.log("   \uD83D\uDD04 Puede reproducirse: ".concat(canPlay ? 'Sí' : 'No'));
            console.log('');
        });
        var stats = this.getStats();
        console.log('📈 Resumen:');
        console.log("   \uD83D\uDCC1 Total contenidos: ".concat(stats.totalContents));
        console.log("   \uD83D\uDFE2 Activos hoy: ".concat(stats.activeToday));
        console.log("   \uD83D\uDD34 Completados hoy: ".concat(stats.completedToday));
        console.log('='.repeat(50));
    };
    return RepetitionService;
}());
export { RepetitionService };
