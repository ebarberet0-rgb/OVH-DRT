# Guide : Comment créer un formulaire dans Yamaha DRT

## 🎯 Deux types de formulaires possibles

### 1. Formulaire BACKOFFICE (pour l'administration)
- Accessible uniquement aux utilisateurs connectés (ADMIN, DEALER)
- Port 5175
- Exemple : Les 3 formulaires de satisfaction que nous venons de créer

### 2. Formulaire SITE WEB PUBLIC (pour les clients)
- Accessible à tous les visiteurs
- Port 5173
- Exemple : Formulaire de réservation, formulaire de satisfaction client

---

## 📋 Exemple : Créer un formulaire de satisfaction CLIENT

Je vais vous montrer comment créer un formulaire que les clients remplissent après leur essai.

### ÉTAPE 1 : Créer la page du formulaire (Frontend - Site Web)

**Fichier** : `apps/web/src/pages/SatisfactionFormPage.tsx`

```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

// Schéma de validation avec Zod
const satisfactionSchema = z.object({
  overallRating: z.number().min(1).max(5),
  motorcycleRating: z.number().min(1).max(5),
  instructorRating: z.number().min(1).max(5),
  organizationRating: z.number().min(1).max(5),
  purchaseIntent: z.enum(['YES', 'MAYBE', 'NO']),
  purchaseTimeframe: z.string().optional(),
  comments: z.string().optional(),
});

type SatisfactionFormData = z.infer<typeof satisfactionSchema>;

export default function SatisfactionFormPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [hoveredRating, setHoveredRating] = useState<{ [key: string]: number }>({});

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

  const submitMutation = useMutation({
    mutationFn: async (data: SatisfactionFormData) => {
      const response = await fetch(\`/api/forms/client-satisfaction/\${bookingId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la soumission');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Merci pour votre retour ! 🎉');
      navigate('/thank-you');
    },
    onError: () => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    },
  });

  const onSubmit = (data: SatisfactionFormData) => {
    submitMutation.mutate(data);
  };

  // Composant pour les étoiles
  const StarRating = ({
    name,
    label,
    value
  }: {
    name: keyof SatisfactionFormData;
    label: string;
    value: number;
  }) => {
    const currentHover = hoveredRating[name] || 0;
    const currentValue = value || 0;

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(name, star as any)}
              onMouseEnter={() => setHoveredRating({ ...hoveredRating, [name]: star })}
              onMouseLeave={() => setHoveredRating({ ...hoveredRating, [name]: 0 })}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors \${
                  star <= (currentHover || currentValue)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }\`}
              />
            </button>
          ))}
        </div>
        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">Veuillez donner une note</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-yamaha-blue mb-2">
            Votre avis compte ! 🏍️
          </h1>
          <p className="text-gray-600 mb-8">
            Partagez votre expérience pour nous aider à améliorer nos événements
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Note globale */}
            <StarRating
              name="overallRating"
              label="Note globale de votre expérience"
              value={watch('overallRating')}
            />

            {/* Note moto */}
            <StarRating
              name="motorcycleRating"
              label="Satisfaction concernant la moto testée"
              value={watch('motorcycleRating')}
            />

            {/* Note instructeur */}
            <StarRating
              name="instructorRating"
              label="Accompagnement de l'instructeur"
              value={watch('instructorRating')}
            />

            {/* Note organisation */}
            <StarRating
              name="organizationRating"
              label="Organisation de l'événement"
              value={watch('organizationRating')}
            />

            {/* Intention d'achat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Envisagez-vous d'acheter une moto Yamaha ?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'YES', label: '✅ Oui, je suis intéressé(e)' },
                  { value: 'MAYBE', label: '🤔 Peut-être' },
                  { value: 'NO', label: '❌ Non' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('purchaseIntent')}
                      className="mr-3"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Délai d'achat (si intéressé) */}
            {watch('purchaseIntent') !== 'NO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dans quel délai envisagez-vous cet achat ?
                </label>
                <select
                  {...register('purchaseTimeframe')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue"
                >
                  <option value="">Sélectionnez une option</option>
                  <option value="0-3_MONTHS">0 à 3 mois</option>
                  <option value="3-6_MONTHS">3 à 6 mois</option>
                  <option value="6-12_MONTHS">6 à 12 mois</option>
                  <option value="MORE_THAN_12_MONTHS">Plus de 12 mois</option>
                </select>
              </div>
            )}

            {/* Commentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaires additionnels (optionnel)
              </label>
              <textarea
                {...register('comments')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yamaha-blue"
                placeholder="Partagez vos impressions, suggestions..."
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-yamaha-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Envoi en cours...' : 'Envoyer mon avis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

### ÉTAPE 2 : Ajouter la route dans le routeur (Frontend)

**Fichier** : `apps/web/src/App.tsx`

```typescript
import SatisfactionFormPage from './pages/SatisfactionFormPage';

