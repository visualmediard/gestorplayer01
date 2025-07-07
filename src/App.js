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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ProgramService } from './services/programService';
import { GlobalPlaybackService } from './services/globalPlaybackService';
import Index from './pages/Index';
import DesktopProgramSelector from './components/DesktopProgramSelector';
// Hook simplificado para programas
function usePrograms() {
    var _this = this;
    var _a = useState([]), programs = _a[0], setPrograms = _a[1];
    var _b = useState(false), isLoaded = _b[0], setIsLoaded = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var programService = ProgramService.getInstance();
    var globalPlaybackService = GlobalPlaybackService.getInstance();
    // Cargar programas al iniciar
    useEffect(function () {
        loadPrograms();
    }, []);
    // Inicializar servicio global cuando cambien los programas
    useEffect(function () {
        if (isLoaded && programs.length > 0) {
            console.log('🎬 Inicializando servicio global de reproducción automática...');
            globalPlaybackService.initializeWithPrograms(programs);
        }
        else if (isLoaded && programs.length === 0) {
            console.log('⏹️ No hay programas, deteniendo reproducción global');
            globalPlaybackService.stopGlobalPlayback();
        }
    }, [programs, isLoaded]);
    var loadPrograms = function () { return __awaiter(_this, void 0, void 0, function () {
        var loadedPrograms, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    console.log('🔄 Cargando programas...');
                    return [4 /*yield*/, programService.getPrograms()];
                case 1:
                    loadedPrograms = _a.sent();
                    console.log('✅ Programas cargados:', loadedPrograms.length);
                    setPrograms(loadedPrograms);
                    setError(null);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Error cargando programas:', error_1);
                    setError('Error al cargar programas');
                    setPrograms([]); // Fallback a array vacío
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoaded(true);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var createProgram = function (program) { return __awaiter(_this, void 0, void 0, function () {
        var result_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🔄 Creando programa:', program.name);
                    return [4 /*yield*/, programService.createProgram(program)];
                case 1:
                    result_1 = _a.sent();
                    if (result_1.success && result_1.data) {
                        setPrograms(function (prev) { return __spreadArray(__spreadArray([], prev, true), [result_1.data], false); });
                        console.log('✅ Programa creado');
                        return [2 /*return*/, result_1.data];
                    }
                    throw new Error(result_1.error || 'Error creando programa');
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Error:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var updateProgram = function (program) { return __awaiter(_this, void 0, void 0, function () {
        var result_2, updatedPrograms, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🔄 Actualizando programa:', program.name);
                    return [4 /*yield*/, programService.updateProgram(program)];
                case 1:
                    result_2 = _a.sent();
                    if (result_2.success && result_2.data) {
                        updatedPrograms = programs.map(function (p) { return p.id === program.id ? result_2.data : p; });
                        setPrograms(updatedPrograms);
                        // Actualizar servicio global con los nuevos programas
                        globalPlaybackService.updatePrograms(updatedPrograms);
                        console.log('✅ Programa actualizado');
                        return [2 /*return*/, result_2.data];
                    }
                    throw new Error(result_2.error || 'Error actualizando programa');
                case 2:
                    error_3 = _a.sent();
                    console.error('❌ Error:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var deleteProgram = function (programId) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🔄 Eliminando programa:', programId);
                    return [4 /*yield*/, programService.deleteProgram(programId)];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        setPrograms(function (prev) { return prev.filter(function (p) { return p.id !== programId; }); });
                        console.log('✅ Programa eliminado');
                        return [2 /*return*/];
                    }
                    throw new Error(result.error || 'Error eliminando programa');
                case 2:
                    error_4 = _a.sent();
                    console.error('❌ Error:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return {
        programs: programs,
        isLoaded: isLoaded,
        error: error,
        createProgram: createProgram,
        updateProgram: updateProgram,
        deleteProgram: deleteProgram
    };
}
function isElectron() {
    // Detección básica de Electron
    return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
}
function App() {
    if (isElectron()) {
        return <DesktopProgramSelector />;
    }
    var _a = usePrograms(), programs = _a.programs, isLoaded = _a.isLoaded, error = _a.error, createProgram = _a.createProgram, updateProgram = _a.updateProgram, deleteProgram = _a.deleteProgram;
    var _b = useState({
        isRunning: false,
        activePrograms: 0,
        activeZones: 0,
        totalContent: 0
    }), globalPlaybackStatus = _b[0], setGlobalPlaybackStatus = _b[1];
    // Actualizar estado del servicio global cada 5 segundos
    useEffect(function () {
        var updateStatus = function () {
            var globalPlaybackService = GlobalPlaybackService.getInstance();
            var status = globalPlaybackService.getStatus();
            setGlobalPlaybackStatus(status);
        };
        updateStatus(); // Actualizar inmediatamente
        var interval = setInterval(updateStatus, 5000); // Actualizar cada 5 segundos
        return function () { return clearInterval(interval); };
    }, []);
    console.log('🎯 App renderizando:', { isLoaded: isLoaded, programsCount: programs.length, error: error });
    // Mostrar loading mientras se cargan los datos
    if (!isLoaded) {
        return (<div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando aplicación...</p>
          {error && (<p className="text-red-500 text-sm mt-2">Error: {error}</p>)}
        </div>
      </div>);
    }
    // Mostrar error si hay problemas
    if (error) {
        return (<div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error en la aplicación</h1>
          <p className="text-red-500">{error}</p>
          <button onClick={function () { return window.location.reload(); }} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Recargar Página
          </button>
        </div>
      </div>);
    }
    // Aplicación principal
    return (<div className="min-h-screen bg-gray-50">
      {/* Indicador de estado de reproducción global */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        <div className="flex items-center space-x-2 mb-2">
          {globalPlaybackStatus.isRunning ? (<>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">🎬 Contando en segundo plano</span>
            </>) : (<>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">⏸️ Sistema detenido</span>
            </>)}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Programas: {globalPlaybackStatus.activePrograms}</div>
          <div>Zonas activas: {globalPlaybackStatus.activeZones}</div>
          <div>Total contenido: {globalPlaybackStatus.totalContent}</div>
        </div>
      </div>

      <Index programs={programs} onCreateProgram={createProgram} onUpdateProgram={updateProgram} onDeleteProgram={deleteProgram}/>
      <Toaster position="top-right"/>
    </div>);
}
export default App;
