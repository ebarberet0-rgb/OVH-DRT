import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icône de succès animée */}
          <div className="mb-6 animate-bounce">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" strokeWidth={2} />
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Merci ! 🎉
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-700 mb-6">
            Votre avis a bien été enregistré
          </p>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Nous vous remercions d'avoir pris le temps de partager votre expérience.
              Vos retours sont précieux et nous aident à améliorer continuellement
              nos événements Demo Ride Tour.
            </p>
          </div>

          {/* Statistiques ou information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yamaha-blue to-blue-600 rounded-lg p-4 text-white">
              <div className="text-3xl font-bold mb-1">🏍️</div>
              <p className="text-sm font-medium">Essayez d'autres modèles</p>
            </div>
            <div className="bg-gradient-to-br from-yamaha-red to-red-600 rounded-lg p-4 text-white">
              <div className="text-3xl font-bold mb-1">📍</div>
              <p className="text-sm font-medium">Trouvez un événement</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-3xl font-bold mb-1">💰</div>
              <p className="text-sm font-medium">Offres spéciales</p>
            </div>
          </div>

          {/* Call to action */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-yamaha-blue text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>

            <p className="text-sm text-gray-500">
              Vous souhaitez participer à un autre événement ?{' '}
              <button
                onClick={() => navigate('/booking')}
                className="text-yamaha-blue font-semibold hover:underline"
              >
                Réserver un essai
              </button>
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Suivez-nous sur les réseaux sociaux</p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.facebook.com/YamahaMotorFrance"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yamaha-blue hover:text-white transition-colors"
              >
                <span className="text-xl">f</span>
              </a>
              <a
                href="https://www.instagram.com/yamaha_motor_france"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yamaha-blue hover:text-white transition-colors"
              >
                <span className="text-xl">📷</span>
              </a>
              <a
                href="https://www.youtube.com/yamaha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yamaha-blue hover:text-white transition-colors"
              >
                <span className="text-xl">▶</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Yamaha Motor France - Tous droits réservés
        </p>
      </div>
    </div>
  );
}
