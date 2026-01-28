# Formulaires de Satisfaction - Documentation d'implémentation

## Vue d'ensemble

Trois nouveaux modules de formulaires de satisfaction ont été intégrés dans le backoffice Yamaha DRT (port 5175) :

1. **Formulaires de satisfaction clients**
2. **Formulaires de satisfaction concessionnaires**
3. **Rapports d'évaluation équipe DRT**

---

## 1. Formulaires de Satisfaction Clients

### Localisation
- **Page**: `apps/backoffice/src/pages/CustomerSatisfactionFormsPage.tsx`
- **Route**: `/forms/customers`
- **Accès**: ADMIN, DEALER

### Fonctionnalités implémentées

✅ **Liste des formulaires**
- Affichage de tous les formulaires clients complétés
- Colonnes : Client, Événement, Moto testée, Note globale, Intention d'achat, Date
- Recherche par nom, email, événement
- Filtrage par statut (Tous, Complétés, En attente)

✅ **Détails du formulaire**
- Modal de visualisation avec toutes les informations
- Évaluations (notes sur 5) :
  - Note globale
  - Note moto
  - Note instructeur
  - Note organisation
- Intention d'achat (Oui / Peut-être / Non)
- Délai d'achat potentiel
- Commentaires du client

✅ **Export des données**
- Bouton d'export pour télécharger toutes les réponses
- Format à implémenter côté backend (Excel/CSV)

### Questions du formulaire (à définir)
Les questions spécifiques du formulaire client doivent être transmises séparément pour être intégrées.

---

## 2. Formulaires de Satisfaction Concessionnaires

### Localisation
- **Page**: `apps/backoffice/src/pages/DealerSatisfactionFormsPage.tsx`
- **Route**: `/forms/dealers`
- **Accès**: ADMIN uniquement

### Fonctionnalités implémentées

✅ **Liste des formulaires**
- Affichage par concession et événement
- Colonnes : Concession, Événement, Date, Statut, Ventes déclarées, Participation future
- Statut visuel :
  - ✅ Complété (vert)
  - ⏳ En attente (jaune)
  - 🔴 En retard (rouge) - si date événement passée et formulaire non complété
- Recherche et filtrage avancés

✅ **Auto-déclarations des concessionnaires**
- Satisfaction de l'organisation (note /5)
- Satisfaction de l'équipe DRT (note /5)
- Description des animations proposées
- Liste des promotions offertes
- Nombre de ventes réalisées
- Intention de participer à nouveau (Oui/Non)

✅ **Système d'email automatique**
- Bouton "Relancer" pour chaque formulaire en attente
- Email de rappel envoyé automatiquement au concessionnaire
- L'email peut inclure un lien pour compléter le formulaire et accéder aux leads
- Gestion de l'état d'envoi (en cours, succès, erreur)

✅ **Export des données**
- Export global de toutes les réponses
- Rapport récapitulatif des activités et ventes

✅ **Indicateurs visuels**
- Formulaires en retard affichés en rouge
- Badge d'alerte pour les formulaires non complétés après la date de l'événement

---

## 3. Rapports d'Évaluation Équipe DRT

### Localisation
- **Page**: `apps/backoffice/src/pages/DRTTeamReportsPage.tsx`
- **Route**: `/forms/drt-team`
- **Accès**: ADMIN uniquement

### Fonctionnalités implémentées

✅ **Les 5 critères d'évaluation**

1. **Traitement des leads** (leadTreatmentScore)
   - 100% des leads traités sous 7 jours après injection dans Salesforce

2. **Animation** (animationScore)
   - Transformation de l'événement en véritables portes ouvertes
   - Food truck, promotions, ateliers, présence de pilotes

3. **Engagement des équipes** (teamEngagementScore)
   - Mobilisation des équipes
   - Performance des ventes

4. **Communication** (communicationScore)
   - Visibilité avant/pendant/après l'événement
   - Magasin, ville, partenaires, réseaux sociaux, radio

