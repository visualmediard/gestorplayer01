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
import { supabase } from '../config/supabase';
var StorageService = /** @class */ (function () {
    function StorageService() {
        this.bucketName = 'gestorplayer-media';
        this.initializeBucket();
    }
    StorageService.getInstance = function () {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    };
    // Inicializar el bucket si no existe
    StorageService.prototype.initializeBucket = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buckets, bucketExists, error, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, supabase.storage.listBuckets()];
                    case 1:
                        buckets = (_a.sent()).data;
                        bucketExists = buckets === null || buckets === void 0 ? void 0 : buckets.some(function (bucket) { return bucket.name === _this.bucketName; });
                        if (!!bucketExists) return [3 /*break*/, 3];
                        return [4 /*yield*/, supabase.storage.createBucket(this.bucketName, {
                                public: true,
                                allowedMimeTypes: ['image/*', 'video/*'],
                                fileSizeLimit: 15 * 1024 * 1024 // 15MB
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error creando bucket:', error);
                        }
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error inicializando bucket:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Generar nombre único para archivo
    StorageService.prototype.generateFileName = function (file) {
        var _a;
        var timestamp = Date.now();
        var randomId = Math.random().toString(36).substring(2, 15);
        var extension = ((_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        var sanitizedName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_')
            .substring(0, 50);
        return "".concat(timestamp, "_").concat(randomId, "_").concat(sanitizedName, ".").concat(extension);
    };
    // Subir archivo a Supabase Storage
    StorageService.prototype.uploadFile = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var fileName, filePath, error, publicUrlData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fileName = this.generateFileName(file);
                        filePath = "media/".concat(fileName);
                        return [4 /*yield*/, supabase.storage
                                .from(this.bucketName)
                                .upload(filePath, file, {
                                cacheControl: '3600',
                                upsert: false
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        publicUrlData = supabase.storage
                            .from(this.bucketName)
                            .getPublicUrl(filePath).data;
                        return [2 /*return*/, {
                                success: true,
                                url: publicUrlData.publicUrl,
                                path: filePath
                            }];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Error desconocido al subir archivo'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Eliminar archivo de Supabase Storage
    StorageService.prototype.deleteFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase.storage
                                .from(this.bucketName)
                                .remove([filePath])];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Error desconocido al eliminar archivo'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Verificar si una URL es de Supabase Storage
    StorageService.prototype.isSupabaseStorageUrl = function (url) {
        return url.includes(this.bucketName) && url.includes('supabase');
    };
    // Extraer ruta del archivo desde la URL
    StorageService.prototype.extractFilePathFromUrl = function (url) {
        try {
            var urlParts = url.split("".concat(this.bucketName, "/"));
            return urlParts.length > 1 ? urlParts[1] : null;
        }
        catch (error) {
            return null;
        }
    };
    // Obtener información del archivo
    StorageService.prototype.getFileInfo = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, fileInfo, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase.storage
                                .from(this.bucketName)
                                .list('media', { search: filePath })];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { error: error.message }];
                        }
                        fileInfo = data === null || data === void 0 ? void 0 : data.find(function (file) { return filePath.includes(file.name); });
                        return [2 /*return*/, {
                                size: (_b = fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.metadata) === null || _b === void 0 ? void 0 : _b.size,
                                lastModified: fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.updated_at
                            }];
                    case 2:
                        error_4 = _c.sent();
                        return [2 /*return*/, {
                                error: error_4 instanceof Error ? error_4.message : 'Error obteniendo información del archivo'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Limpiar archivos huérfanos (sin referencias en la base de datos)
    StorageService.prototype.cleanupOrphanedFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Esta función podría implementarse para limpiar archivos no utilizados
                    // Por ahora retorna valores por defecto
                    return [2 /*return*/, { deleted: 0, errors: [] }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            deleted: 0,
                            errors: [error instanceof Error ? error.message : 'Error en limpieza']
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    // Verificar si el servicio de storage está disponible
    StorageService.prototype.isStorageAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase.storage.listBuckets()];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, !!data];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener estadísticas de uso del storage
    StorageService.prototype.getStorageStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, totalFiles, totalSize, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase.storage
                                .from(this.bucketName)
                                .list('media')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { totalFiles: 0, totalSize: 0, error: error.message }];
                        }
                        totalFiles = (data === null || data === void 0 ? void 0 : data.length) || 0;
                        totalSize = (data === null || data === void 0 ? void 0 : data.reduce(function (sum, file) { var _a; return sum + (((_a = file.metadata) === null || _a === void 0 ? void 0 : _a.size) || 0); }, 0)) || 0;
                        return [2 /*return*/, { totalFiles: totalFiles, totalSize: totalSize }];
                    case 2:
                        error_6 = _b.sent();
                        return [2 /*return*/, {
                                totalFiles: 0,
                                totalSize: 0,
                                error: error_6 instanceof Error ? error_6.message : 'Error obteniendo estadísticas'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StorageService;
}());
export { StorageService };
