# 🐳 Procédure d'installation Yamaha DRT sur VPS Hostinger avec Docker

## 📋 Vue d'ensemble

Cette procédure installe l'application Yamaha DRT en utilisant Docker et Docker Compose pour :
- **PostgreSQL 15** en conteneur
- **Redis** en conteneur
- **API Node.js** en conteneur
- **Nginx** en conteneur (reverse proxy)
- **Frontends** servis par Nginx (web, backoffice, tablette)

---

## 🎯 Prérequis

- VPS Hostinger avec accès SSH
- Système: Ubuntu 20.04+ ou Debian 11+
- Minimum: 2 vCPU, 4GB RAM, 40GB SSD
- Nom de domaine configuré (DNS pointant vers le VPS)

---

## 🚀 ÉTAPE 1 : Connexion et mise à jour du système

```bash
# Se connecter au VPS via SSH
ssh root@votre-ip-vps

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les outils de base
apt install -y curl wget git nano ufw
```

---

## 🐳 ÉTAPE 2 : Installation de Docker et Docker Compose

```bash
# Désinstaller les anciennes versions de Docker (si présentes)
apt remove -y docker docker-engine docker.io containerd runc

# Installer les dépendances
apt install -y ca-certificates curl gnupg lsb-release

# Ajouter la clé GPG officielle de Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Ajouter le repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Mettre à jour la liste des packages
apt update

# Installer Docker Engine et Docker Compose
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version

# Démarrer et activer Docker
systemctl start docker
systemctl enable docker

# Tester Docker
docker run hello-world
```

---

## 📂 ÉTAPE 3 : Préparer le répertoire de l'application

```bash
# Créer le répertoire de l'application
mkdir -p /var/www/yamaha-drt
cd /var/www/yamaha-drt

# Option A: Cloner le projet depuis Git
git clone https://github.com/votre-compte/yamaha-drt.git .

# Option B: Transférer les fichiers depuis votre machine locale
# Sur votre machine Windows (PowerShell):
# scp -r C:\Dev\Yamaha\* root@votre-ip-vps:/var/www/yamaha-drt/
```

---

## 🐋 ÉTAPE 4 : Créer le fichier docker-compose.production.yml

```bash
cd /var/www/yamaha-drt
nano docker-compose.production.yml
```

**Copier ce contenu :**

```yaml
version: '3.8'

services:
  # =============================================================================
  # PostgreSQL Database
  # =============================================================================
  postgres:
    image: postgres:15-alpine
    container_name: yamaha-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${DB_USER:-yamaha_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-ChangeMeInProduction123!}
      POSTGRES_DB: ${DB_NAME:-yamaha_drt}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - yamaha-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-yamaha_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # =============================================================================
  # Redis Cache
  # =============================================================================
  redis:
    image: redis:7-alpine
    container_name: yamaha-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - yamaha-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: redis-server --appendonly yes

  # =============================================================================
  # API Backend
  # =============================================================================
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yamaha-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER:-yamaha_user}:${DB_PASSWORD:-ChangeMeInProduction123!}@postgres:5432/${DB_NAME:-yamaha_drt}?schema=public
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./uploads:/app/uploads
      - ./apps/api/logs:/app/apps/api/logs
    networks:
      - yamaha-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # =============================================================================
  # Nginx Reverse Proxy
  # =============================================================================
  nginx:
    image: nginx:alpine
    container_name: yamaha-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./apps/web/dist:/var/www/web:ro
      - ./apps/backoffice/dist:/var/www/backoffice:ro
      - ./apps/tablette/dist:/var/www/tablette:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - yamaha-network
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:

networks:
  yamaha-network:
    driver: bridge
```

**Sauvegarder : Ctrl+O puis Ctrl+X**

---

## 🐋 ÉTAPE 5 : Créer le Dockerfile pour l'API

```bash
cd /var/www/yamaha-drt
nano Dockerfile
```

**Copier ce contenu :**

