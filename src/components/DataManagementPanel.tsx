import React, { useState, useRef } from 'react';
import { useToast } from '../hooks/use-toast';
import ProgramStorageService from '../services/programStorageService';
import { Download, Upload, Trash2, Database, Info } from 'lucide-react';

interface DataManagementPanelProps {
  onDataImported?: () => void;
  onDataCleared?: () => void;
}

function DataManagementPanel({ onDataImported, onDataCleared }: DataManagementPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState(ProgramStorageService.getInstance().getStorageInfo());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccessToast, showErrorToast } = useToast();
  const programStorage = ProgramStorageService.getInstance();

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      programStorage.downloadBackup();
      showSuccessToast('Respaldo descargado exitosamente');
      updateStorageInfo();
    } catch (error) {
      showErrorToast('Error al exportar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const text = await file.text();
      const success = programStorage.importData(text);
      
      if (success) {
        showSuccessToast('Datos importados exitosamente');
        updateStorageInfo();
        onDataImported?.();
      } else {
        showErrorToast('Error al importar datos: formato inválido');
      }
    } catch (error) {
      showErrorToast('Error al leer el archivo');
    } finally {
      setIsLoading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar todos los programas guardados? Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
      try {
        setIsLoading(true);
        programStorage.clearPrograms();
        showSuccessToast('Todos los datos han sido eliminados');
        updateStorageInfo();
        onDataCleared?.();
      } catch (error) {
        showErrorToast('Error al eliminar datos');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateStorageInfo = () => {
    setStorageInfo(programStorage.getStorageInfo());
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <Database className="w-5 h-5 text-corporate-dark-blue" />
        <h2 className="text-xl font-semibold text-corporate-charcoal-gray">
          Gestión de Datos
        </h2>
      </div>

      {/* Información del almacenamiento */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-700">Información del Almacenamiento</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-corporate-dark-blue text-lg">
              {storageInfo.totalPrograms}
            </div>
            <div className="text-gray-600">Programas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-corporate-dark-blue text-lg">
              {storageInfo.storageSize}
            </div>
            <div className="text-gray-600">Tamaño</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-corporate-dark-blue text-lg">
              {storageInfo.lastModified}
            </div>
            <div className="text-gray-600">Última modificación</div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exportar datos */}
        <button
          onClick={handleExportData}
          disabled={isLoading || storageInfo.totalPrograms === 0}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isLoading || storageInfo.totalPrograms === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Exportar Datos</span>
        </button>

        {/* Importar datos */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            disabled={isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <button
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar Datos</span>
          </button>
        </div>

        {/* Limpiar datos */}
        <button
          onClick={handleClearData}
          disabled={isLoading || storageInfo.totalPrograms === 0}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isLoading || storageInfo.totalPrograms === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpiar Datos</span>
        </button>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Los datos se guardan automáticamente en el almacenamiento local de tu navegador. 
          Se recomienda exportar un respaldo regularmente para evitar pérdida de datos.
        </p>
      </div>
    </div>
  );
}

export default DataManagementPanel; 