5. **Satisfaction client** (clientSatisfactionScore)
   - Évaluations via formulaires de satisfaction post essai

✅ **Système de notation**
- Chaque critère noté sur 5
- Note totale calculée automatiquement
- Barème de couleur :
  - ≥ 4.5 : Excellent (vert)
  - ≥ 3.5 : Bien (bleu)
  - ≥ 2.5 : Moyen (jaune)
  - < 2.5 : À améliorer (rouge)

✅ **Interface de rapport détaillé**
- Score global affiché en grand
- Barre de progression pour chaque critère
- Notes détaillées par catégorie :
  - Investissement de la concession
  - Animations proposées
  - Ventes et activité commerciale
- Support de photos (URLs)
- Informations sur le rapporteur et date

✅ **Rapport annuel et classement**
- Bouton "Rapport annuel" en haut de page
- Modal avec classement complet des concessions
- Tableau avec :
  - Rang (🥇🥈🥉 pour le top 3)
  - Concession
  - Note moyenne globale
  - Nombre d'événements
  - Moyenne de chaque critère
- Top 3 mis en évidence visuellement
- Export du rapport annuel au format Excel/PDF

✅ **Indicateurs visuels**
- Formulaires en retard en rouge
- Intégration des auto-déclarations des concessionnaires pour notation juste
- Alertes pour les formulaires non complétés

---

## Architecture Technique

### Frontend (Backoffice)

**Fichiers créés/modifiés** :
```
apps/backoffice/src/
├── pages/
│   ├── CustomerSatisfactionFormsPage.tsx (NOUVEAU)
│   ├── DealerSatisfactionFormsPage.tsx (NOUVEAU)
│   └── DRTTeamReportsPage.tsx (NOUVEAU)
├── components/layout/
│   └── Sidebar.tsx (MODIFIÉ - ajout navigation)
├── lib/
│   └── api.ts (MODIFIÉ - ajout endpoints)
└── App.tsx (MODIFIÉ - ajout routes)
```

**Technologies utilisées** :
- React 18 avec TypeScript
- React Query pour la gestion des données
- React Hook Form + Zod pour les formulaires
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- React Hot Toast pour les notifications

### Backend (API) - À implémenter

**Routes nécessaires** :

```typescript
// Client Satisfaction Forms
GET    /api/forms/client-satisfaction              // Liste avec filtres
GET    /api/forms/client-satisfaction/:bookingId   // Détails
POST   /api/forms/client-satisfaction/:bookingId   // Soumission
GET    /api/forms/client-satisfaction/export       // Export

// Dealer Satisfaction Forms
GET    /api/forms/dealer-satisfaction              // Liste avec filtres
GET    /api/forms/dealer-satisfaction/:eventId     // Détails
POST   /api/forms/dealer-satisfaction/:eventId     // Soumission
POST   /api/forms/dealer-satisfaction/:eventId/reminder  // Email rappel
GET    /api/forms/dealer-satisfaction/export       // Export

// DRT Team Reports
GET    /api/forms/team-report                      // Liste avec filtres
GET    /api/forms/team-report/:eventId             // Détails
POST   /api/forms/team-report/:eventId             // Soumission
GET    /api/forms/team-report/yearly-ranking       // Classement annuel
GET    /api/forms/team-report/export               // Export
```

### Base de données (Prisma)

**Modèles existants** (déjà dans le schéma) :
- `ClientSatisfactionForm`
- `DealerSatisfactionForm`
- `DRTTeamReport`

Ces modèles sont déjà définis dans `packages/database/prisma/schema.prisma`

---

## Fonctionnalités Backend à développer

### 1. Endpoints de récupération des formulaires

- **Liste paginée avec filtres** :
  - Par statut (complété / en attente / en retard)
  - Par recherche (nom, email, concession, événement)
  - Par date
  - Tri (date, note, etc.)

