import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Program } from './types/content';
import { ProgramService } from './services/programService';
import { setupSupabase, showManualSetupInstructions, CREATE_TABLE_SQL, RESET_SUPABASE_SQL } from './scripts/setupSupabase';
import { GlobalPlaybackService } from './services/globalPlaybackService';
import Index from './pages/Index';

// Hook simplificado para programas
function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const programService = ProgramService.getInstance();
  const globalPlaybackService = GlobalPlaybackService.getInstance();

  // Cargar programas al iniciar
  useEffect(() => {
    loadPrograms();
  }, []);

  // Inicializar servicio global cuando cambien los programas
  useEffect(() => {
    if (isLoaded && programs.length > 0) {
      console.log('🎬 Inicializando servicio global de reproducción automática...');
      globalPlaybackService.initializeWithPrograms(programs);
    } else if (isLoaded && programs.length === 0) {
      console.log('⏹️ No hay programas, deteniendo reproducción global');
      globalPlaybackService.stopGlobalPlayback();
    }
  }, [programs, isLoaded]);

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
        const updatedPrograms = programs.map(p => p.id === program.id ? result.data! : p);
        setPrograms(updatedPrograms);
        // Actualizar servicio global con los nuevos programas
        globalPlaybackService.updatePrograms(updatedPrograms);
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

  const [globalPlaybackStatus, setGlobalPlaybackStatus] = useState<{
    isRunning: boolean;
    activePrograms: number;
    activeZones: number;
    totalContent: number;
  }>({
    isRunning: false,
    activePrograms: 0,
    activeZones: 0,
    totalContent: 0
  });

  // Actualizar estado del servicio global cada 5 segundos
  useEffect(() => {
    const updateStatus = () => {
      const globalPlaybackService = GlobalPlaybackService.getInstance();
      const status = globalPlaybackService.getStatus();
      setGlobalPlaybackStatus(status);
    };

    updateStatus(); // Actualizar inmediatamente
    const interval = setInterval(updateStatus, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

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
      {/* Indicador de estado de reproducción global */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        <div className="flex items-center space-x-2 mb-2">
          {globalPlaybackStatus.isRunning ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">🎬 Contando en segundo plano</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">⏸️ Sistema detenido</span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Programas: {globalPlaybackStatus.activePrograms}</div>
          <div>Zonas activas: {globalPlaybackStatus.activeZones}</div>
          <div>Total contenido: {globalPlaybackStatus.totalContent}</div>
        </div>
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