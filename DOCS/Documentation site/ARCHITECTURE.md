# Architecture Yamaha Demo Ride Tour (DRT)

## Vue d'ensemble du projet

Le système Yamaha Demo Ride Tour est une plateforme web complète pour gérer les événements d'essais de motos Yamaha en France. Le projet se compose de trois interfaces principales et d'une API backend centralisée.

## Tableau récapitulatif

| Composant | Technologie | Port | Description |
|-----------|-------------|------|-------------|
| **API Backend** | Node.js + Express + TypeScript | 3001 | API REST + WebSocket pour temps réel |
| **Site Web Public** | React + Vite + TypeScript | 5173 | Interface publique pour les clients |
| **Back Office** | React + Vite + TypeScript | 5174 | Administration Yamaha centrale |
| **Interface Tablette** | React + Vite + TypeScript | 5175 | Gestion sur site des événements |
| **Base de données** | PostgreSQL 15+ | 5432 | Données principales |
| **Cache/Queue** | Redis | 6379 | Sessions, cache, jobs async |

## Architecture monorepo

```
yamaha-drt/
├── apps/
│   ├── api/              # Backend Node.js/Express
│   ├── web/              # Site web public (clients)
│   ├── backoffice/       # Administration Yamaha
│   └── tablet/           # Interface tablette sur site
├── packages/
│   ├── database/         # Prisma client + schéma PostgreSQL
│   ├── types/            # Types TypeScript partagés
│   ├── ui/               # Composants UI réutilisables
│   ├── config/           # Configurations partagées
│   └── utils/            # Utilitaires communs
├── DOCS/                 # Documentation projet
├── package.json          # Root monorepo config
└── turbo.json            # Turborepo configuration
```

## Stack Technique Détaillée

### Frontend (React)

**Frameworks & Build Tools:**
- React 18+ avec TypeScript
- Vite (bundler ultra-rapide)
- React Router v6 (routing)

**State Management:**
- TanStack Query (React Query) pour data fetching
- Zustand pour état global léger

**UI & Styling:**
- Tailwind CSS (utility-first CSS)
- Shadcn/ui (composants accessible React)
- Radix UI (primitives accessibles)

**Forms & Validation:**
- React Hook Form (gestion formulaires)
- Zod (validation schémas TypeScript)

**Autres librairies:**
- date-fns (manipulation dates)
- recharts (graphiques/dashboards)
- react-dropzone (upload fichiers)
- socket.io-client (temps réel)

### Backend (Node.js)

**Core:**
- Node.js 20 LTS
- Express.js (framework web)
- TypeScript (type safety)

**Database & ORM:**
- Prisma ORM (type-safe database client)
- PostgreSQL 15+ (base relationnelle)

**Authentication & Security:**
- bcrypt (hashing mots de passe)
- jsonwebtoken (JWT tokens)
- helmet (sécurité HTTP headers)
- cors (gestion CORS)

**Communication:**
- Nodemailer (envoi emails)
- Socket.io (WebSocket temps réel)
- BullMQ (queues jobs asynchrones)
- Redis (cache + sessions + queues)

**Upload & Storage:**
- Multer (upload fichiers)
- Sharp (traitement images)

**Logging & Monitoring:**
- Winston (logging structuré)

## Modèle de données (Prisma Schema)

### Entités principales

#### Utilisateurs
- **User** : Utilisateurs du système (clients, admin, instructeurs, dealers)
  - Rôles: ADMIN, DEALER, INSTRUCTOR, CLIENT
  - Profil avec permis, coordonnées, moto actuelle

#### Concessionnaires
- **Dealer** : Concessionnaires Yamaha
  - Informations contact et localisation
  - Lien vers site Winteam

#### Motos
- **Motorcycle** : Modèles de motos disponibles
  - Groupes: GROUP_1 (A2), GROUP_2 (A)
  - Statuts: AVAILABLE, IN_USE, DAMAGED, UNDER_REPAIR
  - Numéro de plaque et numéro sticker
- **MotorcycleDamage** : Historique des accidents
- **MotorcycleAvailability** : Disponibilité par événement

#### Événements
- **Event** : Événements DRT (concessions ou publics)
  - Dates, localisation, configuration
