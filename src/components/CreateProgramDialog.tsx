import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface CreateProgramDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProgram: (name: string, width: number, height: number) => Promise<void>;
  isLoading?: boolean;
}

function CreateProgramDialog({ 
  isOpen, 
  onClose, 
  onCreateProgram, 
  isLoading = false 
}: CreateProgramDialogProps) {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateProgram(name.trim(), width, height);
      // Reset form
      setName('');
      setWidth(1920);
      setHeight(1080);
    } catch (error) {
      console.error('Error creating program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    setName('');
    setWidth(1920);
    setHeight(1080);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-corporate-charcoal-gray">
            Crear Nuevo Programa
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
              Nombre del Programa
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent disabled:opacity-50"
              placeholder="Ej: Programa Principal"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="width" className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                Ancho (px)
              </label>
              <input
                type="number"
                id="width"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                disabled={isSubmitting || isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent disabled:opacity-50"
                min="1"
                required
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-corporate-charcoal-gray mb-2">
                Alto (px)
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                disabled={isSubmitting || isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue focus:border-transparent disabled:opacity-50"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 text-corporate-charcoal-gray border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting || isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-corporate-dark-blue text-white rounded-md hover:bg-corporate-deep-blue disabled:opacity-50"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Crear Programa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProgramDialog; 