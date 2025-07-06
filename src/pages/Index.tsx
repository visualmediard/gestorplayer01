import { useState, useEffect } from 'react';
import { Program } from '../types/content';
import ProgramCard from '../components/ProgramCard';
import CreateProgramDialog from '../components/CreateProgramDialog';
import CanvasEditor from '../components/CanvasEditor';
import StatsPanel from '../components/StatsPanel';
import ReproductionStatsCard from '../components/ReproductionStatsCard';
import { useToast } from '../hooks/use-toast';
import { generateId, formatDate } from '../lib/utils';
import { Plus, BarChart3, Layout } from 'lucide-react';

interface IndexProps {
  programs: Program[];
  onCreateProgram: (program: Program) => Promise<Program>;
  onUpdateProgram: (program: Program) => Promise<Program>;
  onDeleteProgram: (programId: string) => Promise<void>;
}

function Index({ programs, onCreateProgram, onUpdateProgram, onDeleteProgram }: IndexProps) {
  const [activeTab, setActiveTab] = useState<'programs' | 'stats'>('programs');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCanvasEditor, setShowCanvasEditor] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();

  // Notificar cuando se guarden los programas automáticamente
  useEffect(() => {
    if (programs.length > 0) {
      const timeoutId = setTimeout(() => {
        console.log('Programas guardados automáticamente');
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [programs]);

  const handleCreateProgram = async (name: string, width: number, height: number) => {
    setIsLoading(true);
    try {
      const newProgram: Program = {
        id: generateId(),
        name,
        width,
        height,
        zones: [], // Empezar con zonas vacías
        content: 0,
        lastModified: formatDate(new Date()),
        createdAt: new Date().toISOString(),
        description: `Programa ${name} - ${width}x${height}px`
      };

      await onCreateProgram(newProgram);
      setShowCreateDialog(false);
      showSuccessToast(`Programa "${name}" creado y guardado`);
    } catch (error) {
      console.error('Error creating program:', error);
      showErrorToast('Error al crear el programa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    setIsLoading(true);
    try {
      await onDeleteProgram(programId);
      showSuccessToast(`Programa "${program.name}" eliminado`);
    } catch (error) {
      console.error('Error deleting program:', error);
      showErrorToast('Error al eliminar el programa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgram = async (updatedProgram: Program) => {
    setIsLoading(true);
    try {
      await onUpdateProgram(updatedProgram);
      showSuccessToast(`Programa "${updatedProgram.name}" actualizado`);
    } catch (error) {
      console.error('Error updating program:', error);
      showErrorToast('Error al actualizar el programa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCanvas = (program: Program) => {
    setCurrentProgram(program);
    setShowCanvasEditor(true);
  };

  const handleCloseCanvasEditor = () => {
    setShowCanvasEditor(false);
    setCurrentProgram(null);
  };

  const totalZones = programs.reduce((sum, program) => sum + (program.zones?.length || 0), 0);
  const totalContent = programs.reduce((sum, program) => sum + (program.content || 0), 0);

  return (
    <div className="min-h-screen bg-corporate-smoke-white">
      {/* Hero Section */}
      <div className="gradient-corporate-primary py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow">
            GestorPlayer
          </h1>
          <p className="text-xl text-corporate-light-blue mb-8 max-w-2xl mx-auto">
            Sistema de gestión de programas de publicidad exterior con editor de canvas y zonas
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Layout className="w-8 h-8 text-corporate-light-blue" />
              </div>
              <div className="text-3xl font-bold text-white">{programs.length}</div>
              <div className="text-corporate-light-blue">Programas</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-corporate-light-blue rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white rounded"></div>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{totalZones}</div>
              <div className="text-corporate-light-blue">Zonas</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-8 h-8 text-corporate-light-blue" />
              </div>
              <div className="text-3xl font-bold text-white">{totalContent}</div>
              <div className="text-corporate-light-blue">Contenidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'programs'
                  ? 'bg-corporate-dark-blue text-white'
                  : 'text-corporate-charcoal-gray hover:text-corporate-dark-blue'
              }`}
            >
              Programas
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-corporate-dark-blue text-white'
                  : 'text-corporate-charcoal-gray hover:text-corporate-dark-blue'
              }`}
            >
              Estadísticas
            </button>
          </div>

          {activeTab === 'programs' && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center space-x-2 bg-corporate-dark-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-corporate-deep-blue transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Programa</span>
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'programs' ? (
          <div className="space-y-6">
            {programs.length === 0 ? (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-corporate-charcoal-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-corporate-charcoal-gray mb-2">
                  No hay programas creados
                </h3>
                <p className="text-corporate-charcoal-gray mb-6">
                  Crea tu primer programa para comenzar a diseñar canvas con zonas multimedia
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-corporate-dark-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-corporate-deep-blue transition-colors"
                >
                  Crear Primer Programa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    onDelete={handleDeleteProgram}
                    onUpdate={handleUpdateProgram}
                    onEditCanvas={handleEditCanvas}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <ReproductionStatsCard />
            <StatsPanel />
          </div>
        )}
      </div>

      {/* Create Program Dialog */}
      <CreateProgramDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateProgram={handleCreateProgram}
        isLoading={isLoading}
      />

      {/* Canvas Editor */}
      {showCanvasEditor && currentProgram && (
        <CanvasEditor
          program={currentProgram}
          onUpdateProgram={handleUpdateProgram}
          onClose={handleCloseCanvasEditor}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporate-dark-blue mx-auto mb-4"></div>
            <p className="text-corporate-charcoal-gray">Procesando...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index; 