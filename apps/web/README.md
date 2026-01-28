# Yamaha Demo Ride Tour - Site Web Public

Application React pour le site web public du Yamaha Demo Ride Tour.

## Fonctionnalités

### Pages implémentées

- ✅ **Page d'accueil** (`/`)
  - Hero Section avec vidéo et phrase d'accroche animée
  - Section "Qu'est-ce qui vous attend?" avec 6 cartes interactives
  - Section "Bon à savoir" avec informations pratiques
  - Call-to-action final

- ✅ **Page Réserver un essai** (`/reserver`)
  - Vue carte / Vue liste (toggle)
  - Carte interactive (à implémenter avec Leaflet)
  - Flow de réservation multi-étapes (à développer)

- ✅ **Page FAQ** (`/faq`)
  - 8 questions/réponses avec accordéon animé
  - Section contact

### Composants

**Layout:**
- `Header` - Navigation transparente qui devient opaque au scroll
- `Footer` - Avec mentions légales obligatoires et liens réseaux sociaux

**Pages:**
- `HomePage` - Page d'accueil complète
- `BookingPage` - Réservation d'essais
- `FAQPage` - Questions fréquentes
- `NotFoundPage` - Page 404

**Home Components:**
- `HeroSection` - Hero avec vidéo et animations
- `WhatAwaitsYou` - Section features avec cartes
- `GoodToKnow` - Informations pratiques
- `CallToAction` - CTA final

## Technologies

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animations fluides
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **React Hook Form + Zod** - Formulaires et validation
- **Leaflet + React Leaflet** - Cartes interactives

## Design

### Couleurs

- **Yamaha Blue**: `#0D1B54` (couleur principale)
- **Yamaha Red**: `#DA291C` (accents, CTA)
- **Yamaha Silver**: `#C0C0C0`

### Polices

À définir selon la charte graphique DRT 2026

### Inspirations

Le design s'inspire de:
- https://www.heroinesinc.org (header épuré, phrase d'accroche impactante)
- https://www.noahdemeuldre.com (vidéo immersive, CTA moderne)

## Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Builder pour production
npm run build

# Preview du build
npm run preview
```

Le site sera accessible sur http://localhost:5173

## Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── home/
│       ├── HeroSection.tsx
│       ├── WhatAwaitsYou.tsx
│       ├── GoodToKnow.tsx
│       └── CallToAction.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── BookingPage.tsx
│   ├── FAQPage.tsx
│   └── NotFoundPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Assets requis

Pour que le site fonctionne complètement, il faut ajouter:

### Images

- `/public/images/yamaha-logo.svg` - Logo Yamaha (depuis https://www2.yamaha-motor.fr/logo/)
- `/public/images/yamaha-logo-white.svg` - Logo blanc pour footer
- `/public/images/drt-logo.svg` - Logo Demo Ride Tour
- `/public/images/hero-poster.jpg` - Poster vidéo hero
- `/public/images/hero-fallback.jpg` - Fallback si vidéo ne charge pas
- `/public/images/promo-poster.jpg` - Poster vidéo promo
- `/public/images/riding-group.jpg` - Image groupe d'essai
- `/public/favicon.svg` - Favicon

### Vidéos

- `/public/videos/hero-video.mp4` - Vidéo hero (plein écran)
- `/public/videos/drt-promo.mp4` - Vidéo promotionnelle (horizontale)

**Notes sur les vidéos:**
- Format: MP4 (H.264 codec recommandé)
- Hero: idéalement 1920x1080 minimum, optimisée pour web
- Promo: format 16:9
- Compressées pour chargement rapide

## À développer

### Priorité 1 - Réservation

- [ ] Carte interactive avec Leaflet
  - Marqueurs personnalisés (moto ou diapason Yamaha)
  - Popup au clic avec infos événement
  - Géolocalisation utilisateur

- [ ] Flow de réservation
  1. Sélection événement (carte)
  2. Choix du modèle (grille avec filtres A1/A2/A)
  3. Sélection jour + créneau horaire
  4. Formulaire client
  5. Confirmation

### Priorité 2 - Fonctionnalités

- [ ] Intégration API backend
- [ ] Gestion authentification
- [ ] Espace client (mes réservations)
- [ ] Modification/annulation réservation
- [ ] Formulaire contact

### Priorité 3 - Optimisations

- [ ] SEO (meta tags, sitemap)
- [ ] Performances (lazy loading, code splitting)
- [ ] Accessibilité (ARIA, contraste)
- [ ] Responsive (tests mobiles)
- [ ] Analytics (tracking)

## Notes de design

Selon les spécifications:

1. **Header**: Épuré, logo Yamaha à gauche, 2 onglets à droite
2. **Hero**: Vidéo plein écran avec phrase animée (les "o" roulent)
3. **Features**: 6 cartes (ordre inversé vs mockup initial)
4. **Footer**: Toutes mentions légales obligatoires
5. **CTA**: Rouge Yamaha, dynamique, "Je réserve un essai"

## Conformité

- ✅ Mentions légales obligatoires
- ✅ Bannière écologique "#SeDéplacerMoinsPolluer"
- ✅ RGPD (politique confidentialité, cookies)
- ✅ Copyright Yamaha Motor Europe N.V. Succ. France
- ✅ Accessibilité (à compléter)

---

**Status**: En développement
**Version**: 1.0.0-alpha