```dockerfile
# =============================================================================
# Dockerfile pour l'API Yamaha DRT - Production
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY turbo.json ./

# Copier tous les packages et apps
COPY packages ./packages
COPY apps ./apps

# Installer toutes les dépendances
RUN npm install

# Générer le client Prisma
RUN cd packages/database && npm run db:generate

# Builder tous les projets
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Installer les dépendances de production
COPY package*.json ./
RUN npm install --production

# Copier les builds
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

# Créer le répertoire uploads
RUN mkdir -p /app/uploads

# Exposer le port
EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Démarrage
CMD ["node", "apps/api/dist/index.js"]
```

**Sauvegarder : Ctrl+O puis Ctrl+X**

---

## 📄 ÉTAPE 6 : Créer le fichier .dockerignore

```bash
nano .dockerignore
```

**Copier ce contenu :**

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
dist
build
coverage
*.log
.DS_Store
.vscode
.idea
uploads
apps/api/logs
```

**Sauvegarder : Ctrl+O puis Ctrl+X**

---

## 🌐 ÉTAPE 7 : Créer la configuration Nginx

```bash
nano nginx.conf
```

**Copier ce contenu (IMPORTANT : Remplacer "votre-domaine.com" par votre vrai domaine) :**

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 10M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    upstream api_backend {
        server api:3001;
    }

    # =============================================================================
    # API Backend
    # =============================================================================
    server {
        listen 80;
        server_name api.votre-domaine.com;  # MODIFIER ICI

        location / {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_buffering off;
        }
    }

    # =============================================================================
    # Site Web Public
    # =============================================================================
    server {
        listen 80;
        server_name votre-domaine.com www.votre-domaine.com;  # MODIFIER ICI

        root /var/www/web;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # =============================================================================
    # Back Office Admin
    # =============================================================================
    server {
        listen 80;
        server_name admin.votre-domaine.com;  # MODIFIER ICI

        root /var/www/backoffice;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # =============================================================================
    # Interface Tablette
    # =============================================================================
    server {
        listen 80;
        server_name tablet.votre-domaine.com;  # MODIFIER ICI

        root /var/www/tablette;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Sauvegarder : Ctrl+O puis Ctrl+X**

---

## ⚙️ ÉTAPE 8 : Configuration des variables d'environnement

```bash
cd /var/www/yamaha-drt

# Copier le fichier d'exemple (s'il existe)
cp .env.example .env 2>/dev/null || touch .env

# Éditer le fichier .env
nano .env
```

**Copier ce contenu (IMPORTANT : Modifier TOUS les mots de passe et domaines) :**

```bash
# =============================================================================
# DATABASE (Docker PostgreSQL)
# =============================================================================
DB_USER=yamaha_user
DB_PASSWORD=CHANGEZ-MOI-MotDePasseSecurise123!XYZ789
DB_NAME=yamaha_drt
DATABASE_URL=postgresql://yamaha_user:CHANGEZ-MOI-MotDePasseSecurise123!XYZ789@postgres:5432/yamaha_drt?schema=public

# =============================================================================
# REDIS (Docker)
# =============================================================================
REDIS_URL=redis://redis:6379

# =============================================================================
# JWT - GÉNÉRER UNE CLÉ ALÉATOIRE LONGUE (32+ caractères)
# =============================================================================
JWT_SECRET=CHANGEZ-MOI-cle-secrete-aleatoire-minimum-32-caracteres-tres-longue
JWT_EXPIRES_IN=7d

# =============================================================================
# API
# =============================================================================
NODE_ENV=production
PORT=3001
API_URL=https://api.votre-domaine.com

# =============================================================================
# FRONTEND URLs - MODIFIER AVEC VOS DOMAINES
# =============================================================================
WEB_URL=https://votre-domaine.com
BACKOFFICE_URL=https://admin.votre-domaine.com
TABLET_URL=https://tablet.votre-domaine.com
CORS_ORIGIN=https://votre-domaine.com,https://admin.votre-domaine.com,https://tablet.votre-domaine.com

# =============================================================================
# EMAIL (Hostinger SMTP)
# =============================================================================
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=CHANGEZ-MOI-mot-de-passe-email
EMAIL_FROM=Yamaha Demo Ride Tour <noreply@votre-domaine.com>

