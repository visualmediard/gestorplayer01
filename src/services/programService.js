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
var ProgramService = /** @class */ (function () {
    function ProgramService() {
        this.isSupabaseEnabled = false;
        this.connectionChecked = false;
        this.initializeConnection();
    }
    ProgramService.getInstance = function () {
        if (!ProgramService.instance) {
            ProgramService.instance = new ProgramService();
        }
        return ProgramService.instance;
    };
    ProgramService.prototype.initializeConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkSupabaseConnection()];
                    case 1:
                        _a.sent();
                        this.connectionChecked = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    ProgramService.prototype.checkSupabaseConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('programs')
                                .select('*')
                                .limit(1)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            if (error.code === 'PGRST116') {
                                // Tabla no existe, pero conexión OK
                                this.isSupabaseEnabled = true;
                            }
                            else {
                                this.isSupabaseEnabled = false;
                            }
                        }
                        else {
                            this.isSupabaseEnabled = true;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.isSupabaseEnabled = false;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener todos los programas
    ProgramService.prototype.getPrograms = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, mappedPrograms, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.connectionChecked) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkSupabaseConnection()];
                    case 1:
                        _b.sent();
                        this.connectionChecked = true;
                        _b.label = 2;
                    case 2:
                        if (!this.isSupabaseEnabled) return [3 /*break*/, 6];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, supabase
                                .from('programs')
                                .select('*')
                                .order('created_at', { ascending: false })];
                    case 4:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, this.getLocalPrograms()];
                        }
                        mappedPrograms = (data === null || data === void 0 ? void 0 : data.map(function (item) { return _this.mapSupabaseToProgram(item); })) || [];
                        return [2 /*return*/, mappedPrograms];
                    case 5:
                        error_2 = _b.sent();
                        return [2 /*return*/, this.getLocalPrograms()];
                    case 6: return [2 /*return*/, this.getLocalPrograms()];
                }
            });
        });
    };
    // Crear nuevo programa
    ProgramService.prototype.createProgram = function (program) {
        return __awaiter(this, void 0, void 0, function () {
            var programData, _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isSupabaseEnabled) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        programData = {
                            id: program.id,
                            name: program.name,
                            width: program.width,
                            height: program.height,
                            zones: program.zones || [],
                            content: program.content || 0,
                            last_modified: program.lastModified,
                            description: program.description,
                            created_at: program.createdAt
                        };
                        return [4 /*yield*/, supabase
                                .from('programs')
                                .insert([programData])
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, this.createLocalProgram(program)];
                        }
                        return [2 /*return*/, { success: true, data: this.mapSupabaseToProgram(data) }];
                    case 3:
                        error_3 = _b.sent();
                        return [2 /*return*/, this.createLocalProgram(program)];
                    case 4: return [2 /*return*/, this.createLocalProgram(program)];
                }
            });
        });
    };
    // Actualizar programa
    ProgramService.prototype.updateProgram = function (program) {
        return __awaiter(this, void 0, void 0, function () {
            var programData, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isSupabaseEnabled) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        programData = {
                            name: program.name,
                            width: program.width,
                            height: program.height,
                            zones: program.zones || [],
                            content: program.content || 0,
                            last_modified: program.lastModified,
                            description: program.description
                        };
                        return [4 /*yield*/, supabase
                                .from('programs')
                                .update(programData)
                                .eq('id', program.id)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, this.updateLocalProgram(program)];
                        }
                        return [2 /*return*/, { success: true, data: this.mapSupabaseToProgram(data) }];
                    case 3:
                        error_4 = _b.sent();
                        return [2 /*return*/, this.updateLocalProgram(program)];
                    case 4: return [2 /*return*/, this.updateLocalProgram(program)];
                }
            });
        });
    };
    // Eliminar programa
    ProgramService.prototype.deleteProgram = function (programId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isSupabaseEnabled) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, supabase
                                .from('programs')
                                .delete()
                                .eq('id', programId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            return [2 /*return*/, this.deleteLocalProgram(programId)];
                        }
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.deleteLocalProgram(programId)];
                    case 4: return [2 /*return*/, this.deleteLocalProgram(programId)];
                }
            });
        });
    };
    // Métodos de localStorage como fallback
    ProgramService.prototype.getLocalPrograms = function () {
        try {
            var saved = localStorage.getItem('gestorplayer-programs');
            return saved ? JSON.parse(saved) : [];
        }
        catch (error) {
            return [];
        }
    };
    ProgramService.prototype.createLocalProgram = function (program) {
        try {
            var programs = this.getLocalPrograms();
            programs.push(program);
            localStorage.setItem('gestorplayer-programs', JSON.stringify(programs));
            return { success: true, data: program };
        }
        catch (error) {
            return { success: false, error: 'Error guardando en localStorage' };
        }
    };
    ProgramService.prototype.updateLocalProgram = function (program) {
        try {
            var programs = this.getLocalPrograms();
            var index = programs.findIndex(function (p) { return p.id === program.id; });
            if (index >= 0) {
                programs[index] = program;
                localStorage.setItem('gestorplayer-programs', JSON.stringify(programs));
                return { success: true, data: program };
            }
            return { success: false, error: 'Programa no encontrado' };
        }
        catch (error) {
            return { success: false, error: 'Error actualizando en localStorage' };
        }
    };
    ProgramService.prototype.deleteLocalProgram = function (programId) {
        try {
            var programs = this.getLocalPrograms();
            var filtered = programs.filter(function (p) { return p.id !== programId; });
            localStorage.setItem('gestorplayer-programs', JSON.stringify(filtered));
            return { success: true };
        }
        catch (error) {
            return { success: false, error: 'Error eliminando de localStorage' };
        }
    };
    // Mapear datos de Supabase a nuestro tipo Program
    ProgramService.prototype.mapSupabaseToProgram = function (data) {
        var zones = Array.isArray(data.zones) ? data.zones : [];
        var totalContent = zones.reduce(function (sum, zone) {
            return sum + (Array.isArray(zone.content) ? zone.content.length : 0);
        }, 0);
        return {
            id: data.id,
            name: data.name,
            width: data.width,
            height: data.height,
            zones: zones,
            content: totalContent,
            lastModified: data.last_modified,
            createdAt: data.created_at,
            description: data.description
        };
    };
    // Sincronizar datos entre localStorage y Supabase
    ProgramService.prototype.syncData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var localPrograms, remotePrograms, _i, localPrograms_1, program, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isSupabaseEnabled)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        localPrograms = this.getLocalPrograms();
                        return [4 /*yield*/, supabase.from('programs').select('*')
                            // Si hay programas locales pero no remotos, subir locales
                        ];
                    case 2:
                        remotePrograms = (_a.sent()).data;
                        if (!(localPrograms.length > 0 && (!remotePrograms || remotePrograms.length === 0))) return [3 /*break*/, 6];
                        console.log('Sincronizando programas locales a Supabase...');
                        _i = 0, localPrograms_1 = localPrograms;
                        _a.label = 3;
                    case 3:
                        if (!(_i < localPrograms_1.length)) return [3 /*break*/, 6];
                        program = localPrograms_1[_i];
                        return [4 /*yield*/, this.createProgram(program)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_6 = _a.sent();
                        console.error('Error sincronizando datos:', error_6);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Limpiar todos los datos locales
    ProgramService.prototype.clearLocalData = function () {
        try {
            localStorage.removeItem('gestorplayer-programs');
            console.log('✅ Datos locales limpiados');
        }
        catch (error) {
            console.error('Error limpiando datos locales:', error);
        }
    };
    // Obtener estadísticas
    ProgramService.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var localPrograms, remoteCount, _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        localPrograms = this.getLocalPrograms();
                        remoteCount = 0;
                        if (!this.isSupabaseEnabled) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, supabase
                                .from('programs')
                                .select('id', { count: 'exact', head: true })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (!error) {
                            remoteCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error obteniendo estadísticas remotas:', error_7);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, {
                            total: Math.max(localPrograms.length, remoteCount),
                            local: localPrograms.length,
                            remote: remoteCount
                        }];
                }
            });
        });
    };
    return ProgramService;
}());
export { ProgramService };
