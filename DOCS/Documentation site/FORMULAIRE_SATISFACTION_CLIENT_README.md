# Formulaire de Satisfaction Client - Documentation complète

## ✅ Ce qui a été implémenté

### 1. **Page du formulaire** ([apps/web/src/pages/SatisfactionFormPage.tsx](apps/web/src/pages/SatisfactionFormPage.tsx))
- Formulaire complet avec étoiles interactives ⭐
- Validation avec Zod
- Affichage des informations de réservation
- Design moderne et responsive
- Gestion des erreurs et états de chargement

### 2. **Page de remerciement** ([apps/web/src/pages/ThankYouPage.tsx](apps/web/src/pages/ThankYouPage.tsx))
- Page de confirmation après soumission
- Liens vers d'autres services
- Partage sur réseaux sociaux

### 3. **Routes frontend** ([apps/web/src/App.tsx](apps/web/src/App.tsx))
- `/satisfaction?token=XXX` → Formulaire de satisfaction
- `/thank-you` → Page de remerciement

### 4. **API Backend** ([apps/api/src/routes/forms.ts](apps/api/src/routes/forms.ts))
- `GET /api/forms/client-satisfaction/verify` → Vérifier le token
- `POST /api/forms/client-satisfaction/submit` → Soumettre le formulaire
- `GET /api/forms/client-satisfaction` → Liste tous les formulaires (backoffice)

### 5. **Service d'email** ([apps/api/src/services/satisfactionEmailService.ts](apps/api/src/services/satisfactionEmailService.ts))
- Génération de tokens JWT sécurisés
- Template d'email HTML professionnel
- Envoi automatique après l'essai

---

## 🔄 Flux complet du formulaire

### Étape 1 : Client termine son essai

Quand un client termine son essai, le système marque la réservation comme `COMPLETED`.

### Étape 2 : Envoi automatique de l'email

Dans le contrôleur de réservation, après la complétion :

```typescript
// Dans apps/api/src/routes/bookings.ts
import { sendSatisfactionFormLink } from '../services/satisfactionEmailService';

router.put('/bookings/:id/complete', async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'COMPLETED' },
    include: {
      user: true,
      event: true,
      motorcycle: true,
      dealer: true,
    },
  });

  // Envoyer le formulaire de satisfaction automatiquement
  try {
    await sendSatisfactionFormLink(
      booking.user.email,
      `${booking.user.firstName} ${booking.user.lastName}`,
      booking.id,
      booking.userId,
      booking.event.name,
      booking.motorcycle.model,
      booking.dealer.name
    );
    console.log('Email de satisfaction envoyé');
  } catch (error) {
    console.error('Erreur envoi email satisfaction:', error);
    // L'erreur n'empêche pas la complétion de la réservation
  }

  res.json(booking);
});
```

### Étape 3 : Client reçoit l'email

L'email contient :
- Un message personnalisé avec le nom du client
- Le récapitulatif de l'essai (événement, moto, concession)
- Un bouton CTA "Donner mon avis"
- Un lien unique avec token JWT valide 30 jours

### Étape 4 : Client clique sur le lien

Le lien ressemble à :
```
https://yamaha-drt.fr/satisfaction?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 5 : Vérification du token

La page `SatisfactionFormPage` :
1. Extrait le token de l'URL
2. Appelle `GET /api/forms/client-satisfaction/verify?token=XXX`
3. Le backend vérifie :
   - ✅ Token valide et non expiré
   - ✅ Réservation existe et est complétée
   - ✅ Formulaire pas encore soumis
4. Si OK : affiche le formulaire avec les infos
5. Sinon : affiche un message d'erreur

### Étape 6 : Client remplit le formulaire

Le formulaire contient :
- 4 évaluations par étoiles (1-5) :
  - Note globale
  - Satisfaction moto
  - Satisfaction instructeur
  - Satisfaction organisation
- Intention d'achat (Oui / Peut-être / Non)
- Délai d'achat (si intéressé)
- Commentaires libres

### Étape 7 : Soumission

1. Client clique sur "Envoyer mon avis"
2. Frontend valide les données avec Zod
3. Envoie `POST /api/forms/client-satisfaction/submit` avec le token
4. Backend :
   - Vérifie à nouveau le token
   - Vérifie que le formulaire n'existe pas déjà
   - Crée l'entrée dans `ClientSatisfactionForm`
5. Redirection vers `/thank-you`

### Étape 8 : Visualisation dans le backoffice

Les admins et dealers peuvent voir tous les formulaires dans :
- **Page** : `http://localhost:5175/forms/customers`
- Liste avec filtres et recherche
- Modal de détail pour chaque formulaire

