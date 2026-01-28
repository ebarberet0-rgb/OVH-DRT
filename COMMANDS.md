# Commandes Yamaha DRT - Aide-mémoire

## 🚀 Démarrage rapide

```bash
# Installation initiale (une seule fois)
npm install

# Configurer .env
cp .env.example .env
# Puis éditer .env avec vos paramètres

# Initialiser la base de données
cd packages/database
npm run db:push
npm run db:seed
cd ../..

# Lancer tout le projet
npm run dev
```

## 📦 Gestion des packages

```bash
# Installer une dépendance dans un package spécifique
npm install <package> -w apps/api
npm install <package> -w apps/web
npm install <package> -w packages/database

# Installer une dépendance globale (root)
npm install <package> -D

# Lister tous les workspaces
npm workspaces list
```

## 🗄️ Base de données (Prisma)

```bash
cd packages/database

# Générer le client Prisma (après modification schema)
npm run db:generate

# Push le schema vers la DB (développement)
npm run db:push

# Créer une migration (production)
npm run db:migrate -- --name "description_migration"

# Seed la base avec données de test
npm run db:seed

# Ouvrir Prisma Studio (GUI)
npm run db:studio

# Réinitialiser complètement la DB (⚠️ EFFACE TOUT!)
npm run db:push -- --force-reset
npm run db:seed
```

## 🏗️ Build

```bash
# Builder tous les projets
npm run build

# Builder un projet spécifique
cd apps/api && npm run build
cd apps/web && npm run build

# Nettoyer les builds
npm run clean
```

## 🧪 Tests et qualité

```bash
# Lancer tous les tests
npm run test

# Type-checking TypeScript
npm run typecheck

# Linter le code
npm run lint

# Formater le code (si Prettier configuré)
npm run format
```

## 🔧 Développement

```bash
# Mode développement (tout en parallèle)
npm run dev

# Lancer l'API uniquement
cd apps/api && npm run dev

# Lancer le site web uniquement
cd apps/web && npm run dev

# Lancer le back office uniquement
cd apps/backoffice && npm run dev

# Lancer la tablette uniquement
cd apps/tablet && npm run dev
```

## 🌐 URLs en développement

- **API Backend**: http://localhost:3001
- **Health Check API**: http://localhost:3001/health
- **Site Web Public**: http://localhost:5173
- **Interface Tablette**: http://localhost:5174
- **Back Office**: http://localhost:5175
- **Prisma Studio**: http://localhost:5555

## 🔐 Comptes de test (après seed)

### Admin
```
Email: heloise@yamaha.fr
Password: admin123
```

### Instructeur
```
Email: instructor1@yamaha.fr
Password: instructor123
```

### Client
```
Email: client1@example.com
Password: client123
```

## 📡 Tester l'API

### Avec curl

```bash
# Health check
curl http://localhost:3001/health

# S'inscrire
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+33612345678"
  }'

# Se connecter
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "heloise@yamaha.fr",
    "password": "admin123"
  }'

# Récupérer son profil (avec token)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <votre-token-jwt>"

# Liste des événements
curl http://localhost:3001/api/events
```

### Avec HTTPie (plus lisible)

```bash
# Installer HTTPie: pip install httpie

# Health check
http GET localhost:3001/health

# S'inscrire
http POST localhost:3001/api/auth/register \
  email=test@example.com \
  password=password123 \
  firstName=Test \
  lastName=User \
  phone=+33612345678

# Se connecter
http POST localhost:3001/api/auth/login \
  email=heloise@yamaha.fr \
  password=admin123

# Avec authentification
http GET localhost:3001/api/auth/me \
  "Authorization: Bearer <token>"
```

## 🐛 Debugging

```bash
# Voir les logs API en temps réel
tail -f apps/api/logs/combined.log
tail -f apps/api/logs/error.log

# Logs PostgreSQL (selon installation)
# Mac (Homebrew):
tail -f /usr/local/var/log/postgres.log
# Linux:
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Tester la connexion PostgreSQL
psql -U postgres -d yamaha_drt -c "SELECT COUNT(*) FROM \"User\";"

# Tester Redis
redis-cli ping
# Doit répondre: PONG
```

## 🔄 Git

```bash
# Cloner le projet
git clone <url>
cd yamaha-drt

# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Commit
git add .
git commit -m "feat: description de la fonctionnalité"

# Push
git push origin feature/ma-fonctionnalite

# Mettre à jour depuis main
git checkout main
git pull
git checkout feature/ma-fonctionnalite
git merge main
```

## 🐳 Docker (optionnel)

```bash
# Lancer PostgreSQL + Redis avec Docker Compose
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Reconstruire
docker-compose up -d --build
```

## 📊 Monitoring

```bash
# Voir les processus Node.js
ps aux | grep node

# Tuer un processus sur un port
# Mac/Linux:
lsof -ti:3001 | xargs kill
# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process

# Voir l'utilisation mémoire
node --inspect apps/api/src/index.ts
```

## 🚢 Déploiement (production)

```bash
# Build pour production
NODE_ENV=production npm run build

# Lancer l'API en production
cd apps/api
npm run start

# Avec PM2 (recommandé)
pm2 start dist/index.js --name yamaha-api
pm2 logs yamaha-api
pm2 restart yamaha-api
pm2 stop yamaha-api
```

## 📝 Prisma - Commandes avancées

```bash
# Valider le schema sans push
npx prisma validate

# Formater le schema
npx prisma format

# Voir le SQL généré
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Reset une migration spécifique
npx prisma migrate reset

# Appliquer les migrations en production
npx prisma migrate deploy
```

## 🔍 Recherche dans le code

```bash
# Trouver tous les TODO
grep -r "TODO" apps/ packages/

# Trouver les console.log
grep -r "console.log" apps/ packages/

# Trouver les fichiers TypeScript modifiés
git diff --name-only "*.ts"
```

## 🧹 Nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Réinstaller proprement
npm install

# Nettoyer les builds
npm run clean

# Nettoyer le cache npm
npm cache clean --force
```

## ⚡ Optimisation

```bash
# Analyser la taille des bundles
cd apps/web
npm run build
npx vite-bundle-visualizer

# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour les dépendances
npx npm-check-updates -u
npm install
```

## 📦 Création de nouveaux packages

```bash
# Créer un nouveau package
mkdir packages/mon-package
cd packages/mon-package
npm init -y

# Modifier package.json:
{
  "name": "@yamaha-drt/mon-package",
  "private": true,
  ...
}

# Retour à la racine et installer
cd ../..
npm install
```

## 🎯 Raccourcis utiles

```bash
# Alias pour se déplacer rapidement
alias api="cd apps/api"
alias web="cd apps/web"
alias db="cd packages/database"

# Alias pour commandes fréquentes
alias dev="npm run dev"
alias dbstudio="cd packages/database && npm run db:studio"

# Ajouter ces alias dans votre .bashrc ou .zshrc
```

## 💡 Tips

1. **Utiliser Turborepo cache**: Les builds sont cachés, relancer `npm run build` est très rapide
2. **Prisma Studio**: Meilleur moyen d'explorer/modifier la DB visuellement
3. **Hot reload**: Les changements de code rechargent automatiquement en dev
4. **TypeScript**: Les erreurs de type apparaissent dans l'IDE ET la console
5. **Logs**: Toujours check `apps/api/logs/` en cas de problème

---

**Pro tip**: Gardez ce fichier ouvert dans un onglet pour référence rapide!
