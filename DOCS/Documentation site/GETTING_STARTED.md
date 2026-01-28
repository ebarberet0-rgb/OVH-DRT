# Guide de démarrage - Yamaha Demo Ride Tour

Ce guide vous accompagne pour configurer et lancer le projet Yamaha DRT en local.

## Prérequis

Assurez-vous d'avoir installé:

- **Node.js** >= 20.0.0 ([télécharger](https://nodejs.org/))
- **npm** >= 10.0.0 (inclus avec Node.js)
- **PostgreSQL** >= 15 ([télécharger](https://www.postgresql.org/download/))
- **Redis** (optionnel pour dev, requis pour prod) ([télécharger](https://redis.io/download))
- **Git** ([télécharger](https://git-scm.com/))

### Vérifier les versions

```bash
node --version    # Doit afficher v20.x.x ou supérieur
npm --version     # Doit afficher 10.x.x ou supérieur
psql --version    # Doit afficher 15.x ou supérieur
redis-cli --version  # (optionnel)
```

## Installation

### 1. Cloner le repository (si applicable)

```bash
git clone <repository-url>
cd yamaha-drt
```

### 2. Installer les dépendances

```bash
npm install
```

Cela installera toutes les dépendances pour tous les packages du monorepo grâce aux workspaces npm.

### 3. Configurer PostgreSQL

#### Option A: Installation locale

1. Créer une base de données:

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE yamaha_drt;

# Créer un utilisateur (optionnel)
CREATE USER yamaha_user WITH PASSWORD 'yamaha_password';
GRANT ALL PRIVILEGES ON DATABASE yamaha_drt TO yamaha_user;

# Quitter
\q
```

#### Option B: Docker (alternative rapide)

```bash
docker run --name yamaha-postgres \
  -e POSTGRES_DB=yamaha_drt \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Configurer Redis (optionnel en dev)

#### Installation locale
- Windows: [Redis pour Windows](https://github.com/microsoftarchive/redis/releases)
- Mac: `brew install redis`
- Linux: `sudo apt install redis-server`

#### Docker (alternative)
```bash
docker run --name yamaha-redis \
  -p 6379:6379 \
  -d redis:7
```

### 5. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos paramètres
# Sur Windows: notepad .env
# Sur Mac/Linux: nano .env ou vim .env
```

Valeurs minimales pour démarrer:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yamaha_drt?schema=public"
JWT_SECRET="votre-cle-secrete-de-developpement"
```

### 6. Initialiser la base de données

```bash
# Générer le client Prisma
cd packages/database
npm run db:generate

# Créer les tables (push schema)
npm run db:push

# Seed avec données de test
npm run db:seed
```

Vous devriez voir:
```
✅ Seed terminé avec succès!

📝 Informations de connexion:
  Admin: heloise@yamaha.fr / admin123
  Instructeur 1: instructor1@yamaha.fr / instructor123
  Client 1: client1@example.com / client123
```

### 7. Lancer le projet

#### Option A: Lancer tout en parallèle (recommandé)

```bash
# Retour à la racine
cd ../..

# Lancer tous les projets
npm run dev
```

Cela lancera:
- API Backend sur http://localhost:3001
- Site Web sur http://localhost:5173
- Back Office sur http://localhost:5174
- Interface Tablette sur http://localhost:5175

#### Option B: Lancer individuellement

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Site Web
cd apps/web
npm run dev

# Terminal 3 - Back Office
cd apps/backoffice
npm run dev

# Terminal 4 - Tablette
cd apps/tablet
npm run dev
```

## Vérification

### API Backend

Ouvrir http://localhost:3001/health

Vous devriez voir:
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T...",
  "environment": "development"
}
```

### Prisma Studio (GUI base de données)

```bash
cd packages/database
npm run db:studio
```

Ouvre http://localhost:5555 avec une interface graphique pour explorer la base.

## Comptes de test

Après le seed, vous pouvez vous connecter avec:

### Admin (Back Office)
- Email: `heloise@yamaha.fr`
- Password: `admin123`

### Instructeur
- Email: `instructor1@yamaha.fr`
- Password: `instructor123`

### Client
- Email: `client1@example.com`
- Password: `client123`

## Structure du projet

```
yamaha-drt/
├── apps/
│   ├── api/              ← Backend API (port 3001)
│   ├── web/              ← Site web public (port 5173)
│   ├── backoffice/       ← Admin Yamaha (port 5174)
│   └── tablet/           ← Tablette sur site (port 5175)
├── packages/
│   ├── database/         ← Prisma + PostgreSQL
│   ├── types/            ← Types TypeScript partagés
│   ├── ui/               ← Composants UI
│   └── config/           ← Configs partagées
└── DOCS/                 ← Documentation PDF
```

## Commandes utiles

### Base de données

```bash
# Ouvrir Prisma Studio
cd packages/database && npm run db:studio

# Réinitialiser la base (ATTENTION: efface tout!)
npm run db:push -- --force-reset
npm run db:seed

# Créer une migration (production)
npm run db:migrate -- --name "add_new_feature"
```

### Build

```bash
# Builder tous les projets
npm run build

# Builder un projet spécifique
cd apps/api && npm run build
```

### Tests

```bash
# Lancer tous les tests
npm run test

# Tests d'un package
cd apps/api && npm run test
```

### Linting

```bash
# Linter tout le code
npm run lint

# Type-checking
npm run typecheck
```

## Problèmes courants

### Erreur: "Port already in use"

Un port est déjà utilisé. Options:
1. Tuer le processus: `lsof -ti:3001 | xargs kill` (Mac/Linux) ou Task Manager (Windows)
2. Changer le port dans `.env`: `PORT=3002`

### Erreur: "Cannot connect to database"

Vérifiez:
1. PostgreSQL est démarré: `pg_isready`
2. Les credentials dans `.env` sont corrects
3. La base de données existe: `psql -U postgres -l`

### Erreur: "Prisma Client not generated"

```bash
cd packages/database
npm run db:generate
```

### Erreur lors du seed

Réinitialiser complètement:
```bash
cd packages/database
npm run db:push -- --force-reset
npm run db:seed
```

### Les changements ne s'appliquent pas

En mode dev, Vite et tsx watch devraient recharger automatiquement. Si ce n'est pas le cas:
1. Arrêter les serveurs (Ctrl+C)
2. Nettoyer: `npm run clean`
3. Relancer: `npm run dev`

## Prochaines étapes

Maintenant que le projet est configuré:

1. Explorez l'API avec Postman/Insomnia ou curl
2. Consultez `ARCHITECTURE.md` pour comprendre la structure
3. Lisez les PDFs dans `DOCS/` pour les spécifications détaillées
4. Commencez à développer les fonctionnalités manquantes

## Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation React](https://react.dev)
- [Documentation Express](https://expressjs.com)
- [Documentation TypeScript](https://www.typescriptlang.org/docs)
- [Documentation Vite](https://vitejs.dev)

## Support

Pour toute question:
1. Consultez `ARCHITECTURE.md`
2. Vérifiez les logs: `apps/api/logs/`
3. Consultez la documentation des dépendances

---

Bon développement! 🚀
