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
// SQL para crear la tabla de programas (versión limpia)
export var CREATE_TABLE_SQL = "\n-- Crear tabla de programas desde cero\nCREATE TABLE public.programs (\n    id TEXT PRIMARY KEY,\n    name TEXT NOT NULL,\n    width INTEGER NOT NULL,\n    height INTEGER NOT NULL,\n    zones JSONB DEFAULT '[]'::jsonb,\n    content INTEGER DEFAULT 0,\n    last_modified TEXT,\n    description TEXT,\n    created_at TIMESTAMPTZ DEFAULT now()\n);\n\n-- Habilitar Row Level Security (RLS)\nALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;\n\n-- Crear pol\u00EDtica para permitir todas las operaciones\nCREATE POLICY \"Allow all operations\" ON public.programs\n    FOR ALL USING (true);\n\n-- Crear \u00EDndice para mejorar rendimiento\nCREATE INDEX idx_programs_created_at ON public.programs(created_at);\n\n-- Verificar que la tabla se cre\u00F3 correctamente\nSELECT * FROM public.programs;\n";
// SQL para limpiar todo (eliminar tabla actual)
export var RESET_SUPABASE_SQL = "\n-- Eliminar la tabla programs si existe\nDROP TABLE IF EXISTS public.programs CASCADE;\n\n-- Eliminar pol\u00EDticas RLS si existen  \nDROP POLICY IF EXISTS \"Allow all operations\" ON public.programs;\n";
export function setupSupabase() {
    return __awaiter(this, void 0, void 0, function () {
        var authError, tableError, testId, insertError, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔧 Verificando configuración de Supabase...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    authError = (_a.sent()).error;
                    if (authError) {
                        console.warn('⚠️  Problema de autenticación:', authError);
                    }
                    return [4 /*yield*/, supabase
                            .from('programs')
                            .select('count')
                            .limit(1)];
                case 3:
                    tableError = (_a.sent()).error;
                    if (tableError) {
                        if (tableError.code === 'PGRST116') {
                            // Tabla no existe
                            console.warn('⚠️  La tabla "programs" no existe');
                            console.log('📋 Necesitas crear la tabla manualmente en tu dashboard de Supabase');
                            console.log('🔗 Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
                            console.log('💡 Ejecuta este SQL:');
                            console.log(CREATE_TABLE_SQL);
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'La tabla "programs" no existe. Créala manualmente.',
                                    sql: CREATE_TABLE_SQL,
                                    needsManualSetup: true
                                }];
                        }
                        else {
                            console.error('❌ Error accediendo a la tabla:', tableError);
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Error de base de datos: ".concat(tableError.message),
                                    code: tableError.code
                                }];
                        }
                    }
                    console.log('✅ Conexión a Supabase exitosa');
                    console.log('✅ Tabla "programs" existe y es accesible');
                    testId = 'test-connection-' + Date.now();
                    return [4 /*yield*/, supabase
                            .from('programs')
                            .insert([{
                                id: testId,
                                name: 'Test Connection',
                                width: 1920,
                                height: 1080,
                                zones: [],
                                content: 0,
                                last_modified: new Date().toISOString(),
                                description: 'Test program',
                                created_at: new Date().toISOString()
                            }])];
                case 4:
                    insertError = (_a.sent()).error;
                    if (!insertError) return [3 /*break*/, 6];
                    console.warn('⚠️  No se pueden insertar datos:', insertError);
                    // Intentar eliminar el registro de prueba si se creó
                    return [4 /*yield*/, supabase.from('programs').delete().eq('id', testId)];
                case 5:
                    // Intentar eliminar el registro de prueba si se creó
                    _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: 'Sin permisos de escritura. Verifica las políticas RLS.',
                            permissions: false
                        }];
                case 6: 
                // Limpiar registro de prueba
                return [4 /*yield*/, supabase.from('programs').delete().eq('id', testId)];
                case 7:
                    // Limpiar registro de prueba
                    _a.sent();
                    console.log('✅ Permisos de escritura verificados');
                    console.log('✅ Configuración de Supabase completada');
                    return [2 /*return*/, {
                            success: true,
                            message: 'Supabase configurado correctamente'
                        }];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ Error general:', error_1);
                    return [2 /*return*/, {
                            success: false,
                            error: 'Error inesperado durante la configuración',
                            details: error_1
                        }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Mostrar instrucciones para configuración manual
export function showManualSetupInstructions() {
    console.log('📋 INSTRUCCIONES DE CONFIGURACIÓN MANUAL:');
    console.log('1. Ve a tu dashboard de Supabase');
    console.log('2. Navega a: SQL Editor');
    console.log('3. Ejecuta el siguiente SQL:');
    console.log(CREATE_TABLE_SQL);
    console.log('4. Recarga la aplicación');
}
// Ejecutar si es llamado directamente
if (typeof window === 'undefined') {
    setupSupabase().then(function (result) {
        console.log('Resultado:', result);
        process.exit(result.success ? 0 : 1);
    });
}
