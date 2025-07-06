import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-corporate-smoke-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-corporate-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-white">404</span>
          </div>
          <h1 className="text-3xl font-bold text-corporate-dark-blue mb-2">
            Página no encontrada
          </h1>
          <p className="text-corporate-charcoal-gray mb-8">
            La página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2 bg-corporate-dark-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-corporate-deep-blue transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver Atrás</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center space-x-2 bg-white text-corporate-dark-blue border border-corporate-dark-blue px-6 py-3 rounded-lg font-medium hover:bg-corporate-light-blue/10 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Ir al Inicio</span>
          </button>
        </div>

        <div className="mt-8 text-sm text-corporate-charcoal-gray">
          <p>¿Necesitas ayuda?</p>
          <p>Contacta al administrador del sistema</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound; 