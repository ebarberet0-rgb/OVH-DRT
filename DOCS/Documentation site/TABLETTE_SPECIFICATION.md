# Application Tablette - Yamaha DRT
## Spécifications fonctionnelles complètes

---

## 🎯 Objectif

L'application tablette est l'outil principal sur le terrain pour gérer en temps réel les essais motos lors des événements Demo Ride Tour. Elle permet aux hôtesses d'avoir une vue d'ensemble des essais et de gérer le flux des clients tout au long de la journée.

---

## 📱 Caractéristiques techniques

- **Format**: Application web optimisée pour tablette (iPad, Android tablets)
- **Orientation**: Paysage (landscape) principalement
- **Résolution cible**: 1024x768 minimum
- **Hors ligne**: Synchronisation intelligente (à prévoir)
- **Performance**: Navigation fluide et réactive

---

## 🗂️ Structure de l'application

### 1. **Écran de sélection d'événement**
**Route**: `/`

**Fonctionnalités**:
- Liste des événements à venir et en cours
- Filtrage par date
- Sélection du week-end DRT concerné
- Affichage des informations clés (concession, dates, nombre de motos)

**Design**:
- Cartes larges avec preview des événements
- Code couleur par statut (à venir, en cours, terminé)
- Bouton d'actualisation visible

---

