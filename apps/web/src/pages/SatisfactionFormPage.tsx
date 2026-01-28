import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Star, Loader2 } from 'lucide-react';

// Schéma de validation
const satisfactionSchema = z.object({
  overallRating: z.number().min(1, 'Veuillez donner une note').max(5),
  motorcycleRating: z.number().min(1, 'Veuillez donner une note').max(5),
  instructorRating: z.number().min(1, 'Veuillez donner une note').max(5),
  organizationRating: z.number().min(1, 'Veuillez donner une note').max(5),
  purchaseIntent: z.enum(['YES', 'MAYBE', 'NO']),
  purchaseTimeframe: z.string().optional(),
  comments: z.string().optional(),
});

type SatisfactionFormData = z.infer<typeof satisfactionSchema>;

export default function SatisfactionFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [hoveredRating, setHoveredRating] = useState<{ [key: string]: number }>({});
  const [bookingInfo, setBookingInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SatisfactionFormData>({
    resolver: zodResolver(satisfactionSchema),
    defaultValues: {
      overallRating: 0,
      motorcycleRating: 0,
      instructorRating: 0,
      organizationRating: 0,
      purchaseIntent: 'NO',
    },
  });

  // Vérifier le token et récupérer les infos de réservation
  const { isLoading: isVerifying } = useQuery({
    queryKey: ['verify-satisfaction-token', token],
    queryFn: async () => {
      if (!token) throw new Error('Token manquant');
      const response = await fetch(`/api/forms/client-satisfaction/verify?token=${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Token invalide');
      }
      const data = await response.json();
      setBookingInfo(data);
      return data;
    },
    retry: false,
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SatisfactionFormData) => {
      const response = await fetch(`/api/forms/client-satisfaction/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la soumission');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Merci pour votre retour ! 🎉');
      navigate('/thank-you');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });

  const onSubmit = (data: SatisfactionFormData) => {
    submitMutation.mutate(data);
  };

  // Composant pour les étoiles
  const StarRating = ({
    name,
    label,
    required = true,
  }: {
    name: keyof SatisfactionFormData;
    label: string;
    required?: boolean;
  }) => {
    const value = watch(name) as number;
    const currentHover = hoveredRating[name] || 0;

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(name, star as any, { shouldValidate: true })}
              onMouseEnter={() => setHoveredRating({ ...hoveredRating, [name]: star })}
              onMouseLeave={() => setHoveredRating({ ...hoveredRating, [name]: 0 })}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (currentHover || value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              />
            </button>
          ))}
          {value > 0 && (
            <span className="ml-3 text-2xl font-bold text-yamaha-blue self-center">
              {value}/5
            </span>
          )}
        </div>
        {errors[name] && (
          <p className="text-red-500 text-sm mt-2">{errors[name]?.message}</p>
        )}
      </div>
    );
  };

  // Vérification du token
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lien invalide</h1>
          <p className="text-gray-600">
            Ce lien de formulaire n'est pas valide. Veuillez vérifier votre email ou contacter
            notre équipe.
          </p>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yamaha-blue mx-auto mb-4" />
          <p className="text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (!bookingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Formulaire non disponible</h1>
          <p className="text-gray-600 mb-4">
            Ce formulaire a déjà été complété ou le lien a expiré.
          </p>
          <p className="text-sm text-gray-500">
            Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-block bg-yamaha-blue text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            Yamaha Demo Ride Tour
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Votre avis compte ! 🏍️
          </h1>
          <p className="text-lg text-gray-600">
            Partagez votre expérience pour nous aider à améliorer nos événements
          </p>
        </div>

        {/* Informations de la réservation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Votre essai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Événement:</span>
              <span className="ml-2 font-medium">{bookingInfo.event.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Moto:</span>
              <span className="ml-2 font-medium">{bookingInfo.motorcycle.model}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-2 font-medium">
                {new Date(bookingInfo.booking.startTime).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Concession:</span>
              <span className="ml-2 font-medium">{bookingInfo.dealer.name}</span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            {/* Section Notes */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">
                Évaluez votre expérience
              </h2>

              <StarRating
                name="overallRating"
                label="Note globale de votre expérience"
              />

              <StarRating
                name="motorcycleRating"
                label="Satisfaction concernant la moto testée"
              />

              <StarRating
                name="instructorRating"
                label="Accompagnement de l'instructeur"
              />

              <StarRating
                name="organizationRating"
                label="Organisation de l'événement"
              />
            </div>

            {/* Section Intention d'achat */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Votre projet d'achat
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Envisagez-vous d'acheter une moto Yamaha ? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'YES', label: '✅ Oui, je suis très intéressé(e)', color: 'border-green-200 hover:bg-green-50' },
                    { value: 'MAYBE', label: '🤔 Peut-être, je réfléchis', color: 'border-yellow-200 hover:bg-yellow-50' },
                    { value: 'NO', label: '❌ Non, pas pour le moment', color: 'border-gray-200 hover:bg-gray-50' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${option.color} ${
                        watch('purchaseIntent') === option.value ? 'bg-opacity-100 border-yamaha-blue' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register('purchaseIntent')}
                        className="mr-3 w-4 h-4 text-yamaha-blue"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Délai d'achat */}
              {(watch('purchaseIntent') === 'YES' || watch('purchaseIntent') === 'MAYBE') && (
                <div className="mb-6 animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dans quel délai envisagez-vous cet achat ?
                  </label>
                  <select
                    {...register('purchaseTimeframe')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent"
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="0-3_MONTHS">0 à 3 mois</option>
                    <option value="3-6_MONTHS">3 à 6 mois</option>
                    <option value="6-12_MONTHS">6 à 12 mois</option>
                    <option value="MORE_THAN_12_MONTHS">Plus de 12 mois</option>
                  </select>
                </div>
              )}
            </div>

            {/* Section Commentaires */}
            <div className="pt-6 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Vos commentaires
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partagez vos impressions, suggestions ou remarques (optionnel)
                </label>
                <textarea
                  {...register('comments')}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue focus:border-transparent resize-none"
                  placeholder="Qu'avez-vous particulièrement apprécié ? Que pourrions-nous améliorer ?"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Vos commentaires nous aident à améliorer continuellement nos événements.
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-yamaha-blue text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer mon avis
                    <span className="text-2xl">🚀</span>
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                En soumettant ce formulaire, vous acceptez que vos réponses soient utilisées pour
                améliorer nos services.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2026 Yamaha Motor France - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
