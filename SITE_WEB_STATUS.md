# Site Web Yamaha DRT - État d'avancement

**Date**: 11 janvier 2026
**Version**: 1.0.0-beta

## ✅ Fonctionnalités implémentées

### 1. Architecture et configuration

- [x] React 18 + TypeScript + Vite
- [x] Tailwind CSS avec couleurs Yamaha (bleu #0D1B54, rouge #DA291C)
- [x] Framer Motion pour animations
- [x] React Router pour navigation
- [x] TanStack Query pour data fetching
- [x] Leaflet + React Leaflet pour carte interactive
- [x] Configuration complète (tsconfig, vite, postcss, tailwind)

### 2. Layout et navigation

**Header** (`/components/layout/Header.tsx`)
- [x] Logo Yamaha à gauche (cliquable vers accueil)
- [x] Navigation: "Réserver un essai" et "FAQ"
- [x] Transparent au départ, opaque au scroll
- [x] Menu mobile responsive
- [x] Onglet Admin caché (pas accessible clients)

**Footer** (`/components/layout/Footer.tsx`)
- [x] Bannière écologique obligatoire "#SeDéplacerMoinsPolluer"
- [x] 3 colonnes: À propos, Liens, Réseaux sociaux
- [x] Liens vers Yamaha Motor France et Yamaha Rent
- [x] Réseaux sociaux (Facebook, Instagram, YouTube)
- [x] Mentions légales, confidentialité, cookies
- [x] Copyright Yamaha Motor Europe NV Succ France
- [x] Bouton "Retour en haut"

### 3. Page d'accueil (`/`)

**Hero Section** (`/components/home/HeroSection.tsx`)
- [x] Vidéo plein écran en background avec overlay
- [x] Phrase d'accroche "Faites un tour au Démo Ride Tour"
- [x] DRT en rouge avec animation des "o" qui roulent (Framer Motion)
- [x] CTA "Je réserve un essai" dynamique avec hover effect
- [x] Indicateur scroll animé (chevron qui bounce)
- [x] Fallback image si vidéo ne charge pas

**Section "Qu'est-ce qui vous attend?"** (`/components/home/WhatAwaitsYou.tsx`)
- [x] Logo Demo Ride Tour centré
- [x] Titre "Qu'est-ce qui vous attend ?"
- [x] 6 cartes features animées au scroll (ordre inversé):
  1. Un camion qui traverse la France
  2. 18 dates en France
  3. 20 modèles disponibles
  4. 45 minutes d'essai
  5. Une équipe d'experts
  6. Gilets airbag Ixon
- [x] Icônes Lucide React colorées
- [x] Effet hover sur les cartes
- [x] Vidéo promotionnelle horizontale en dessous
- [x] Animations stagger avec Framer Motion

**Section "Bon à savoir"** (`/components/home/GoodToKnow.tsx`)
- [x] Titre "Bon à savoir" (renommé depuis "Informations importantes")
- [x] 3 cartes avec icônes:
  - Documents requis (permis A1/A2/A, carte d'identité)
  - Équipement obligatoire (5 items)
  - Possibilités d'essai (jusqu'à 2 modèles, jeunes permis)
- [x] Image pleine largeur groupe d'essai
- [x] Design épuré avec fond gris clair

**Call-to-Action** (`/components/home/CallToAction.tsx`)
- [x] Fond gradient bleu Yamaha
- [x] Titre "PRÊT À VIVRE L'EXPÉRIENCE ?"
- [x] Sous-titre "À très vite au pied du camion ! 🏍️"
- [x] CTA "DÉCOUVRIR LES ÉVÉNEMENTS" avec flèche
- [x] Animation au scroll

### 4. Page Réservation (`/reserver`)

**Vue d'ensemble** (`/pages/BookingPage.tsx`)
- [x] Titre "Événements Démo Ride Tour 2026"
- [x] Sous-titre avec limite 2 essais gratuits
- [x] Toggle VUE CARTE / VUE LISTE avec design Yamaha
- [x] Loading state avec spinner
- [x] 6 événements de démonstration (mock data)
- [x] Encadré "Bon à savoir" en bas

**Carte interactive** (`/components/booking/EventMap.tsx`)
- [x] Intégration Leaflet avec React Leaflet
- [x] Centre de la France comme position par défaut
- [x] Marqueurs personnalisés Yamaha (rouge avec icône moto)
- [x] 6 marqueurs pour les événements (Paris, Lyon, Marseille, Toulouse, Bordeaux, Strasbourg)
- [x] Popup au clic avec:
  - Titre "Demo Ride [Ville]"
  - Icône MapPin
  - Nom du concessionnaire
  - Date formatée (JJ & JJ mois année)
  - Horaires 9h-18h
  - Places disponibles (badge vert)
  - Bouton "CHOISIR LE MODÈLE"
- [x] Info bulle en haut "Carte interactive: Cliquez sur..."
- [x] Design épuré et professionnel
- [x] Responsive

**Vue liste** (`/components/booking/EventList.tsx`)
- [x] Liste cards pour chaque événement
- [x] Informations complètes:
  - Titre avec ville
  - Concessionnaire + adresse
  - Date (format français)
  - Horaires
  - Places disponibles avec badge coloré (vert/jaune/rouge)
- [x] Barre de progression en bas de chaque card
- [x] Bouton "CHOISIR LE MODÈLE" ou "COMPLET"
- [x] Badge dynamique selon disponibilité:
  - "Beaucoup de places" (>50%)
  - "Places limitées" (20-50%)
  - "Dernières places" (<20%)
- [x] Hover effects
- [x] Responsive

### 5. Page FAQ (`/faq`)

**Contenu** (`/pages/FAQPage.tsx`)
- [x] 8 questions/réponses
- [x] Accordéon animé avec Framer Motion
- [x] Icône chevron qui tourne
- [x] Section contact en bas avec email
- [x] Design épuré
- [x] Responsive

### 6. Page 404

**Page non trouvée** (`/pages/NotFoundPage.tsx`)
- [x] Grand "404" en bleu Yamaha
- [x] Message d'erreur
- [x] Bouton "Retour à l'accueil"
- [x] Bouton "Page précédente"

## 🎨 Design et UX

### Conformité aux spécifications

- [x] Style épuré et moderne (inspiré de heroinesinc.org)
- [x] Header sans bandeau uni (plonge dans le visuel)
- [x] Phrase d'accroche impactante avec typo 2 couleurs
- [x] Vidéo immersive (inspiré de noahdemeuldre.com)
- [x] CTA dynamiques et modernes
- [x] Cartes features inversées (ordre demandé)
- [x] Tous les textes conformes aux specs

### Couleurs Yamaha

- **Bleu principal**: `#0D1B54` (navigation, titres, accents)
- **Rouge CTA**: `#DA291C` (boutons, liens importants)
- **Argent**: `#C0C0C0` (à utiliser si besoin)

### Animations

- [x] Hero: fade in + animation rolling "o"
- [x] Sections: stagger children au scroll
- [x] Cartes: hover effects
- [x] Transitions fluides partout
- [x] Scroll smooth
- [x] Accordéon FAQ animé

### Responsive

- [x] Mobile-first approach
- [x] Breakpoints: sm, md, lg, xl, 2xl
- [x] Menu mobile burger
- [x] Grilles adaptatives
- [x] Images responsive
- [x] Textes fluides

## 📊 Données de démonstration

**6 événements mock:**
1. Paris (42/84 places)
2. Lyon (28/84 places)
3. Marseille (12/84 places) - Dernières places
4. Toulouse (56/84 places)
5. Bordeaux (70/84 places) - Beaucoup de places
6. Strasbourg (38/84 places)

## 🚀 Pour lancer le projet

```bash
# Depuis la racine du monorepo
cd apps/web

# Installer les dépendances (si pas déjà fait)
npm install

# Lancer en développement
npm run dev

# Le site sera accessible sur http://localhost:5173
```

## 📁 Structure des fichiers

```
apps/web/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── WhatAwaitsYou.tsx
│   │   │   ├── GoodToKnow.tsx
│   │   │   └── CallToAction.tsx
│   │   └── booking/
│   │       ├── EventMap.tsx          ← NOUVEAU!
│   │       └── EventList.tsx         ← NOUVEAU!
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── BookingPage.tsx           ← MISE À JOUR!
│   │   ├── FAQPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                     ← Styles Leaflet ajoutés
├── public/
│   ├── images/                       ← À ajouter
│   └── videos/                       ← À ajouter
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎯 Assets nécessaires

### Images à ajouter dans `/public/images/`

- [x] `yamaha-logo.svg` - Logo Yamaha (créé avec diapason officiel)
- [x] `yamaha-logo-white.svg` - Logo blanc pour footer (créé)
- [x] `drt-logo.svg` - Logo Demo Ride Tour (créé)
- [ ] `hero-poster.jpg` - Poster pour vidéo hero
- [ ] `hero-fallback.jpg` - Fallback si vidéo ne charge pas
- [ ] `promo-poster.jpg` - Poster vidéo promo
- [ ] `drt-promo-fallback.jpg` - Fallback vidéo promo
- [ ] `riding-group.jpg` - Image groupe d'essai

### Vidéos à ajouter dans `/public/videos/`

- [ ] `hero-video.mp4` - Vidéo hero plein écran (HD, optimisée web)
- [ ] `drt-promo.mp4` - Vidéo promo horizontale (16:9)

**Spécifications vidéos:**
- Format: MP4, codec H.264
- Hero: 1920x1080 minimum, format libre
- Promo: 16:9 obligatoire
- Compressées pour chargement rapide (<10 MB idéal)

## ⚡ Fonctionnalités

### Implémentées

- [x] Navigation complète
- [x] Page d'accueil avec animations
- [x] Carte interactive Leaflet
- [x] Vue liste événements
- [x] Toggle carte/liste
- [x] Mock data 6 événements
- [x] FAQ avec accordéon
- [x] Page 404
- [x] Footer complet avec mentions légales
- [x] Responsive mobile

### À implémenter

- [ ] Connexion API backend
- [ ] Page sélection modèle (étape 2 réservation)
- [ ] Page sélection créneau (étape 3)
- [ ] Formulaire client (étape 4)
- [ ] Page confirmation (étape 5)
- [ ] Authentification utilisateur
- [ ] Espace client (mes réservations)
- [ ] Modification/annulation réservation
- [ ] Filtres avancés événements
- [ ] Recherche par ville/code postal
- [ ] Géolocalisation utilisateur
- [ ] SEO (meta tags, sitemap)
- [ ] Analytics tracking

## 🔌 Intégration API

Actuellement, `BookingPage` utilise des données mock. Pour connecter à l'API:

```typescript
// Dans apps/web/src/pages/BookingPage.tsx
const { data: events, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: async () => {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },
});
```

## 🐛 Points d'attention

1. **Leaflet SSR**: Leaflet ne fonctionne que côté client. Le composant utilise déjà les bonnes pratiques.

2. **Images Leaflet**: Les icônes par défaut de Leaflet peuvent ne pas charger avec Vite. Le fix est déjà en place dans `EventMap.tsx`.

3. **Vidéos**: Les chemins vers les vidéos sont en dur. S'assurer que les fichiers sont bien dans `/public/videos/`.

4. **Couleurs DRT 2026**: Actuellement, on utilise rouge Yamaha. À ajuster selon la charte graphique finale.

5. **Marqueurs personnalisés**: L'icône actuelle est un SVG custom. Pour utiliser une vraie moto ou le diapason Yamaha, remplacer le HTML dans `createYamahaIcon()`.

## 📝 Notes de développement

### Performances

- Lazy loading des composants lourds (à implémenter)
- Code splitting par route (Vite le fait automatiquement)
- Images optimisées (utiliser WebP + fallback)
- Vidéos compressées

### Accessibilité

- [ ] Ajouter ARIA labels manquants
- [x] Contraste couleurs respecté
- [x] Navigation clavier fonctionnelle
- [ ] Tests avec lecteur d'écran

### SEO

- [ ] Meta tags par page
- [ ] Open Graph pour partage social
- [ ] Sitemap XML
- [ ] robots.txt

## ✨ Prochaines étapes recommandées

1. **Ajouter les assets** (logos, vidéos, images)
2. **Tester la carte** en local
3. **Implémenter le flow de réservation** (5 étapes)
4. **Connecter à l'API backend**
5. **Ajouter authentification**
6. **Tests E2E** (Playwright)
7. **Optimisations** (lighthouse, bundle size)
8. **Déploiement** staging

---

**Status**: ✅ Carte interactive fonctionnelle
**Prêt pour**: Tests et ajout des assets
**Version**: 1.0.0-beta
