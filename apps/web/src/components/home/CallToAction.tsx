import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-yamaha-blue to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Titre */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            PRÊT À VIVRE L'EXPÉRIENCE ?
          </h2>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            À très vite au pied du camion ! 🏍️
          </p>

          {/* CTA Button */}
          <Link
            to="/reserver"
            className="inline-flex items-center space-x-2 px-10 py-5 bg-yamaha-red text-white font-bold text-lg rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>DÉCOUVRIR LES ÉVÉNEMENTS</span>
            <ArrowRight size={24} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
