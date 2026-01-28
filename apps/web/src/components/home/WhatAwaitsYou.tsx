import { motion, useScroll, useTransform } from 'framer-motion';
import { Truck, Users, Calendar, Bike, Clock, Shield } from 'lucide-react';
import { useRef } from 'react';

const features = [
  {
    icon: Truck,
    title: 'Un camion qui traverse la France',
    description: 'Notre camion sillonne toute la France pour vous faire essayer la gamme Yamaha près de chez vous.',
    color: 'from-blue-500 to-blue-600',
    delay: 0,
  },
  {
    icon: Calendar,
    title: '18 dates en France',
    description: 'Des événements en concessions et lors de rassemblements motos grand public partout en France.',
    color: 'from-purple-500 to-purple-600',
    delay: 0.1,
  },
  {
    icon: Bike,
    title: '20 modèles disponibles',
    description: 'Motos et scooters Yamaha, accessibles aux permis A1, A2 et A. Il y en a pour tous les goûts !',
    color: 'from-red-500 to-red-600',
    delay: 0.2,
  },
  {
    icon: Clock,
    title: '45 minutes d\'essai',
    description: 'Prenez le temps de découvrir votre future moto lors d\'un essai routier complet de 45 minutes.',
    color: 'from-green-500 to-green-600',
    delay: 0.3,
  },
  {
    icon: Users,
    title: 'Une équipe d\'experts',
    description: 'Des professionnels passionnés prêts à vous faire vivre une expérience unique et vous conseiller.',
    color: 'from-orange-500 to-orange-600',
    delay: 0.4,
  },
  {
    icon: Shield,
    title: 'Gilets airbag Ixon',
    description: 'Possibilité d\'essayer des gilets airbag Ixon-In&Motion au cours de votre essai routier pour plus de sécurité.',
    color: 'from-teal-500 to-teal-600',
    delay: 0.5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
};

export default function WhatAwaitsYou() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background animé avec parallaxe */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
        style={{ y: backgroundY, opacity }}
      >
        {/* Motifs décoratifs */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yamaha-blue rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Logo et titre avec animation */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src="/images/drt-logo.svg"
            alt="Demo Ride Tour"
            className="h-20 mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          />

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-yamaha-blue to-gray-900 bg-clip-text text-transparent">
              Qu'est-ce qui vous attend ?
            </span>
          </motion.h2>

          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-yamaha-red to-transparent mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.div>

        {/* Cartes features avec design moderne */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  transition: { type: 'spring', stiffness: 300 },
                }}
                className="group relative"
              >
                {/* Carte avec effet glassmorphism */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 overflow-hidden h-full">
                  {/* Effet de brillance au survol */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Effet de lumière en mouvement */}
                  <motion.div
                    className="absolute -top-24 -right-24 w-48 h-48 bg-yamaha-red/10 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icône avec animation */}
                    <motion.div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Titre avec gradient au survol */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yamaha-blue transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Ligne décorative animée */}
                    <motion.div
                      className={`h-1 bg-gradient-to-r ${feature.color} mt-6 rounded-full`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    />
                  </div>
                </div>

                {/* Effet de lueur externe */}
                <motion.div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Vidéo horizontale avec effet 3D */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative max-w-6xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          {/* Effet de fond lumineux */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-yamaha-blue via-yamaha-red to-yamaha-blue rounded-3xl opacity-20 blur-2xl"
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          {/* Conteneur vidéo */}
          <motion.div
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <video
              className="w-full h-full object-cover"
              controls
              poster="/images/promo-poster.jpg"
            >
              <source src="/videos/drt-promo.mp4" type="video/mp4" />
              <img
                src="/images/drt-promo-fallback.jpg"
                alt="Demo Ride Tour Experience"
                className="w-full h-full object-cover"
              />
            </video>

            {/* Overlay avec effet play */}
            <motion.div
              className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              initial={false}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-0 h-0 border-l-[20px] border-l-yamaha-red border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Vague décorative en bas */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg
          className="relative w-full h-24"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,64 C240,100 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z"
            fill="white"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </section>
  );
}
