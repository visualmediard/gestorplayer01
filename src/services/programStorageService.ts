import { Program } from '../types/content';

const STORAGE_KEY = 'gestorplayer-programs';

class ProgramStorageService {
  private static instance: ProgramStorageService;

  private constructor() {}

  static getInstance(): ProgramStorageService {
    if (!ProgramStorageService.instance) {
      ProgramStorageService.instance = new ProgramStorageService();
    }
    return ProgramStorageService.instance;
  }

  // Cargar programas desde localStorage
  loadPrograms(): Program[] {
    try {
      const savedPrograms = localStorage.getItem(STORAGE_KEY);
      if (savedPrograms) {
        const programs = JSON.parse(savedPrograms);
        console.log('Programas cargados desde localStorage:', programs);
        return programs;
      }
      return [];
    } catch (error) {
      console.error('Error al cargar programas desde localStorage:', error);
      return [];
    }
  }

  // Guardar programas en localStorage
  savePrograms(programs: Program[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
      console.log('Programas guardados en localStorage:', programs);
    } catch (error) {
      console.error('Error al guardar programas en localStorage:', error);
    }
  }

  // Guardar un programa específico
  saveProgram(program: Program, programs: Program[]): Program[] {
    try {
      const existingIndex = programs.findIndex(p => p.id === program.id);
      let updatedPrograms: Program[];
      
      if (existingIndex !== -1) {
        // Actualizar programa existente
        updatedPrograms = [...programs];
        updatedPrograms[existingIndex] = program;
      } else {
        // Agregar nuevo programa
        updatedPrograms = [...programs, program];
      }
      
      this.savePrograms(updatedPrograms);
      return updatedPrograms;
    } catch (error) {
      console.error('Error al guardar programa:', error);
      return programs;
    }
  }

  // Eliminar un programa
  deleteProgram(programId: string, programs: Program[]): Program[] {
    try {
      const updatedPrograms = programs.filter(p => p.id !== programId);
      this.savePrograms(updatedPrograms);
      return updatedPrograms;
    } catch (error) {
      console.error('Error al eliminar programa:', error);
      return programs;
    }
  }

  // Limpiar todos los programas
  clearPrograms(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Todos los programas han sido eliminados del localStorage');
    } catch (error) {
      console.error('Error al limpiar programas:', error);
    }
  }

  // Exportar todos los datos como JSON
  exportData(): string {
    try {
      const programs = this.loadPrograms();
      const exportData = {
        programs,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      return '';
    }
  }

  // Importar datos desde JSON
  importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validar estructura de datos
      if (!importData.programs || !Array.isArray(importData.programs)) {
        console.error('Formato de datos inválido');
        return false;
      }

      // Guardar programas importados
      this.savePrograms(importData.programs);
      console.log(`${importData.programs.length} programas importados exitosamente`);
      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  }

  // Descargar archivo de respaldo
  downloadBackup(): void {
    try {
      const exportData = this.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gestorplayer-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar respaldo:', error);
    }
  }

  // Obtener información del almacenamiento
  getStorageInfo(): { totalPrograms: number; storageSize: string; lastModified: string } {
    try {
      const programs = this.loadPrograms();
      const storageData = localStorage.getItem(STORAGE_KEY);
      const storageSize = storageData ? (new Blob([storageData]).size / 1024).toFixed(2) + ' KB' : '0 KB';
      const lastModified = programs.length > 0 
        ? Math.max(...programs.map(p => new Date(p.lastModified).getTime()))
        : 0;
      
      return {
        totalPrograms: programs.length,
        storageSize,
        lastModified: lastModified > 0 ? new Date(lastModified).toLocaleString() : 'Nunca'
      };
    } catch (error) {
      console.error('Error al obtener información del almacenamiento:', error);
      return {
        totalPrograms: 0,
        storageSize: '0 KB',
        lastModified: 'Error'
      };
    }
  }
}

export default ProgramStorageService; 