// Dans la section <Routes>
<Route path="/satisfaction/:bookingId" element={<SatisfactionFormPage />} />
```

---

### ÉTAPE 3 : Créer la route API (Backend)

**Fichier** : `apps/api/src/routes/forms.ts`

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST - Soumettre un formulaire de satisfaction client
router.post('/client-satisfaction/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      overallRating,
      motorcycleRating,
      instructorRating,
      organizationRating,
      purchaseIntent,
      purchaseTimeframe,
      comments,
    } = req.body;

    // Vérifier que la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    // Vérifier que le formulaire n'a pas déjà été soumis
    const existingForm = await prisma.clientSatisfactionForm.findUnique({
      where: { bookingId },
    });

    if (existingForm) {
      return res.status(400).json({ error: 'Formulaire déjà soumis' });
    }

    // Créer le formulaire de satisfaction
    const satisfactionForm = await prisma.clientSatisfactionForm.create({
      data: {
        bookingId,
        userId: booking.userId,
        eventId: booking.eventId,
        overallRating,
        motorcycleRating,
        instructorRating,
        organizationRating,
        purchaseIntent,
        purchaseTimeframe,
        comments,
      },
    });

    // Envoyer un email de remerciement (optionnel)
    // await sendThankYouEmail(booking.user.email);

    res.json({
      message: 'Formulaire soumis avec succès',
      data: satisfactionForm,
    });
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer tous les formulaires de satisfaction (pour le backoffice)
router.get('/client-satisfaction', async (req, res) => {
  try {
    const { status, search } = req.query;

    const forms = await prisma.clientSatisfactionForm.findMany({
      include: {
        user: true,
        event: {
          include: {
            dealer: true,
          },
        },
        booking: {
          include: {
            motorcycle: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(forms);
  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
```

---

### ÉTAPE 4 : Enregistrer les routes dans l'API

**Fichier** : `apps/api/src/index.ts`

```typescript
import formsRouter from './routes/forms';

// Dans la section des routes
app.use('/api/forms', formsRouter);
```

---

### ÉTAPE 5 : Envoyer le lien du formulaire par email

**Fichier** : `apps/api/src/services/emailService.ts`

```typescript
import nodemailer from 'nodemailer';

export async function sendSatisfactionFormLink(
  userEmail: string,
  bookingId: string,
  userName: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const formLink = \`\${process.env.FRONTEND_URL}/satisfaction/\${bookingId}\`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Votre avis sur le Yamaha Demo Ride Tour',
    html: \`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D1B54; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Yamaha Demo Ride Tour</h1>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #0D1B54;">Bonjour \${userName},</h2>

            <p>Nous espérons que vous avez apprécié votre essai lors du Demo Ride Tour !</p>

            <p>Votre avis est précieux pour nous aider à améliorer nos événements.
            Pourriez-vous prendre quelques minutes pour répondre à notre questionnaire de satisfaction ?</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="\${formLink}"
                 style="background-color: #DA291C; color: white; padding: 15px 30px;
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Donner mon avis
              </a>
            </div>

            <p style="color: #666; font-size: 12px;">
              Ce lien est personnel et ne peut être utilisé qu'une seule fois.
            </p>
          </div>

          <div style="background-color: #0D1B54; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">
              © 2026 Yamaha Motor France - Tous droits réservés
            </p>
          </div>
        </body>
      </html>
    \`,
  });
}
```

