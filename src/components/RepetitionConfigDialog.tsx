import { useState, useEffect } from 'react';
import { X, Settings, Infinity, Calendar } from 'lucide-react';
import { RepetitionService } from '../services/repetitionService';
import { MediaContent } from '../types/content';

interface RepetitionConfigDialogProps {
  content: MediaContent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contentId: string, limit: number, isUnlimited: boolean) => void;
}

export function RepetitionConfigDialog({ 
  content, 
  isOpen, 
  onClose, 
  onSave 
}: RepetitionConfigDialogProps) {
  const [dailyLimit, setDailyLimit] = useState(5);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [playbackInfo, setPlaybackInfo] = useState({ played: 0, limit: -1, canPlay: true, isUnlimited: true });

  const repetitionService = RepetitionService.getInstance();

  useEffect(() => {
    if (isOpen && content) {
      // Cargar configuración actual
      const info = repetitionService.getPlaybackInfo(content.id);
      setPlaybackInfo(info);
      setIsUnlimited(info.isUnlimited);
      setDailyLimit(info.limit > 0 ? info.limit : 5);
    }
  }, [isOpen, content, repetitionService]);

  const handleSave = () => {
    const finalLimit = isUnlimited ? -1 : dailyLimit;
    repetitionService.setDailyLimit(content.id, finalLimit, isUnlimited);
    onSave(content.id, finalLimit, isUnlimited);
    onClose();
  };

  const handleUnlimitedToggle = (unlimited: boolean) => {
    setIsUnlimited(unlimited);
    if (unlimited) {
      setDailyLimit(5); // Valor por defecto cuando vuelve a limitado
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-corporate-dark-blue rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-corporate-charcoal-gray">
                Configurar Repeticiones
              </h2>
              <p className="text-sm text-gray-500">
                {content.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado actual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-corporate-dark-blue" />
              Estado Actual
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reproducido hoy:</span>
                <span className="font-medium text-gray-900">
                  {playbackInfo.played} {playbackInfo.isUnlimited ? '' : `de ${playbackInfo.limit}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${playbackInfo.canPlay ? 'text-green-600' : 'text-red-600'}`}>
                  {playbackInfo.canPlay ? 'Disponible' : 'Límite alcanzado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Configuración:</span>
                <span className="font-medium text-gray-900">
                  {playbackInfo.isUnlimited ? 'Ilimitado' : `${playbackInfo.limit} por día`}
                </span>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Nueva Configuración</h3>
            
            {/* Opciones de repetición */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="repetition-type"
                  checked={!isUnlimited}
                  onChange={() => handleUnlimitedToggle(false)}
                  className="w-4 h-4 text-corporate-dark-blue border-gray-300 focus:ring-corporate-dark-blue"
                />
                <span className="text-gray-700">Repeticiones limitadas por día</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="repetition-type"
                  checked={isUnlimited}
                  onChange={() => handleUnlimitedToggle(true)}
                  className="w-4 h-4 text-corporate-dark-blue border-gray-300 focus:ring-corporate-dark-blue"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Repeticiones ilimitadas</span>
                  <Infinity className="w-4 h-4 text-corporate-dark-blue" />
                </div>
              </label>
            </div>

            {/* Input de límite diario */}
            {!isUnlimited && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Repeticiones por día
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">veces por día</span>
                </div>
                <p className="text-xs text-gray-500">
                  El contenido se reproducirá máximo {dailyLimit} veces al día
                </p>
              </div>
            )}

            {/* Mensaje para ilimitado */}
            {isUnlimited && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <Infinity className="w-4 h-4 inline mr-1" />
                  Este contenido se reproducirá sin límites durante todo el día
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-corporate-dark-blue text-white rounded-lg hover:bg-corporate-deep-blue transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
} 