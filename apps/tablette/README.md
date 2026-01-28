# Application Tablette - Yamaha DRT

Interface tablette pour la gestion sur site des essais motos lors des événements Demo Ride Tour.

## 📱 Vue d'ensemble

L'application tablette est l'outil principal utilisé par les hôtesses et instructeurs sur le terrain pour gérer en temps réel :

- **Vue planning** avec grille des motos et créneaux horaires
- **Check-in client** avec signature et documents
- **Suivi des essais** (réservé → confirmé → en cours → terminé)
- **Gestion des pannes** avec notification automatique
- **Interface tactile optimisée** pour tablettes (44x44px touch targets)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- API backend en cours d'exécution (port 3001)

### Installation

```bash
cd apps/tablette
npm install
```

### Configuration

Créer un fichier `.env` :

```env
VITE_API_URL=http://localhost:3001
```

### Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5174`

## 🎨 Structure de l'application

### Pages principales

#### 1. Login (`/login`)
- Authentification par email/mot de passe
- Session persistante avec Zustand

#### 2. Sélection d'événement (`/`)
- Liste des événements disponibles
- Filtrage par statut (en cours, à venir, terminé)
- Statistiques rapides par événement

#### 3. Vue Planning (`/event/:eventId/planning`)
- **Grille planning** : 2 groupes de motos × créneaux de 30 minutes
- **Filtres** : Tous / Groupe 1 / Groupe 2 / Disponibles
- **Codes couleur** :
  - 🟦 Bleu clair : Réservé
  - 🟩 Vert : Confirmé/Prêt
  - 🟨 Jaune : En cours d'essai
  - ⚪ Gris : Terminé
  - ⬜ Blanc : Disponible
  - 🟥 Rouge : Moto indisponible

## 🔄 Workflow de check-in

### 1. Client arrive
- Rechercher le nom dans le planning
- Cliquer sur la case avec la réservation

### 2. Modal détails client
- Informations client (nom, email, téléphone)
- Détails essai (moto, créneau, groupe)
- Documents à compléter :
  - ☑ Décharge signée
  - 📷 Photo permis
  - #️⃣ Numéro de dossard

### 3. Confirmer présence
- Bouton "Confirmer la présence"
- Case devient VERTE
- Formulaire documents s'affiche

### 4. Compléter documents
- Cocher "Décharge signée"
- Prendre photo du permis (à implémenter)
- Attribuer numéro de dossard

### 5. Démarrer l'essai
- À l'heure du créneau
- Bouton "Démarrer l'essai"
- Case devient JAUNE

### 6. Terminer l'essai
- Quand le client revient
- Bouton "Terminer l'essai"
- Case devient GRISE

## 🔧 Gestion des pannes

### Signaler un problème
1. Long press sur la moto concernée (à implémenter)
2. Ou via bouton dans modal détails
3. Formulaire de signalement :
   - Type : Chute / Panne mécanique / Autre
   - Description (minimum 10 caractères)
   - Photo (optionnelle)
   - ☑ Bloquer réservations futures

### Conséquences
- Tous les créneaux futurs → ROUGE
- Emails automatiques aux clients concernés
- Proposition de motos alternatives

## 🎨 Design System

### Couleurs Yamaha

```css
--yamaha-blue: #0D1B54
--yamaha-red: #DA291C
```

### Statuts

```css
--status-reserved: #BFDBFE      /* Bleu clair */
--status-confirmed: #86EFAC     /* Vert */
--status-in-progress: #FDE047   /* Jaune */
--status-completed: #D1D5DB     /* Gris */
--status-available: #FFFFFF     /* Blanc */
--status-unavailable: #FCA5A5   /* Rouge */
```

### Touch Targets

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### Boutons

- `.tablet-button-primary` : Yamaha bleu
- `.tablet-button-secondary` : Gris
- `.tablet-button-danger` : Yamaha rouge

## 📡 API

### Endpoints utilisés

```typescript
// Events
GET /api/events
GET /api/events/:eventId
GET /api/events/:eventId/bookings?date=YYYY-MM-DD

// Bookings
POST /api/bookings/:bookingId/confirm
POST /api/bookings/:bookingId/start
POST /api/bookings/:bookingId/complete
POST /api/bookings/:bookingId/cancel
PATCH /api/bookings/:bookingId/documents

// Motorcycles
POST /api/motorcycles/:motorcycleId/breakdown
PATCH /api/motorcycles/:motorcycleId/status
```

### Authentification

- Header : `Authorization: Bearer <token>`
- Token stocké dans Zustand avec persistence

## 🛠️ Stack technique

### Frontend
- **React 19** + **TypeScript**
- **Vite** pour le build
- **React Router** pour la navigation
- **TanStack Query** pour la gestion des données
- **Zustand** pour l'état global (auth)
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **React Hot Toast** pour les notifications

### Librairies
- **axios** : Requêtes HTTP
- **date-fns** : Manipulation des dates

## 📱 Optimisations tablette

### Performance
- Query caching (30s stale time)
- Refetch on focus désactivé
- Images optimisées et lazy loading

### UX tactile
- Touch targets 44x44px minimum
- Feedback visuel sur tap (active:scale-95)
- Pas de hover states (touch-friendly)
- Gestes supportés :
  - Tap : Sélection
  - Long press : Menu contextuel (à venir)
  - Swipe : Changement de jour (à venir)

### Responsive
- Paysage (1024px+) : Vue complète
- Portrait (768px+) : Vue adaptée

## 🔐 Sécurité

### Routes protégées
- Toutes les routes (sauf `/login`) nécessitent authentification
- Redirect automatique vers login si non authentifié
- Logout automatique sur erreur 401

### Session
- Token JWT stocké dans localStorage (via Zustand persist)
- Timeout après 8h d'inactivité (à implémenter)

## 🧪 Test

### Identifiants de test
```
Email: dealer@test.com
Mot de passe: password123
```

### Scénarios critiques
1. Check-in de 5 clients simultanés
2. Démarrage d'un groupe complet
3. Signalement moto indisponible
4. Annulation de réservation
5. Changement de jour

## 📦 Build & Déploiement

### Build production

```bash
npm run build
```

Le dossier `dist/` contient les fichiers statiques.

### Hébergement
- Même domaine que web et backoffice
- Route : `https://drt.yamaha.fr/tablette`

### Variables d'environnement production

```env
VITE_API_URL=https://api.drt.yamaha.fr
```

## 🚧 Fonctionnalités à venir

### Phase 2
- [ ] Upload photos événement
- [ ] Formulaire satisfaction sur tablette
- [ ] Mode hors ligne avec synchronisation
- [ ] Long press pour menu contextuel
- [ ] Swipe pour changer de jour

### Phase 3
- [ ] Statistiques temps réel
- [ ] Notifications push
- [ ] Multi-tablettes synchronisées
- [ ] Export PDF du planning

## 📚 Documentation complète

Voir [TABLETTE_SPECIFICATION.md](../../TABLETTE_SPECIFICATION.md) pour la spécification complète.

## 🐛 Debug

### Problèmes courants

**Erreur "Network Error"**
- Vérifier que l'API est lancée sur port 3001
- Vérifier VITE_API_URL dans .env

**Écran blanc après build**
- Vérifier les chemins de base dans vite.config.ts
- Vérifier les imports de composants

**Authentification ne persiste pas**
- Vérifier localStorage autorisé
- Vérifier Zustand persist configuration

## 👥 Support

Pour toute question :
- Consulter la documentation complète
- Contacter l'équipe développement
