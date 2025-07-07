var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var STORAGE_KEY = 'gestorplayer-programs';
var ProgramStorageService = /** @class */ (function () {
    function ProgramStorageService() {
    }
    ProgramStorageService.getInstance = function () {
        if (!ProgramStorageService.instance) {
            ProgramStorageService.instance = new ProgramStorageService();
        }
        return ProgramStorageService.instance;
    };
    // Cargar programas desde localStorage
    ProgramStorageService.prototype.loadPrograms = function () {
        try {
            var savedPrograms = localStorage.getItem(STORAGE_KEY);
            if (savedPrograms) {
                var programs = JSON.parse(savedPrograms);
                console.log('Programas cargados desde localStorage:', programs);
                return programs;
            }
            return [];
        }
        catch (error) {
            console.error('Error al cargar programas desde localStorage:', error);
            return [];
        }
    };
    // Guardar programas en localStorage
    ProgramStorageService.prototype.savePrograms = function (programs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
            console.log('Programas guardados en localStorage:', programs);
        }
        catch (error) {
            console.error('Error al guardar programas en localStorage:', error);
        }
    };
    // Guardar un programa específico
    ProgramStorageService.prototype.saveProgram = function (program, programs) {
        try {
            var existingIndex = programs.findIndex(function (p) { return p.id === program.id; });
            var updatedPrograms = void 0;
            if (existingIndex !== -1) {
                // Actualizar programa existente
                updatedPrograms = __spreadArray([], programs, true);
                updatedPrograms[existingIndex] = program;
            }
            else {
                // Agregar nuevo programa
                updatedPrograms = __spreadArray(__spreadArray([], programs, true), [program], false);
            }
            this.savePrograms(updatedPrograms);
            return updatedPrograms;
        }
        catch (error) {
            console.error('Error al guardar programa:', error);
            return programs;
        }
    };
    // Eliminar un programa
    ProgramStorageService.prototype.deleteProgram = function (programId, programs) {
        try {
            var updatedPrograms = programs.filter(function (p) { return p.id !== programId; });
            this.savePrograms(updatedPrograms);
            return updatedPrograms;
        }
        catch (error) {
            console.error('Error al eliminar programa:', error);
            return programs;
        }
    };
    // Limpiar todos los programas
    ProgramStorageService.prototype.clearPrograms = function () {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Todos los programas han sido eliminados del localStorage');
        }
        catch (error) {
            console.error('Error al limpiar programas:', error);
        }
    };
    // Exportar todos los datos como JSON
    ProgramStorageService.prototype.exportData = function () {
        try {
            var programs = this.loadPrograms();
            var exportData = {
                programs: programs,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            return JSON.stringify(exportData, null, 2);
        }
        catch (error) {
            console.error('Error al exportar datos:', error);
            return '';
        }
    };
    // Importar datos desde JSON
    ProgramStorageService.prototype.importData = function (jsonData) {
        try {
            var importData = JSON.parse(jsonData);
            // Validar estructura de datos
            if (!importData.programs || !Array.isArray(importData.programs)) {
                console.error('Formato de datos inválido');
                return false;
            }
            // Guardar programas importados
            this.savePrograms(importData.programs);
            console.log("".concat(importData.programs.length, " programas importados exitosamente"));
            return true;
        }
        catch (error) {
            console.error('Error al importar datos:', error);
            return false;
        }
    };
    // Descargar archivo de respaldo
    ProgramStorageService.prototype.downloadBackup = function () {
        try {
            var exportData = this.exportData();
            var blob = new Blob([exportData], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = "gestorplayer-backup-".concat(new Date().toISOString().split('T')[0], ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Error al descargar respaldo:', error);
        }
    };
    // Obtener información del almacenamiento
    ProgramStorageService.prototype.getStorageInfo = function () {
        try {
            var programs = this.loadPrograms();
            var storageData = localStorage.getItem(STORAGE_KEY);
            var storageSize = storageData ? (new Blob([storageData]).size / 1024).toFixed(2) + ' KB' : '0 KB';
            var lastModified = programs.length > 0
                ? Math.max.apply(Math, programs.map(function (p) { return new Date(p.lastModified).getTime(); })) : 0;
            return {
                totalPrograms: programs.length,
                storageSize: storageSize,
                lastModified: lastModified > 0 ? new Date(lastModified).toLocaleString() : 'Nunca'
            };
        }
        catch (error) {
            console.error('Error al obtener información del almacenamiento:', error);
            return {
                totalPrograms: 0,
                storageSize: '0 KB',
                lastModified: 'Error'
            };
        }
    };
    return ProgramStorageService;
}());
export default ProgramStorageService;