- **Session** : Créneaux d'essais (max 7 clients)
  - Groupes séparés, horaires décalés
  - Instructeur assigné

#### Réservations
- **Booking** : Réservations d'essais
  - Statuts: RESERVED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  - Sources: WEBSITE, TABLET, DEALER_SITE
  - Photos permis, signatures électroniques

#### Satisfaction
- **ClientSatisfactionForm** : Formulaire clients post-essai
  - Notes (moto, instructeur, organisation)
  - Intention d'achat
- **DealerSatisfactionForm** : Formulaire concessionnaires
  - Satisfaction organisation
  - Auto-déclaration ventes
- **DRTTeamReport** : Rapport équipe DRT
  - Notation 5 critères pour classement
  - Photos événement

#### Analytics
- **WebsiteAnalytics** : Tracking visiteurs site
- **Notification** : Emails/SMS envoyés

## Flux de données

### 1. Inscription client (Site Web)

```
Client → Site Web → API → Database
                  ↓
              Email confirmation
```

### 2. Réservation essai

```
Client → Recherche événements → Sélection créneau
      → Choix moto → Paiement (si applicable)
      → Confirmation → Email + SMS rappel
```

### 3. Jour de l'événement (Tablette)

```
Client arrive → Check-in tablette → Photo permis
            → Signature décharge → Bipper remis
            → Essai lancé (WebSocket update)
            → Retour essai → Formulaire satisfaction
```

### 4. Gestion accidents (Back Office)

```
Admin → Déclare accident moto
     → Système bloque futures réservations
     → Emails automatiques clients concernés
     → Proposition motos alternatives
```

## Fonctionnalités clés par interface

### Site Web Public (`/apps/web`)

**Pages:**
- Accueil avec présentation DRT
- Recherche événements (carte + liste)
- Détail événement avec sessions disponibles
- Réservation essai (formulaire multi-étapes)
- Espace client (mes réservations, profil)
- FAQ et Contact

**Fonctionnalités:**
- Recherche par ville/date/code postal
- Filtres par type de moto (A/A2)
- Réservation en ligne
- Modification/annulation réservation
- Intégration partielle sites Winteam concessionnaires

### Back Office Yamaha (`/apps/backoffice`)

**Dashboards:**
- Vue d'ensemble des événements
- Statistiques temps réel
- Taux de réservation par événement
- Classement concessionnaires

**Gestion:**
- Événements (CRUD complet)
- Sessions et créneaux
- Modèles de motos et disponibilités
- Utilisateurs et rôles
- Formulaires de satisfaction

**Exports:**
- Leads pour Salesforce (format spécifique)
- Rapport complet par événement
- Données clients pour concessionnaires
- Rapport annuel avec classement

**Communications:**
- Templates emails/SMS
- Statistiques envois
- Taux d'ouverture/clics

### Interface Tablette (`/apps/tablet`)

**Écrans:**
- Sélection événement/jour
- Planning temps réel (grille motos × créneaux)
- Check-in client
- Signature électronique
- Capture photo permis
- Lancement/fin essais
- Formulaire satisfaction

**Fonctionnalités:**
- Sync temps réel via WebSocket
- Mode offline (cache local)
- Vue instructeur (simplifiée pour mobile)
- Gestion 2-4 tablettes simultanées
- Upload photos événement

## Système de notifications

### Emails automatiques

1. **Confirmation réservation**
   - Récapitulatif essai
   - Lien modification/annulation
   - Informations pratiques

2. **Rappel J-7**
   - Rappel date et horaire
   - Conseils préparation

3. **Rappel J-1**
   - Confirmation finale
   - Météo prévue

4. **Modification moto**
   - Moto réservée indisponible
   - Propositions alternatives

5. **Post-essai**
   - Remerciement
   - Lien formulaire satisfaction
   - Offres concessionnaire

### SMS automatiques

- Confirmation réservation (court)
- Rappel J-1
- Code d'accès jour J

## Sécurité

### Authentification
- JWT tokens (7 jours expiration)
- Refresh tokens (optionnel)
- Hashing bcrypt (10 rounds)
- Rate limiting sur login

### Autorisation
- Middleware basé sur rôles
- Permissions granulaires par route
- Validation entrées (Zod schemas)