- **Calcul automatique du statut "en retard"** :
  - Comparer `event.endDate` avec la date actuelle
  - Si `event.endDate < Date.now()` ET formulaire non complété → statut "overdue"

### 2. Système d'email pour concessionnaires

**Email de rappel automatique** :
- Déclenchement : Bouton "Relancer" dans l'interface
- Contenu suggéré :
  ```
  Objet : Formulaire de satisfaction DRT - [Nom événement]

  Bonjour [Nom concession],

  Nous vous remercions d'avoir participé au Demo Ride Tour [Nom événement].

  Afin de nous aider à améliorer nos événements, merci de compléter le
  formulaire de satisfaction en cliquant sur le lien ci-dessous :

  [Lien vers formulaire]

  Une fois le formulaire complété, vous pourrez accéder et télécharger
  la liste récapitulative des leads de votre événement.

  Cordialement,
  L'équipe Yamaha DRT
  ```

- **Lien vers le formulaire** :
  - Page publique accessible par token unique
  - Format : `https://drt.yamaha.fr/forms/dealer/[eventId]?token=[unique_token]`
  - Sécurisé avec token JWT ou UUID unique

### 3. Système de notation équipe DRT

**Calcul des scores** :
- Chaque critère noté de 0 à 5
- Note totale = moyenne des 5 critères
- Formule : `(leadScore + animationScore + engagementScore + communicationScore + satisfactionScore) / 5`

**Barème de notation suggéré** (à affiner) :

**1. Traitement des leads (0-5 points)**
- 5 pts : 100% traités < 7 jours
- 4 pts : 90-99% traités < 7 jours
- 3 pts : 80-89% traités < 7 jours
- 2 pts : 70-79% traités < 7 jours
- 1 pt : 60-69% traités < 7 jours
- 0 pt : < 60% traités < 7 jours

**2. Animation (0-5 points)**
- 5 pts : ≥ 4 animations différentes (food truck, pilotes, ateliers, etc.)
- 4 pts : 3 animations
- 3 pts : 2 animations
- 2 pts : 1 animation
- 1 pt : Événement basique
- 0 pt : Aucune animation

**3. Engagement des équipes (0-5 points)**
- 5 pts : Toute l'équipe mobilisée + ventes excellentes (> 5 ventes)
- 4 pts : Équipe mobilisée + bonnes ventes (3-5 ventes)
- 3 pts : Équipe présente + ventes moyennes (1-2 ventes)
- 2 pts : Équipe présente + aucune vente
- 1 pt : Équipe peu présente
- 0 pt : Équipe absente

**4. Communication (0-5 points)**
- 5 pts : Communication sur tous les canaux (réseaux sociaux + radio + partenaires + affichage)
- 4 pts : 3 canaux utilisés
- 3 pts : 2 canaux utilisés
- 2 pts : 1 canal utilisé
- 1 pt : Communication minimale
- 0 pt : Aucune communication

**5. Satisfaction client (0-5 points)**
- Basé sur la note moyenne des formulaires clients
- 5 pts : Note moyenne ≥ 4.5/5
- 4 pts : Note moyenne 4.0-4.4/5
- 3 pts : Note moyenne 3.5-3.9/5
- 2 pts : Note moyenne 3.0-3.4/5
- 1 pt : Note moyenne 2.5-2.9/5
- 0 pt : Note moyenne < 2.5/5

**Questions du formulaire équipe DRT** :
```typescript
interface DRTTeamReportForm {
  // Traitement des leads
  leadsProcessedCount: number;
  totalLeadsCount: number;
  leadsProcessedWithin7Days: number; // Calculé en %

  // Animation
  animations: string[]; // ['food_truck', 'pilots', 'workshops', 'promotions', ...]
  animationDescription: string; // Texte libre

  // Engagement
  teamSize: number;
  teamFullyMobilized: boolean;
  salesCount: number;

  // Communication
  communicationChannels: string[]; // ['social_media', 'radio', 'partners', 'signage', ...]
  communicationNotes: string; // Texte libre

  // Satisfaction client (calculé automatiquement depuis ClientSatisfactionForm)
  avgClientSatisfaction: number;

  // Photos et notes additionnelles
  photoUrls: string[];
  dealerInvestmentNotes: string;
  animationNotes: string;
  salesNotes: string;
}
```

