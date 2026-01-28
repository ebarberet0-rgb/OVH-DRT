import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-yamaha-blue mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-yamaha-blue text-white font-semibold rounded-full hover:bg-opacity-90 transition-all"
          >
            <Home size={20} />
            <span>Retour à l'accueil</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 border-2 border-yamaha-blue text-yamaha-blue font-semibold rounded-full hover:bg-yamaha-blue hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
            <span>Page précédente</span>
          </button>
        </div>
      </div>
    </div>
  );
}