# =============================================================================
# SMS (Twilio) - À CONFIGURER
# =============================================================================
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=votre-twilio-account-sid
TWILIO_AUTH_TOKEN=votre-twilio-auth-token
TWILIO_PHONE_NUMBER=+33123456789

# =============================================================================
# FILE UPLOADS
# =============================================================================
UPLOAD_MAX_SIZE=10485760
UPLOAD_DIR=/app/uploads
STORAGE_PROVIDER=local

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL=warn
```

**Sauvegarder : Ctrl+O puis Ctrl+X**

---

## 🏗️ ÉTAPE 9 : Builder les applications frontend

```bash
cd /var/www/yamaha-drt

# Installer Node.js 20 sur le VPS (pour le build uniquement)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérifier l'installation
node --version  # Doit afficher v20.x.x
npm --version   # Doit afficher v10.x.x

# Installer les dépendances
npm install

# Générer le client Prisma
cd packages/database
npm run db:generate
cd ../..

# Builder tous les projets
NODE_ENV=production npm run build

# Vérifier que les builds existent
ls -la apps/web/dist
ls -la apps/backoffice/dist
ls -la apps/tablette/dist
ls -la apps/api/dist
```

---

## 🐳 ÉTAPE 10 : Démarrer les conteneurs Docker

```bash
cd /var/www/yamaha-drt

# Builder et démarrer tous les conteneurs
docker compose -f docker-compose.production.yml up -d --build

# Attendre que les conteneurs démarrent (environ 30 secondes)
sleep 30

# Vérifier que tous les conteneurs sont en cours d'exécution
docker ps

# Vous devriez voir 4 conteneurs :
# - yamaha-postgres
# - yamaha-redis
# - yamaha-api
# - yamaha-nginx
```

---

## 🗄️ ÉTAPE 11 : Initialiser la base de données

```bash
cd /var/www/yamaha-drt

# Vérifier que PostgreSQL est prêt
docker exec yamaha-postgres pg_isready -U yamaha_user

# Pousser le schéma Prisma vers la base de données
docker exec yamaha-api sh -c "cd packages/database && npx prisma db push"

# Seed les données initiales (comptes admin, etc.)
docker exec yamaha-api sh -c "cd packages/database && npm run db:seed"

# Vérifier que les données sont créées
docker exec yamaha-postgres psql -U yamaha_user -d yamaha_drt -c "SELECT COUNT(*) FROM \"User\";"
```

---

## ✅ ÉTAPE 12 : Vérifier que tout fonctionne

```bash
# Vérifier les logs de l'API
docker logs yamaha-api

# Vérifier que l'API répond
curl http://localhost:3001/health

# Vérifier tous les conteneurs
docker ps

# Tester depuis l'extérieur (remplacer par votre IP)
curl http://votre-ip-vps:3001/health
```

---

## 🔥 ÉTAPE 13 : Configurer le pare-feu

```bash
# Activer UFW
ufw --force enable

# CRITIQUE : Autoriser SSH d'abord !
ufw allow 22/tcp

# Autoriser HTTP et HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Vérifier les règles
ufw status numbered
```

---

## 🔒 ÉTAPE 14 : Installer SSL avec Certbot (HTTPS)

```bash
# Installer Certbot
apt install -y certbot

# Arrêter temporairement Nginx
docker stop yamaha-nginx

# Obtenir les certificats SSL pour tous vos domaines
certbot certonly --standalone \
  -d votre-domaine.com \
  -d www.votre-domaine.com \
  -d api.votre-domaine.com \
  -d admin.votre-domaine.com \
  -d tablet.votre-domaine.com \
  --email votre-email@example.com \
  --agree-tos \
  --no-eff-email

# Créer le répertoire SSL
mkdir -p /var/www/yamaha-drt/ssl

# Copier les certificats
cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem /var/www/yamaha-drt/ssl/
cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem /var/www/yamaha-drt/ssl/