### 4. Rapport annuel

**Endpoint** : `GET /api/forms/team-report/yearly-ranking`

**Logique** :
1. Récupérer tous les `DRTTeamReport` complétés de l'année
2. Grouper par `dealerId`
3. Calculer pour chaque concession :
   - Note moyenne globale
   - Nombre d'événements
   - Moyenne par critère
4. Trier par note moyenne décroissante
5. Retourner le classement

**Format de réponse** :
```typescript
{
  year: 2026,
  rankings: [
    {
      rank: 1,
      dealerId: "...",
      dealerName: "Concession ABC",
      city: "Paris",
      averageScore: 4.8,
      eventCount: 5,
      avgLeadScore: 4.9,
      avgAnimationScore: 4.7,
      avgEngagementScore: 4.8,
      avgCommunicationScore: 4.6,
      avgSatisfactionScore: 5.0,
    },
    // ...
  ]
}
```

### 5. Export des données

**Formats suggérés** :
- **Excel** (recommandé pour tableaux avec filtres)
- **CSV** (pour import dans autres outils)
- **PDF** (pour rapports finalisés)

**Bibliothèques Node.js** :
- `exceljs` pour Excel
- `csv-writer` pour CSV
- `pdfkit` ou `puppeteer` pour PDF

---

## Prochaines étapes

### Backend (Priorité haute)

1. **Implémenter les routes API** dans `apps/api/src/routes/forms.ts`
2. **Créer les contrôleurs** pour gérer la logique métier
3. **Implémenter le système d'email** avec Nodemailer
4. **Créer le système de tokens** pour les formulaires publics
5. **Développer les exports** Excel/CSV/PDF
6. **Implémenter le calcul automatique** des scores DRT
7. **Créer le rapport annuel** avec classement

### Frontend (Améliorations futures)

1. **Ajouter la pagination** sur les listes
2. **Améliorer les filtres** (date ranges, multi-select)
3. **Ajouter des graphiques** (charts.js ou recharts)
4. **Implémenter l'upload de photos** pour les rapports DRT
5. **Créer des templates d'email** personnalisables
6. **Ajouter des notifications** en temps réel (Socket.io)

### Tests

1. **Tests unitaires** des calculs de score
2. **Tests d'intégration** des endpoints API
3. **Tests E2E** des flux utilisateur
4. **Tests de charge** pour les exports

---

## Notes importantes

### Sécurité
- Les formulaires dealers doivent être accessibles uniquement avec token valide
- Les rapports DRT uniquement visibles par les ADMIN
- Validation stricte des données côté backend
- Protection contre les injections SQL (Prisma le fait automatiquement)

### Performance
- Pagination obligatoire pour les listes (limite 50 items par page recommandée)
- Index sur les champs fréquemment filtrés (eventId, dealerId, createdAt)
- Cache des rapports annuels (Redis recommandé)
- Optimisation des requêtes Prisma avec `include` judicieux

### UX
- Indicateurs de chargement sur toutes les actions
- Messages d'erreur clairs et en français
- Confirmations avant actions critiques (envoi email, suppression)
- Toast notifications pour feedback immédiat

---

## Contact et support

Pour toute question sur l'implémentation ou modification des fonctionnalités, référez-vous à :
- Schéma de base de données : `packages/database/prisma/schema.prisma`
- Routes backend existantes : `apps/api/src/routes/`
- Composants UI existants : `apps/backoffice/src/components/`

---

**Date de création** : 2026-01-12
**Version** : 1.0
**Statut** : Frontend implémenté, Backend à développer
