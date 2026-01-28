import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const [showText, setShowText] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Afficher le texte après un délai
    const timer = setTimeout(() => {
      setShowText(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  const handleReservation = () => {
    navigate('/reserver');
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Vidéo de fond */}
      <div className="absolute inset-0">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          {/* Fallback image si la vidéo ne charge pas */}
          <img
            src="/images/hero-fallback.jpg"
            alt="Yamaha Demo Ride Tour"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Overlay gradient dynamique */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Contenu texte */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Phrase d'accroche avec animation subtile */}
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Faites un tour au{' '}
              <span className="text-yamaha-red inline-block">
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Démo Ride Tour
                </motion.span>
              </span>
              .
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Essayez gratuitement les dernières motos Yamaha près de chez vous
            </motion.p>

            {/* CTA Button avec effet glow */}
            <motion.button
              onClick={handleReservation}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5, type: 'spring', stiffness: 200 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)'
              }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-flex items-center px-10 py-5 bg-yamaha-red text-white font-bold text-lg rounded-full hover:bg-red-700 transition-all duration-300 shadow-2xl group overflow-hidden"
            >
              {/* Effet de brillance au survol */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">Je réserve un essai</span>
              <motion.span
                className="relative z-10 ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </motion.button>
          </motion.div>
        )}

        {/* Scroll indicator amélioré */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white flex flex-col items-center gap-2 group"
          aria-label="Scroll down"
        >
          <span className="text-sm uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
            Découvrir
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ChevronDown size={32} className="group-hover:text-yamaha-red transition-colors" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
