var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useCallback } from 'react';
import ProgramStorageService from '../services/programStorageService';
export var useProgramStorage = function () {
    var _a = useState([]), programs = _a[0], setPrograms = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(false), isLoaded = _c[0], setIsLoaded = _c[1];
    var programStorage = ProgramStorageService.getInstance();
    // Cargar programas desde localStorage al inicializar
    useEffect(function () {
        var loadPrograms = function () {
            try {
                setIsLoading(true);
                var loadedPrograms = programStorage.loadPrograms();
                setPrograms(loadedPrograms);
                setIsLoaded(true);
                console.log("".concat(loadedPrograms.length, " programas cargados desde localStorage"));
            }
            catch (error) {
                console.error('Error al cargar programas:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadPrograms();
    }, []);
    // Guardar programas en localStorage cada vez que cambien
    useEffect(function () {
        if (isLoaded && programs.length >= 0) {
            programStorage.savePrograms(programs);
        }
    }, [programs, isLoaded]);
    // Función para actualizar programas con persistencia automática
    var updatePrograms = useCallback(function (newPrograms) {
        setPrograms(function (prevPrograms) {
            var updatedPrograms = typeof newPrograms === 'function' ? newPrograms(prevPrograms) : newPrograms;
            return updatedPrograms;
        });
    }, []);
    // Función para agregar un programa
    var addProgram = useCallback(function (program) {
        setPrograms(function (prevPrograms) { return __spreadArray(__spreadArray([], prevPrograms, true), [program], false); });
    }, []);
    // Función para actualizar un programa específico
    var updateProgram = useCallback(function (updatedProgram) {
        setPrograms(function (prevPrograms) {
            return prevPrograms.map(function (p) { return p.id === updatedProgram.id ? updatedProgram : p; });
        });
    }, []);
    // Función para eliminar un programa
    var deleteProgram = useCallback(function (programId) {
        setPrograms(function (prevPrograms) { return prevPrograms.filter(function (p) { return p.id !== programId; }); });
    }, []);
    // Función para limpiar todos los programas
    var clearAllPrograms = useCallback(function () {
        programStorage.clearPrograms();
        setPrograms([]);
    }, []);
    // Función para exportar datos
    var exportData = useCallback(function () {
        return programStorage.exportData();
    }, []);
    // Función para importar datos
    var importData = useCallback(function (jsonData) {
        var success = programStorage.importData(jsonData);
        if (success) {
            // Recargar programas después de importar
            var loadedPrograms = programStorage.loadPrograms();
            setPrograms(loadedPrograms);
        }
        return success;
    }, []);
    // Función para descargar respaldo
    var downloadBackup = useCallback(function () {
        programStorage.downloadBackup();
    }, []);
    // Función para obtener información del almacenamiento
    var getStorageInfo = useCallback(function () {
        return programStorage.getStorageInfo();
    }, []);
    return {
        programs: programs,
        isLoading: isLoading,
        isLoaded: isLoaded,
        updatePrograms: updatePrograms,
        addProgram: addProgram,
        updateProgram: updateProgram,
        deleteProgram: deleteProgram,
        clearAllPrograms: clearAllPrograms,
        exportData: exportData,
        importData: importData,
        downloadBackup: downloadBackup,
        getStorageInfo: getStorageInfo
    };
};
