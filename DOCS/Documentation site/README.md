# Yamaha Demo Ride Tour (DRT)

Système de gestion complet pour les événements d'essais de motos Yamaha en France.

## Architecture

Ce projet est un monorepo contenant:

### Applications (`apps/`)

- **web** - Site web public (vitrine + inscriptions)
- **backoffice** - Administration centrale Yamaha
- **tablet** - Interface tablette pour les événements

### Packages partagés (`packages/`)

- **database** - Schéma Prisma et client PostgreSQL
- **ui** - Composants UI réutilisables
- **config** - Configurations partagées (TypeScript, ESLint, etc.)
- **types** - Types TypeScript partagés
- **utils** - Utilitaires communs

## Stack Technique

### Frontend
- React 18+ avec TypeScript
- Vite
- Tailwind CSS + Shadcn/ui
- TanStack Query
- React Router

### Backend
- Node.js 20 LTS
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL 15+
- Redis
- Socket.io

## Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 15+
- Redis (optionnel en développement)

## Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL

# Créer la base de données
npm run db:push

# Lancer en développement
npm run dev
```

## Scripts disponibles

- `npm run dev` - Lancer tous les projets en mode développement
- `npm run build` - Builder tous les projets
- `npm run test` - Lancer les tests
- `npm run lint` - Linter le code
- `npm run typecheck` - Vérifier les types TypeScript

## Structure du projet

```
yamaha-drt/
├── apps/
│   ├── web/              # Site web public
│   ├── backoffice/       # Administration Yamaha
│   ├── tablet/           # Interface tablette
│   └── api/              # API backend
├── packages/
│   ├── database/         # Prisma + PostgreSQL
│   ├── ui/               # Composants UI
│   ├── config/           # Configurations
│   ├── types/            # Types TypeScript
│   └── utils/            # Utilitaires
├── DOCS/                 # Documentation
├── package.json
├── turbo.json
└── README.md
```

## Fonctionnalités principales

### Site Web Public
- Présentation du Demo Ride Tour
- Recherche d'événements par localisation/date
- Réservation d'essais en ligne
- Gestion de compte utilisateur
- Modification/annulation de réservations

### Back Office Yamaha
- Dashboard avec statistiques en temps réel
- Gestion des événements et créneaux
- Gestion des modèles de motos
- Exports de données (Salesforce, leads)
- Formulaires de satisfaction
- Notation des concessionnaires

### Interface Tablette
- Vue planning en temps réel
- Check-in des participants
- Signature électronique
- Photo du permis de conduire
- Gestion des départs/retours d'essais
- Formulaires de satisfaction

## Licence

UNLICENSED - Propriété de Yamaha France
