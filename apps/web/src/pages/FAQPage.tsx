import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Comment réserver un essai ?',
    answer: 'Rendez-vous sur la page "Réserver un essai", sélectionnez l\'événement le plus proche de chez vous sur la carte, choisissez le modèle qui vous intéresse et complétez le formulaire d\'inscription.',
  },
  {
    question: 'Combien coûte un essai ?',
    answer: 'Les essais sont 100% gratuits ! C\'est l\'occasion parfaite de découvrir la gamme Yamaha sans engagement.',
  },
  {
    question: 'Puis-je essayer plusieurs motos ?',
    answer: 'Oui, vous pouvez réserver jusqu\'à 2 essais de modèles différents lors du même événement, selon les disponibilités.',
  },
  {
    question: 'Quel permis me faut-il ?',
    answer: 'Selon le modèle choisi, vous devez posséder un permis A1 (125cc), A2 (moto bridée) ou A (toutes motos). Votre permis doit être en cours de validité.',
  },
  {
    question: 'Que dois-je apporter le jour de l\'essai ?',
    answer: 'Votre permis de conduire, une pièce d\'identité et votre équipement complet (casque, gants, blouson, pantalon et chaussures de moto).',
  },
  {
    question: 'Combien de temps dure un essai ?',
    answer: 'Chaque essai dure 45 minutes, avec une pause de 5 minutes au milieu du parcours. C\'est largement suffisant pour bien découvrir le modèle.',
  },
  {
    question: 'Puis-je annuler ou modifier ma réservation ?',
    answer: 'Oui, vous pouvez modifier ou annuler votre réservation directement via le lien dans l\'email de confirmation que vous recevrez.',
  },
  {
    question: 'Y a-t-il une assurance pour l\'essai ?',
    answer: 'Oui, toutes les motos sont assurées. Vous devrez simplement signer une décharge de responsabilité avant de prendre le guidon.',
  },
];

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-gray-200 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-yamaha-red transition-colors"
      >
        <span className="font-semibold text-lg pr-8">{faq.question}</span>
        <ChevronDown
          className={`flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={24}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function FAQPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h1>
          <p className="text-xl text-gray-600">
            Tout ce que vous devez savoir sur le Yamaha Demo Ride Tour
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} />
          ))}
        </div>

        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center bg-white rounded-lg p-8 shadow-md"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas votre réponse ?
          </h3>
          <p className="text-gray-600 mb-6">
            N'hésitez pas à nous contacter, notre équipe se fera un plaisir de vous répondre.
          </p>
          <a
            href="mailto:contact@yamaha-drt.fr"
            className="inline-block px-8 py-3 bg-yamaha-blue text-white font-semibold rounded-full hover:bg-opacity-90 transition-all"
          >
            Nous contacter
          </a>
        </motion.div>
      </div>
    </div>
  );
}