# Redémarrer Nginx
docker start yamaha-nginx
```

### Modifier nginx.conf pour activer HTTPS

```bash
nano /var/www/yamaha-drt/nginx.conf
```

**Modifier chaque bloc server pour ajouter HTTPS. Exemple pour l'API :**

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name api.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name api.votre-domaine.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
```

**Faire de même pour les 3 autres domaines (web, admin, tablet)**

**Sauvegarder et redémarrer Nginx :**

```bash
docker restart yamaha-nginx
```

### Configurer le renouvellement automatique SSL

```bash
# Créer un script de renouvellement
nano /usr/local/bin/renew-ssl-yamaha.sh
```

**Copier ce contenu :**

```bash
#!/bin/bash
docker stop yamaha-nginx
certbot renew --quiet
cp /etc/letsencrypt/live/votre-domaine.com/*.pem /var/www/yamaha-drt/ssl/
docker start yamaha-nginx
```

```bash
# Rendre exécutable
chmod +x /usr/local/bin/renew-ssl-yamaha.sh

# Ajouter au crontab (renouvellement tous les jours à minuit)
crontab -e

# Ajouter cette ligne :
0 0 * * * /usr/local/bin/renew-ssl-yamaha.sh >> /var/log/certbot-renew.log 2>&1
```

---

## 📊 ÉTAPE 15 : Commandes Docker utiles

```bash
# Voir tous les conteneurs
docker ps -a

# Voir les logs d'un conteneur
docker logs yamaha-api
docker logs -f yamaha-api  # Suivre en temps réel

# Redémarrer un conteneur
docker restart yamaha-api

# Arrêter tous les conteneurs
docker compose -f docker-compose.production.yml down

# Démarrer tous les conteneurs
docker compose -f docker-compose.production.yml up -d

# Reconstruire après modifications du code
cd /var/www/yamaha-drt
git pull
npm run build
docker compose -f docker-compose.production.yml up -d --build

# Entrer dans un conteneur
docker exec -it yamaha-api sh
docker exec -it yamaha-postgres psql -U yamaha_user -d yamaha_drt

# Voir l'utilisation des ressources
docker stats

# Voir les volumes
docker volume ls

# Nettoyer (ATTENTION: Supprime tout ce qui n'est pas utilisé)
docker system prune -a
```

---

## 🗄️ ÉTAPE 16 : Sauvegardes automatiques

```bash
# Créer le répertoire de backup
mkdir -p /var/backups/yamaha-drt

# Créer un script de backup
nano /usr/local/bin/backup-yamaha-db.sh
```

**Copier ce contenu :**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/yamaha-drt"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/yamaha_drt_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Faire le backup
docker exec yamaha-postgres pg_dump -U yamaha_user yamaha_drt | gzip > $BACKUP_FILE

# Garder seulement les 30 derniers backups
find $BACKUP_DIR -name "yamaha_drt_*.sql.gz" -type f -mtime +30 -delete

echo "Backup créé: $BACKUP_FILE"
```

```bash
# Rendre exécutable
chmod +x /usr/local/bin/backup-yamaha-db.sh

# Tester
/usr/local/bin/backup-yamaha-db.sh

# Ajouter au cron (backup quotidien à 2h du matin)
crontab -e

# Ajouter :
0 2 * * * /usr/local/bin/backup-yamaha-db.sh >> /var/log/yamaha-backup.log 2>&1
```

### Restaurer un backup

```bash
# Lister les backups
ls -lh /var/backups/yamaha-drt/

# Restaurer (remplacer la date)
gunzip < /var/backups/yamaha-drt/yamaha_drt_2026-01-15_02-00-00.sql.gz | \
  docker exec -i yamaha-postgres psql -U yamaha_user yamaha_drt
```

---

## 🎯 URLs de l'application

Après installation complète :

- **Site Web Public** : `https://votre-domaine.com`
- **API Backend** : `https://api.votre-domaine.com`
- **Back Office** : `https://admin.votre-domaine.com`
- **Interface Tablette** : `https://tablet.votre-domaine.com`

**Health Check** : `https://api.votre-domaine.com/health`

---

