import { useState } from 'react';
import { Program } from '../types/content';
import { MoreHorizontal, Edit2, Copy, Download, Trash2, Monitor, Grid } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface ProgramCardProps {
  program: Program;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (program: Program) => Promise<void>;
  onEditCanvas?: (program: Program) => void;
}

export default function ProgramCard({ program, onDelete, onUpdate, onEditCanvas }: ProgramCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(program.name);
  const [editDescription, setEditDescription] = useState(program.description || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${program.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(program.id);
      } catch (error) {
        console.error('Error deleting program:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedProgram = {
        ...program,
        name: editName.trim(),
        description: editDescription.trim(),
        lastModified: formatDate(new Date())
      };
      await onUpdate(updatedProgram);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating program:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      const duplicatedProgram = {
        ...program,
        id: Date.now().toString(),
        name: `${program.name} (Copia)`,
        createdAt: new Date().toISOString(),
        lastModified: formatDate(new Date())
      };
      await onUpdate(duplicatedProgram);
    } catch (error) {
      console.error('Error duplicating program:', error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(program, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${program.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const totalZones = program.zones?.length || 0;
  const totalContent = program.zones?.reduce((sum, zone) => sum + zone.content.length, 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-corporate-dark-blue to-corporate-deep-blue rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-corporate-charcoal-gray">
                {program.name}
              </h3>
              <p className="text-sm text-gray-500">
                {program.width} x {program.height} px
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowEditDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                
                {onEditCanvas && (
                  <button
                    onClick={() => {
                      onEditCanvas(program);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Grid className="w-4 h-4" />
                    <span>Editar Canvas</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicar</span>
                </button>
                
                <button
                  onClick={() => {
                    handleExport();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {program.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {program.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-corporate-light-blue/10 rounded-lg">
            <div className="text-2xl font-bold text-corporate-dark-blue">{totalZones}</div>
            <div className="text-xs text-corporate-charcoal-gray">Zonas</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalContent}</div>
            <div className="text-xs text-gray-600">Contenidos</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Creado: {formatDate(new Date(program.createdAt))}</span>
          <span>Modificado: {program.lastModified}</span>
        </div>
      </div>

      {/* Click fuera para cerrar menú */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Dialog de edición */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Editar Programa</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-corporate-dark-blue text-white rounded-md hover:bg-corporate-deep-blue"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 