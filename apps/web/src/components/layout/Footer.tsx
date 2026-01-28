import { Link } from 'react-router-dom';
import { ArrowUp, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-yamaha-blue text-white">
      {/* Bannière légale obligatoire */}
      <div className="bg-gray-100 text-gray-800 py-3">
        <div className="container mx-auto px-4 text-center text-sm">
          Pour les trajets courts, privilégiez la marche ou le vélo.{' '}
          <span className="font-semibold">#SeDéplacerMoinsPolluer</span>
        </div>
      </div>

      {/* Contenu principal du footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section À propos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Yamaha Demo Ride Tour</h3>
            <p className="text-sm text-gray-300 mb-4">
              Découvrez la gamme complète de motos et scooters Yamaha lors d'essais sur route près de chez vous.
            </p>
            <img
              src="/images/logoYamaha_footer.png"
              alt="Yamaha Motor"
              className="h-8 opacity-75"
            />
          </div>

          {/* Section Liens */}
          <div>
            <h3 className="text-lg font-bold mb-4">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.yamaha-motor.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Site Yamaha Motor France
                </a>
              </li>
              <li>
                <a
                  href="https://www.yamaha-rent.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Yamaha Rent
                </a>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Contact & Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-bold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://www.facebook.com/YamahaMotorFrance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook Yamaha France"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/yamaha_motor_france"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram Yamaha France"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.youtube.com/user/YamahaMotorFrance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="YouTube Yamaha France"
              >
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Mentions légales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
          <div className="space-y-2">
            <p>© {new Date().getFullYear()} Yamaha Motor Europe N.V. Succ. France. Tous droits réservés.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link to="/confidentialite" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Politique de cookies
              </Link>
            </div>
          </div>

          {/* Bouton retour en haut */}
          <div className="flex justify-end">
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Retour en haut de page"
            >
              <span>Retour en haut</span>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