## 🆘 Comptes de test (après seed)

- **Admin** : `heloise@yamaha.fr` / `admin123`
- **Instructeur** : `instructor1@yamaha.fr` / `instructor123`
- **Client** : `client1@example.com` / `client123`

---

## 🐛 Dépannage

### L'API ne démarre pas

```bash
# Voir les logs
docker logs yamaha-api

# Vérifier PostgreSQL
docker exec yamaha-postgres pg_isready -U yamaha_user

# Reconstruire
docker compose -f docker-compose.production.yml up -d --build --force-recreate api
```

### Erreur de connexion BDD

```bash
# Vérifier les variables d'environnement
docker exec yamaha-api env | grep DATABASE_URL

# Tester la connexion
docker exec yamaha-api sh -c "cd packages/database && npx prisma db pull"
```

### Nginx ne démarre pas

```bash
# Tester la config
docker exec yamaha-nginx nginx -t

# Voir les logs
docker logs yamaha-nginx

# Redémarrer
docker restart yamaha-nginx
```

### Port déjà utilisé

```bash
# Voir ce qui utilise le port 80
lsof -i :80

# Ou
netstat -tulpn | grep :80

# Arrêter le service (ex: Apache)
systemctl stop apache2
systemctl disable apache2
```

---

## 📋 Checklist finale

- [ ] Docker et Docker Compose installés
- [ ] Tous les fichiers créés (docker-compose, Dockerfile, nginx.conf, .env)
- [ ] Variables .env configurées (mots de passe, domaines)
- [ ] Domaines DNS configurés pointant vers le VPS
- [ ] Applications frontend buildées (npm run build)
- [ ] Conteneurs Docker démarrés
- [ ] Base de données initialisée et seedée
- [ ] API répond sur /health
- [ ] Pare-feu configuré (SSH, HTTP, HTTPS)
- [ ] SSL installé et HTTPS activé
- [ ] Nginx redirige HTTP vers HTTPS
- [ ] Backups automatiques configurés
- [ ] Tests de connexion réussis

---

## 🔒 Points de sécurité CRITIQUES

1. ✅ **Changez TOUS les mots de passe** dans `.env`
2. ✅ **Générez une longue clé JWT** aléatoire (32+ caractères)
3. ✅ **Configurez le pare-feu** avant de mettre en ligne
4. ✅ **Installez SSL** immédiatement après la mise en ligne
5. ✅ **Ne jamais exposer** les ports PostgreSQL/Redis publiquement
6. ✅ **Surveillez les logs** régulièrement
7. ✅ **Backups quotidiens** automatiques
8. ✅ **Limitez l'accès SSH** par clé plutôt que mot de passe

---

## 📈 Monitoring

```bash
# Surveiller l'utilisation des ressources
docker stats

# Voir les logs en temps réel
docker compose -f docker-compose.production.yml logs -f

# Vérifier la santé des conteneurs
docker ps --format "table {{.Names}}\t{{.Status}}"

# Espace disque
df -h

# Mémoire
free -h
```

---

## 🔄 Mise à jour de l'application

```bash
cd /var/www/yamaha-drt

# 1. Récupérer les modifications
git pull

# 2. Installer nouvelles dépendances
npm install

# 3. Rebuilder les frontends
npm run build

# 4. Reconstruire et redémarrer les conteneurs
docker compose -f docker-compose.production.yml up -d --build

# 5. Appliquer les migrations BDD (si nécessaire)
docker exec yamaha-api sh -c "cd packages/database && npx prisma migrate deploy"

# 6. Vérifier
docker logs yamaha-api
curl https://api.votre-domaine.com/health
```

---

## 📞 Support

En cas de problème :

1. **Logs API** : `docker logs yamaha-api`
2. **Logs Nginx** : `docker logs yamaha-nginx`
3. **Logs PostgreSQL** : `docker logs yamaha-postgres`
4. **État conteneurs** : `docker ps -a`
5. **Utilisation ressources** : `docker stats`

---

**Procédure créée pour Yamaha France - Janvier 2026**
**Version Docker pour VPS Hostinger**