### 2. **Vue Planning Principal**
**Route**: `/event/:eventId/planning`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Header: Nom événement | Jour 1/2 | Heure actuelle     │
├─────────────────────────────────────────────────────────┤
│ Filtres: Groupe 1 | Groupe 2 | Tous | Disponibles     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GROUPE 1                                               │
│  ┌───┬──────────┬──────┬──────┬──────┬──────┬──────┐  │
│  │ 1 │ MT-07    │ 9h00 │ 9h30 │10h00 │10h30 │11h00 │  │
│  │   │ [Image]  │ Jean │      │ Paul │      │      │  │
│  ├───┼──────────┼──────┼──────┼──────┼──────┼──────┤  │
│  │ 2 │ XSR 700  │ 9h00 │ 9h30 │10h00 │10h30 │11h00 │  │
│  │   │ [Image]  │ Marc │ Lisa │      │      │      │  │
│  └───┴──────────┴──────┴──────┴──────┴──────┴──────┘  │
│                                                         │
│  GROUPE 2                                               │
│  ┌───┬──────────┬──────┬──────┬──────┬──────┬──────┐  │
│  │ 3 │ MT-09    │ 9h15 │ 9h45 │10h15 │10h45 │11h15 │  │
│  │   │ [Image]  │      │ Anne │      │ Tom  │      │  │
│  └───┴──────────┴──────┴──────┴──────┴──────┴──────┘  │
└─────────────────────────────────────────────────────────┘
```

**Codes couleur des créneaux**:
- 🟦 **Bleu clair**: Réservé, pas encore confirmé sur place
- 🟩 **Vert**: Confirmé, en attente de départ
- 🟨 **Jaune**: En cours d'essai (moto sur la route)
- ⚪ **Gris**: Essai terminé
- ⬜ **Blanc**: Disponible à la réservation
- 🟥 **Rouge**: Moto indisponible (panne/chute)

**Interactions**:
- Tap sur une case → Ouvre modal avec détails client
- Long press → Actions rapides (annuler, modifier)
- Swipe left/right → Changer de jour
- Pinch to zoom → Agrandir le planning (optionnel)

---

### 3. **Modal Détails Client**
**Déclenchement**: Click sur une réservation

**Contenu**:
```
┌─────────────────────────────────┐
│ Client: Jean Dupont             │
│ Email: jean@example.com         │
│ Tel: 06 12 34 56 78             │
│ Moto: MT-07 (N°1)               │
│ Créneau: 9h00 - 9h30            │
│                                 │
│ Statut actuel: ⏳ Réservé       │
│                                 │
│ Actions disponibles:            │
│ [✅ Confirmer présence]          │
│ [📄 Voir/Signer documents]       │
│ [🚀 Démarrer l'essai]            │
│ [🏁 Terminer l'essai]            │
│ [❌ Annuler]                     │
│                                 │
│ Documents:                      │
│ □ Décharge signée               │
│ □ Photo permis                  │
│ □ Dossard remis (#__)           │
│                                 │
│        [Fermer]  [Sauvegarder]  │
└─────────────────────────────────┘
```

---

### 4. **Workflow de Check-in**

#### **Étape 1: Client arrive**
1. Hôtesse recherche le nom du client dans la vue planning
2. Tap sur la case avec le nom du client
3. Modal s'ouvre avec les détails

#### **Étape 2: Confirmation de présence**
1. Click sur "Confirmer présence"
2. Case devient VERTE
3. Formulaire de documents s'affiche

#### **Étape 3: Compléter les documents**
- Signature électronique de la décharge
- Photo du permis (caméra tablette)
- Attribution d'un numéro de dossard
- Case à cocher pour chaque document

#### **Étape 4: Départ en essai**
1. À l'heure du créneau, l'hôtesse sélectionne la COLONNE du créneau
2. Bouton "Démarrer le groupe" apparaît
3. Click → Toutes les motos du créneau passent en JAUNE (en cours)

#### **Étape 5: Retour d'essai**
1. Quand le groupe revient (30 min après)
2. Sélectionner la même colonne
3. Bouton "Terminer le groupe"
4. Click → Cases passent en GRIS (terminé)

---

### 5. **Gestion des motos indisponibles**

**Scénario**: Une moto chute ou tombe en panne

**Actions**:
1. Long press sur la moto concernée
2. Menu contextuel: "Signaler un problème"
3. Modal s'ouvre:
   ```
   ┌─────────────────────────────────┐
   │ Moto: MT-07 (N°1)               │
   │                                 │
   │ Problème:                       │
   │ ○ Chute                         │
   │ ○ Panne mécanique               │
   │ ○ Autre                         │
   │                                 │
   │ Description:                    │
   │ [________________]              │
   │                                 │
   │ Photo:                          │
   │ [📷 Prendre photo]               │
   │                                 │
   │ ☑ Bloquer toutes les            │
   │   réservations futures          │
   │                                 │
   │    [Annuler]  [Signaler]        │
   └─────────────────────────────────┘
   ```

4. Si "Bloquer réservations" coché:
   - Tous les créneaux futurs de cette moto → ROUGE
   - Emails automatiques aux clients concernés
   - Proposition de motos alternatives

---

### 6. **Réservation directe sur place**

**Accès**: Bouton "➕ Nouvelle réservation" en haut du planning

**Flow**:
1. Sélectionner une moto
2. Sélectionner un créneau DISPONIBLE (blanc)
3. Formulaire rapide:
   ```
   Prénom: [_______]
   Nom: [_______]
   Email: [_______]
   Téléphone: [_______]

   [Annuler]  [Créer réservation]
   ```
4. Réservation ajoutée immédiatement au planning

---

### 7. **Module Photo pour documentation**

**Route**: `/event/:eventId/photos`

**Fonctionnalités**:
- Galerie de photos de l'événement
- Upload depuis caméra tablette
- Catégories:
  - Animations
  - Promotions
  - Communication
  - Stand
  - Autre
- Ajout de légendes
- Synchronisation avec le dossier concession

**Interface**:
```
┌─────────────────────────────────┐
│ Photos de l'événement           │
│                                 │
│ [📷 Prendre une photo]           │
│                                 │
│ Animations (3)                  │
│ [img] [img] [img]               │
│                                 │
│ Promotions (2)                  │
│ [img] [img]                     │
│                                 │
│ Communication (5)               │
│ [img] [img] [img] [img] [img]  │
└─────────────────────────────────┘
```

---

### 8. **Formulaire de satisfaction client (sur tablette)**

**Route**: `/satisfaction/:bookingId`

**Quand l'afficher**:
- Après que le client termine son essai
- Modal automatique ou accès via bouton

**Contenu**: Identique au formulaire web mais optimisé tactile
- Étoiles plus grandes (touch-friendly)
- Clavier tactile adapté
- Validation immédiate

---

## 🎨 Design System pour tablette

### Palette de couleurs
```css
--yamaha-blue: #0D1B54;
--yamaha-red: #DA291C;
--status-reserved: #BFDBFE;      /* Bleu clair */
--status-confirmed: #86EFAC;     /* Vert clair */
--status-in-progress: #FDE047;   /* Jaune */
--status-completed: #D1D5DB;     /* Gris */
--status-available: #FFFFFF;     /* Blanc */
--status-unavailable: #FCA5A5;   /* Rouge clair */
```

### Typography
```css
--font-header: 24px bold;
--font-body: 16px normal;
--font-small: 14px normal;
--font-tiny: 12px normal;
```

### Spacing (optimisé tablette)
```css
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### Touch targets
- Minimum: 44x44px
- Optimal: 48x48px
- Espacement entre boutons: 8px minimum

---

## 📊 États de réservation

### Cycle de vie d'une réservation

```
RESERVED (Réservé)
    ↓ [Confirmer présence]
CONFIRMED (Confirmé sur place)
    ↓ [Compléter documents]
READY (Prêt à partir)
    ↓ [Démarrer essai]
IN_PROGRESS (En cours)
    ↓ [Terminer essai]
COMPLETED (Terminé)
```

### Propriétés d'une réservation

```typescript
interface TabletBooking {
  id: string;
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  motorcycleId: string;
  motorcycleNumber: number;  // Numéro du sticker
  motorcycleModel: string;
  motorcycleImage: string;
  group: 1 | 2;
  timeSlot: string;          // "09:00"
  status: BookingStatus;

  // Documents
  waiverSigned: boolean;
  waiverSignatureUrl?: string;
  licensePhotoUrl?: string;
  bibNumber?: number;        // Numéro de dossard

  // Timestamps
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}
```

---

## 🔄 Synchronisation temps réel

### WebSocket Events

```typescript
// Client → Server
'tablet:booking:confirm'
'tablet:booking:start'
'tablet:booking:complete'
'tablet:motorcycle:breakdown'

// Server → Client
'booking:updated'
'booking:created'
'motorcycle:status:changed'
```

### Stratégie hors ligne
1. **Mode connecté**: Synchronisation instantanée
2. **Mode déconnecté**:
   - Stockage local des actions
   - Queue de synchronisation
   - Indicateur visuel "Mode hors ligne"
   - Sync automatique au retour de connexion

---

## 🚀 Performance

### Optimisations
- Virtualisation de la liste de créneaux (react-window)
- Images compressées et lazy loading
- Debouncing des actions rapides
- Cache des données événement
- Service Worker pour offline

### Métriques cibles
- First Load: < 2s
- Interaction delay: < 100ms
- Smooth scrolling: 60fps

---

## 🔐 Sécurité

### Authentification
- Login avec email + mot de passe
- Session persistante sur tablette
- Rôle: INSTRUCTOR ou DEALER
- Timeout après 8h d'inactivité

### Autorisations
- Accès uniquement aux événements assignés
- Pas d'accès aux données financières
- Logs de toutes les actions

---

## 📱 Responsive

### Orientations supportées
- **Paysage (principal)**: Planning complet
- **Portrait**: Vue liste simplifiée

### Breakpoints
- Tablet landscape: 1024px+
- Tablet portrait: 768px+
- Large tablet: 1280px+

---

## 🧪 Testing

### Scénarios critiques à tester
1. Check-in de 5 clients en même temps
2. Démarrage d'un groupe complet
3. Signalement moto HS pendant essai
4. Réservation directe + check-in immédiat
5. Perte de connexion pendant action
6. Changement de jour en milieu d'événement

---

## 📦 Déploiement

### Configuration
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_UPLOAD_MAX_SIZE=10485760  # 10MB
```

### Build
```bash
npm run build
# Output: apps/tablette/dist
```

### Hébergement
- Même domaine que web et backoffice
- Route: https://drt.yamaha.fr/tablette

---

## 🎯 Roadmap

### Phase 1 (MVP)
- ✅ Sélection événement
- ✅ Vue planning
- ✅ Check-in client
- ✅ Gestion statuts

### Phase 2
- Upload photos
- Formulaire satisfaction
- Mode hors ligne

### Phase 3
- Statistiques temps réel
- Notifications push
- Multi-tablettes sync

---

**Prêt pour l'implémentation !** 🚀
