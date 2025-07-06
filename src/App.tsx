import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Program } from './types/content';
import { ProgramService } from './services/programService';
import { setupSupabase, showManualSetupInstructions, CREATE_TABLE_SQL, RESET_SUPABASE_SQL } from './scripts/setupSupabase';
import Index from './pages/Index';

// Hook simplificado para programas
function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const programService = ProgramService.getInstance();

  // Cargar programas al iniciar
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      console.log('🔄 Cargando programas...');
      const loadedPrograms = await programService.getPrograms();
      console.log('✅ Programas cargados:', loadedPrograms.length);
      setPrograms(loadedPrograms);
      setError(null);
    } catch (error) {
      console.error('❌ Error cargando programas:', error);
      setError('Error al cargar programas');
      setPrograms([]); // Fallback a array vacío
    } finally {
      setIsLoaded(true);
    }
  };

  const createProgram = async (program: Program) => {
    try {
      console.log('🔄 Creando programa:', program.name);
      const result = await programService.createProgram(program);
      if (result.success && result.data) {
        setPrograms(prev => [...prev, result.data!]);
        console.log('✅ Programa creado');
        return result.data;
      }
      throw new Error(result.error || 'Error creando programa');
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  };

  const updateProgram = async (program: Program) => {
    try {
      console.log('🔄 Actualizando programa:', program.name);
      const result = await programService.updateProgram(program);
      if (result.success && result.data) {
        setPrograms(prev => prev.map(p => p.id === program.id ? result.data! : p));
        console.log('✅ Programa actualizado');
        return result.data;
      }
      throw new Error(result.error || 'Error actualizando programa');
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  };

  const deleteProgram = async (programId: string) => {
    try {
      console.log('🔄 Eliminando programa:', programId);
      const result = await programService.deleteProgram(programId);
      if (result.success) {
        setPrograms(prev => prev.filter(p => p.id !== programId));
        console.log('✅ Programa eliminado');
        return;
      }
      throw new Error(result.error || 'Error eliminando programa');
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  };

  return { 
    programs, 
    isLoaded, 
    error,
    createProgram,
    updateProgram,
    deleteProgram
  };
}

function App() {
  const { 
    programs, 
    isLoaded, 
    error,
    createProgram,
    updateProgram,
    deleteProgram
  } = usePrograms();

  console.log('🎯 App renderizando:', { isLoaded, programsCount: programs.length, error });

  // Mostrar loading mientras se cargan los datos
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando aplicación...</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">Error: {error}</p>
          )}
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error en la aplicación</h1>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  // Aplicación principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Indicador de estado */}
      <div className="fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        ✅ Sistema activo
      </div>

      <Index 
        programs={programs} 
        onCreateProgram={createProgram}
        onUpdateProgram={updateProgram}
        onDeleteProgram={deleteProgram}
      />
      <Toaster position="top-right" />
    </div>
  );
}

export default App; 