---

## 🔐 Sécurité

### Tokens JWT

Les tokens contiennent :
```json
{
  "bookingId": "clx123...",
  "userId": "cly456...",
  "iat": 1704124800,
  "exp": 1706803200
}
```

- **Validité** : 30 jours
- **Signature** : HMAC SHA256 avec `JWT_SECRET`
- **Une seule utilisation** : Vérification en base de données

### Protection contre les abus

1. **Token unique** : Impossible de réutiliser le même lien
2. **Vérification booking** : Le booking doit être COMPLETED
3. **Pas d'authentification requise** : Le token suffit (meilleure UX)
4. **Expiration** : 30 jours maximum

---

## 📧 Configuration email

### Variables d'environnement requises

Ajoutez dans `.env` :

```env
# JWT Secret (changez en production!)
JWT_SECRET=votre-super-secret-tres-secure-ici-123456

# URL du frontend (pour les liens)
FRONTEND_URL=http://localhost:5173

# Configuration email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=noreply@yamaha-drt.fr
```

### Configuration Gmail

Si vous utilisez Gmail :

1. Activez la validation en 2 étapes
2. Générez un mot de passe d'application :
   - https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `EMAIL_PASSWORD`

### Configuration autre SMTP

Pour utiliser un autre serveur SMTP (SendGrid, Mailgun, etc.) :

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.votre-api-key
```

---

## 🎨 Personnalisation

### Modifier les questions du formulaire

**Fichier** : `apps/web/src/pages/SatisfactionFormPage.tsx`

Pour ajouter une question :

```typescript
// 1. Ajouter dans le schéma Zod
const satisfactionSchema = z.object({
  // ... questions existantes
  wouldRecommend: z.boolean(), // NOUVELLE QUESTION
});

// 2. Ajouter dans le defaultValues
defaultValues: {
  // ... valeurs existantes
  wouldRecommend: false,
}

// 3. Ajouter dans le JSX du formulaire
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

// 4. Mettre à jour le modèle Prisma
// Dans packages/database/prisma/schema.prisma
model ClientSatisfactionForm {
  // ... champs existants
  wouldRecommend Boolean?
}

// 5. Créer une migration
// npx prisma migrate dev --name add_would_recommend
```

### Personnaliser l'email

**Fichier** : `apps/api/src/services/satisfactionEmailService.ts`

Modifiez la fonction `generateEmailHTML()` :

```typescript
function generateEmailHTML(...) {
  return `
    <!-- Modifiez le HTML ici -->
    <h1 style="color: #VOTRE_COULEUR;">Titre personnalisé</h1>
    <!-- ... -->
  `;
}
```

---

## 📊 Base de données

### Modèle Prisma

Le formulaire utilise le modèle `ClientSatisfactionForm` déjà défini :

```prisma
model ClientSatisfactionForm {
  id                  String  @id @default(cuid())
  bookingId           String  @unique
  booking             Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  userId              String
  user                User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventId             String
  event               Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)

  // Ratings (1-5)
  overallRating       Int
  motorcycleRating    Int
  instructorRating    Int
  organizationRating  Int

  // Purchase intent
  purchaseIntent      String  // YES, MAYBE, NO
  purchaseTimeframe   String? // 0-3_MONTHS, 3-6_MONTHS, etc.

  // Comments
  comments            String? @db.Text

  createdAt           DateTime @default(now())

  @@index([eventId])
  @@index([userId])
}
```

---

## 🧪 Tester le formulaire

### Test manuel complet

1. **Créer une réservation de test** :
```sql
-- Dans votre base de données PostgreSQL
INSERT INTO "Booking" (id, "userId", "eventId", "motorcycleId", "dealerId", "startTime", "endTime", status)
VALUES ('test-booking-123', 'user-id', 'event-id', 'moto-id', 'dealer-id', NOW(), NOW() + INTERVAL '1 hour', 'COMPLETED');
```

2. **Générer un token manuellement** :
```javascript
// Dans Node.js ou console navigateur
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { bookingId: 'test-booking-123', userId: 'user-id' },
  'votre-jwt-secret',
  { expiresIn: '30d' }
);
console.log(token);
```

3. **Accéder au formulaire** :
```
http://localhost:5173/satisfaction?token=VOTRE_TOKEN
```

4. **Remplir et soumettre**

5. **Vérifier dans le backoffice** :
```
http://localhost:5175/forms/customers
```

### Test avec l'email

```typescript
// Test dans apps/api/src/index.ts ou créer une route de test
import { sendSatisfactionFormLink } from './services/satisfactionEmailService';