### RGPD
- Données hébergées en France (OVH)
- Consentement photo explicite
- Suppression compte (right to be forgotten)
- Export données personnelles

## Performance

### Optimisations Frontend
- Code splitting par route
- Lazy loading composants
- Optimistic updates (React Query)
- Cache agressif (SWR strategy)
- Images optimisées (WebP, lazy load)

### Optimisations Backend
- Redis pour cache et sessions
- Connection pooling Prisma
- Compression gzip/brotli
- CDN pour assets statiques
- Pagination systématique

### Temps réel
- WebSocket pour updates tablettes
- Rooms Socket.io par événement
- Fallback polling si WebSocket échoue

## Déploiement

### Infrastructure recommandée (OVH)

```
┌─────────────────────────────────────────┐
│           Load Balancer (OVH)           │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────┐   ┌────────▼────────┐
│   Frontend   │   │   API Backend   │
│   (Static)   │   │  (Node.js VPS)  │
│   Nginx/CDN  │   │                 │
└──────────────┘   └────────┬────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
          ┌────────▼────────┐  ┌────▼─────┐
          │   PostgreSQL    │  │   Redis  │
          │   (Managed DB)  │  │  (Cache) │
          └─────────────────┘  └──────────┘
```

### Environnements

1. **Development** (local)
   - Base PostgreSQL locale
   - Redis local (optionnel)
   - Variables .env.development

2. **Staging**
   - Serveur OVH test
   - Base PostgreSQL staging
   - Accès restreint IP

3. **Production**
   - Serveurs OVH production
   - Base PostgreSQL managed
   - Redis managed
   - Monitoring (Sentry, Grafana)

## Scripts npm

### Root (monorepo)
```bash
npm run dev          # Lancer tous les projets en dev
npm run build        # Builder tous les projets
npm run test         # Lancer tous les tests
npm run lint         # Linter tout le code
npm run typecheck    # Vérifier types TypeScript
```

### Database
```bash
npm run db:generate  # Générer client Prisma
npm run db:push      # Push schema vers DB (dev)
npm run db:migrate   # Créer migration (prod)
npm run db:studio    # Ouvrir Prisma Studio (GUI)
npm run db:seed      # Seed données test
```

### API
```bash
npm run dev          # Lancer API en dev (port 3001)
npm run build        # Builder pour production
npm run start        # Lancer en production
```

### Web/BackOffice/Tablet
```bash
npm run dev          # Lancer en dev (Vite)
npm run build        # Builder pour production
npm run preview      # Preview build production
```

## Prochaines étapes

### Phase 1 - MVP (à développer)
- [x] Architecture et modèle de données
- [x] Setup monorepo et configurations
- [ ] API routes complètes (CRUD)
- [ ] Authentification et autorisation
- [ ] Interface site web public de base
- [ ] Interface back office admin
- [ ] Interface tablette basique

### Phase 2 - Fonctionnalités avancées
- [ ] Système d'emails automatiques
- [ ] Intégration SMS
- [ ] Gestion uploads photos
- [ ] Exports Salesforce
- [ ] Formulaires satisfaction
- [ ] Système de notation concessionnaires

### Phase 3 - Optimisations
- [ ] Mode offline tablette
- [ ] Analytics avancés
- [ ] Intégration sites Winteam
- [ ] Tests e2e
- [ ] Documentation API (Swagger)
- [ ] Monitoring et alertes

### Phase 4 - Déploiement
- [ ] Configuration serveurs OVH
- [ ] CI/CD pipeline
- [ ] Backups automatiques
- [ ] Plan de reprise d'activité
- [ ] Formation utilisateurs

## Support et maintenance

### Logs
- API: `apps/api/logs/`
- Niveau: INFO en dev, WARN en prod
- Rotation quotidienne

### Backups
- Base PostgreSQL: quotidien + rétention 30j
- Uploads fichiers: synchronisation S3-compatible
- Configuration: versionnée Git

### Monitoring
- Health checks: `/health` endpoint
- Uptime monitoring (UptimeRobot ou équivalent)
- Error tracking (Sentry recommandé)
- Performance (Grafana + Prometheus)

---

**Auteur**: Architecture créée pour Yamaha France
**Date**: Janvier 2026
**Version**: 1.0.0
