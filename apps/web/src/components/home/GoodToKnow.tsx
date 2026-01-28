import { motion } from 'framer-motion';
import { FileText, Shield, Calendar } from 'lucide-react';

const requirements = [
  {
    icon: FileText,
    title: 'Documents requis',
    items: [
      'Permis de conduire (A1, A2 ou A)',
      'Carte d\'identité ou passeport',
    ],
  },
  {
    icon: Shield,
    title: 'Équipement obligatoire',
    items: [
      'Casque homologué',
      'Gants de moto',
      'Blouson avec protections',
      'Pantalon adapté',
      'Chaussures de moto',
    ],
  },
  {
    icon: Calendar,
    title: 'Possibilités d\'essai',
    items: [
      'Jusqu\'à 2 modèles par personne',
      'Jeunes permis bienvenus',
      'Essais longue durée possibles via Yamaha Rent',
    ],
  },
];

export default function GoodToKnow() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bon à savoir
          </h2>
        </motion.div>

        {/* Cartes d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {requirements.map((req, index) => {
            const Icon = req.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-yamaha-blue rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {req.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {req.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-yamaha-red mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Image pleine largeur */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-lg overflow-hidden shadow-xl"
        >
          <img
            src="/images/riding-group.jpg"
            alt="Groupe d'essai Yamaha Demo Ride Tour"
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
