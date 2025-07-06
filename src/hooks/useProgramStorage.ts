import { useState, useEffect, useCallback } from 'react';
import { Program } from '../types/content';
import ProgramStorageService from '../services/programStorageService';

export const useProgramStorage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const programStorage = ProgramStorageService.getInstance();

  // Cargar programas desde localStorage al inicializar
  useEffect(() => {
    const loadPrograms = () => {
      try {
        setIsLoading(true);
        const loadedPrograms = programStorage.loadPrograms();
        setPrograms(loadedPrograms);
        setIsLoaded(true);
        console.log(`${loadedPrograms.length} programas cargados desde localStorage`);
      } catch (error) {
        console.error('Error al cargar programas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, []);

  // Guardar programas en localStorage cada vez que cambien
  useEffect(() => {
    if (isLoaded && programs.length >= 0) {
      programStorage.savePrograms(programs);
    }
  }, [programs, isLoaded]);

  // Función para actualizar programas con persistencia automática
  const updatePrograms = useCallback((newPrograms: Program[] | ((prev: Program[]) => Program[])) => {
    setPrograms(prevPrograms => {
      const updatedPrograms = typeof newPrograms === 'function' ? newPrograms(prevPrograms) : newPrograms;
      return updatedPrograms;
    });
  }, []);

  // Función para agregar un programa
  const addProgram = useCallback((program: Program) => {
    setPrograms(prevPrograms => [...prevPrograms, program]);
  }, []);

  // Función para actualizar un programa específico
  const updateProgram = useCallback((updatedProgram: Program) => {
    setPrograms(prevPrograms => 
      prevPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p)
    );
  }, []);

  // Función para eliminar un programa
  const deleteProgram = useCallback((programId: string) => {
    setPrograms(prevPrograms => prevPrograms.filter(p => p.id !== programId));
  }, []);

  // Función para limpiar todos los programas
  const clearAllPrograms = useCallback(() => {
    programStorage.clearPrograms();
    setPrograms([]);
  }, []);

  // Función para exportar datos
  const exportData = useCallback(() => {
    return programStorage.exportData();
  }, []);

  // Función para importar datos
  const importData = useCallback((jsonData: string) => {
    const success = programStorage.importData(jsonData);
    if (success) {
      // Recargar programas después de importar
      const loadedPrograms = programStorage.loadPrograms();
      setPrograms(loadedPrograms);
    }
    return success;
  }, []);

  // Función para descargar respaldo
  const downloadBackup = useCallback(() => {
    programStorage.downloadBackup();
  }, []);

  // Función para obtener información del almacenamiento
  const getStorageInfo = useCallback(() => {
    return programStorage.getStorageInfo();
  }, []);

  return {
    programs,
    isLoading,
    isLoaded,
    updatePrograms,
    addProgram,
    updateProgram,
    deleteProgram,
    clearAllPrograms,
    exportData,
    importData,
    downloadBackup,
    getStorageInfo
  };
}; 