app.get('/test-satisfaction-email', async (req, res) => {
  try {
    await sendSatisfactionFormLink(
      'votre-email@test.com',
      'John Doe',
      'booking-id-test',
      'user-id-test',
      'Demo Ride Tour Paris',
      'Yamaha MT-07',
      'Yamaha Paris Nord'
    );
    res.json({ message: 'Email envoyé !' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🚀 Déploiement

### Checklist avant déploiement

- [ ] Changer `JWT_SECRET` en production (valeur forte et aléatoire)
- [ ] Configurer le vrai serveur SMTP
- [ ] Mettre à jour `FRONTEND_URL` avec l'URL de production
- [ ] Tester l'envoi d'email en production
- [ ] Vérifier que les tokens expirent correctement
- [ ] Tester le formulaire de bout en bout

### Variables d'environnement production

```env
# Production
JWT_SECRET=CHANGEZ-MOI-VALEUR-TRES-LONGUE-ET-ALEATOIRE-123456789
FRONTEND_URL=https://drt.yamaha.fr
EMAIL_HOST=smtp.votre-serveur.com
EMAIL_PORT=587
EMAIL_USER=noreply@yamaha.fr
EMAIL_PASSWORD=mot-de-passe-securise
EMAIL_FROM=noreply@yamaha.fr
```

---

## 📈 Statistiques et analytics

### Ajouter Google Analytics

Dans `apps/web/src/pages/SatisfactionFormPage.tsx` :

```typescript
import { useEffect } from 'react';

// Après soumission réussie
onSuccess: () => {
  // Track event
  if (window.gtag) {
    window.gtag('event', 'satisfaction_form_submitted', {
      event_category: 'engagement',
      event_label: bookingInfo?.event.name,
    });
  }

  toast.success('Merci pour votre retour ! 🎉');
  navigate('/thank-you');
}
```

### Métriques à suivre

- Taux d'ouverture des emails
- Taux de clic sur le CTA
- Taux de complétion du formulaire
- Note moyenne par événement
- Intention d'achat (conversion potential)

---

## 🐛 Troubleshooting

### Problème : "Token invalide ou expiré"

**Causes possibles** :
- Token expiré (> 30 jours)
- `JWT_SECRET` différent entre génération et vérification
- Token mal formaté dans l'URL

**Solution** :
```typescript
// Vérifier le JWT_SECRET dans .env
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Décoder le token pour voir son contenu
const decoded = jwt.decode(token);
console.log('Token décodé:', decoded);
```

### Problème : "Ce formulaire a déjà été complété"

**Cause** : Le formulaire existe déjà dans la base pour ce bookingId

**Solution** :
```sql
-- Supprimer le formulaire existant pour retester
DELETE FROM "ClientSatisfactionForm" WHERE "bookingId" = 'votre-booking-id';
```

### Problème : Email non reçu

**Vérifications** :
1. Logs du serveur : `console.log` dans `satisfactionEmailService.ts`
2. Vérifier spam/courrier indésirable
3. Tester la config SMTP :
```typescript
// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Ready:', success);
  }
});
```

### Problème : Le formulaire ne s'affiche pas

**Vérifications** :
1. Token présent dans l'URL ?
2. Backend répond correctement à `/verify` ?
3. Console navigateur pour erreurs JavaScript
4. Réservation existe et status = COMPLETED ?

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs backend et frontend
2. Consulter [GUIDE_CREATION_FORMULAIRE.md](GUIDE_CREATION_FORMULAIRE.md)
3. Consulter [FORMULAIRES_SATISFACTION.md](FORMULAIRES_SATISFACTION.md)

---

**Date de création** : 2026-01-12
**Version** : 1.0
**Statut** : ✅ Prêt à l'emploi