**Déclencher l'envoi après l'essai** :

```typescript
// Dans le contrôleur de réservation, après la fin de l'essai
router.put('/bookings/:id/complete', async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'COMPLETED' },
    include: { user: true },
  });

  // Envoyer le formulaire de satisfaction
  await sendSatisfactionFormLink(
    booking.user.email,
    booking.id,
    \`\${booking.user.firstName} \${booking.user.lastName}\`
  );

  res.json(booking);
});
```

---

## 🎨 Personnalisation du formulaire

### Ajouter des questions supplémentaires

Dans le schéma Zod :

```typescript
const satisfactionSchema = z.object({
  // ... questions existantes

  // Nouvelles questions
  wouldRecommend: z.boolean(),
  interestInAccessories: z.boolean(),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS']),
  ageRange: z.enum(['18-25', '26-35', '36-45', '46-55', '55+']),
});
```

Et dans le formulaire JSX :

```typescript
<div>
  <label className="flex items-center">
    <input
      type="checkbox"
      {...register('wouldRecommend')}
      className="mr-3"
    />
    <span>Je recommanderais cet événement à mes proches</span>
  </label>
</div>
```

---

## 📊 Visualiser les résultats dans le backoffice

C'est déjà fait ! Les résultats apparaissent automatiquement dans :
- **Page** : `apps/backoffice/src/pages/CustomerSatisfactionFormsPage.tsx`
- **Route** : `http://localhost:5175/forms/customers`

---

## ✅ Checklist de création d'un formulaire

- [ ] Définir les questions et le schéma de validation (Zod)
- [ ] Créer la page du formulaire avec react-hook-form
- [ ] Ajouter la route dans le routeur frontend
- [ ] Créer les routes API backend (POST pour soumettre, GET pour lister)
- [ ] Mettre à jour le modèle Prisma si nécessaire
- [ ] Créer les migrations de base de données
- [ ] Implémenter l'envoi d'email avec le lien du formulaire
- [ ] Créer la page de visualisation dans le backoffice (si nécessaire)
- [ ] Tester le flux complet

---

## 🔒 Sécurité

### Pour les formulaires publics (accessibles sans connexion)

1. **Token unique** : Générer un token JWT ou UUID unique par formulaire
2. **Limite de soumission** : Un seul formulaire par booking
3. **Validation** : Vérifier les données côté serveur
4. **Rate limiting** : Limiter le nombre de requêtes

Exemple avec token :

```typescript
// Générer un token à l'envoi de l'email
const token = jwt.sign(
  { bookingId, userId },
  process.env.JWT_SECRET!,
  { expiresIn: '30d' }
);

const formLink = \`\${process.env.FRONTEND_URL}/satisfaction?token=\${token}\`;

// Vérifier le token lors de la soumission
router.post('/client-satisfaction', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Continuer avec la soumission...
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
});
```

---

## 📝 Exemple rapide : Formulaire simple

Voici un exemple minimaliste pour démarrer rapidement :

```typescript
// Page simple avec 1 question
export default function QuickFormPage() {
  const [rating, setRating] = useState(0);

  const handleSubmit = async () => {
    await fetch('/api/forms/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    alert('Merci !');
  };

  return (
    <div className="p-8">
      <h1>Notez votre expérience</h1>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setRating(star)}>
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit}>Envoyer</button>
    </div>
  );
}
```

---

## 🚀 Pour aller plus loin

- **Upload de fichiers** : Utiliser FormData et multer
- **Formulaires multi-étapes** : Utiliser un state machine (XState)
- **Sauvegarde automatique** : localStorage + debounce
- **Préremplissage** : Récupérer les données du booking
- **Analytics** : Tracker les abandons de formulaire

---

Besoin d'aide pour créer un formulaire spécifique ? Dites-moi quel type de formulaire vous voulez créer !
