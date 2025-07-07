var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { StorageService } from '../services/storageService';
// Función para probar la conectividad con Supabase Storage
export var testStorageConnectivity = function () { return __awaiter(void 0, void 0, void 0, function () {
    var storageService, isAvailable, stats, testContent, testFile, uploadResult, deleteResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🚀 Iniciando prueba de conectividad con Supabase Storage...');
                storageService = StorageService.getInstance();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                // 1. Verificar si el servicio está disponible
                console.log('📡 Verificando disponibilidad del servicio...');
                return [4 /*yield*/, storageService.isStorageAvailable()];
            case 2:
                isAvailable = _a.sent();
                console.log("\u2705 Servicio disponible: ".concat(isAvailable));
                if (!isAvailable) {
                    console.error('❌ El servicio de Storage no está disponible');
                    return [2 /*return*/, false];
                }
                // 2. Obtener estadísticas del bucket
                console.log('📊 Obteniendo estadísticas del bucket...');
                return [4 /*yield*/, storageService.getStorageStats()];
            case 3:
                stats = _a.sent();
                console.log("\uD83D\uDCC1 Archivos totales: ".concat(stats.totalFiles));
                console.log("\uD83D\uDCBE Tama\u00F1o total: ".concat((stats.totalSize / 1024 / 1024).toFixed(2), " MB"));
                // 3. Crear archivo de prueba
                console.log('🧪 Creando archivo de prueba...');
                testContent = 'Prueba de conectividad con GestorPlayer - ' + new Date().toISOString();
                testFile = new File([testContent], 'test-connectivity.txt', { type: 'text/plain' });
                return [4 /*yield*/, storageService.uploadFile(testFile)];
            case 4:
                uploadResult = _a.sent();
                if (!(uploadResult.success && uploadResult.url && uploadResult.path)) return [3 /*break*/, 6];
                console.log('✅ Archivo subido exitosamente');
                console.log("\uD83D\uDD17 URL: ".concat(uploadResult.url));
                console.log("\uD83D\uDCC1 Ruta: ".concat(uploadResult.path));
                // 4. Eliminar archivo de prueba
                console.log('🧹 Eliminando archivo de prueba...');
                return [4 /*yield*/, storageService.deleteFile(uploadResult.path)];
            case 5:
                deleteResult = _a.sent();
                if (deleteResult.success) {
                    console.log('✅ Archivo eliminado exitosamente');
                }
                else {
                    console.warn('⚠️ Error al eliminar archivo de prueba:', deleteResult.error);
                }
                console.log('🎉 ¡Prueba completada exitosamente!');
                return [2 /*return*/, true];
            case 6:
                console.error('❌ Error al subir archivo:', uploadResult.error);
                return [2 /*return*/, false];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_1 = _a.sent();
                console.error('❌ Error durante la prueba:', error_1);
                return [2 /*return*/, false];
            case 9: return [2 /*return*/];
        }
    });
}); };
// Función para mostrar información del bucket
export var showBucketInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var storageService, stats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('📋 Información del bucket gestorplayer-media:');
                storageService = StorageService.getInstance();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, storageService.getStorageStats()];
            case 2:
                stats = _a.sent();
                console.log('🏢 Bucket: gestorplayer-media');
                console.log('📁 Archivos:', stats.totalFiles);
                console.log('💾 Tamaño total:', (stats.totalSize / 1024 / 1024).toFixed(2), 'MB');
                console.log('📊 Límite por archivo: 15MB');
                console.log('🎯 Tipos permitidos: image/*, video/*');
                console.log('🔒 Acceso: Público (lectura)');
                console.log('☁️ Proveedor: Supabase Storage');
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('❌ Error obteniendo información del bucket:', error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Ejecutar prueba si se ejecuta directamente
if (import.meta.hot) {
    // Solo en desarrollo
    console.log('🔥 Modo desarrollo detectado - ejecutando prueba automática...');
    testStorageConnectivity().then(function (success) {
        if (success) {
            showBucketInfo();
        }
    });
}
