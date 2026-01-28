📋 Procédure d'installation sur VPS Hostinger
🎯 Prérequis de l'application
Votre application nécessite :

Node.js >= 20.0.0
PostgreSQL 15+
Redis
Nginx (recommandé pour le reverse proxy)
PM2 (pour gérer les processus Node.js)
🚀 ÉTAPE 1 : Connexion et préparation du VPS

# Se connecter au VPS Hostinger via SSH
ssh root@votre-ip-vps
# Ou si vous avez un utilisateur non-root :
ssh votre-user@votre-ip-vps

# Mettre à jour le système
apt update && apt upgrade -y
🔧 ÉTAPE 2 : Installation de Node.js 20

# Installer curl si nécessaire
apt install -y curl

# Ajouter le repository NodeSource pour Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Installer Node.js et npm
apt install -y nodejs

# Vérifier les versions
node --version  # Doit afficher v20.x.x
npm --version   # Doit afficher v10.x.x
🐘 ÉTAPE 3 : Installation de PostgreSQL 15

# Ajouter le repository PostgreSQL
apt install -y wget gnupg
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Installer PostgreSQL 15
apt update
apt install -y postgresql-15 postgresql-contrib-15

# Démarrer et activer PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Vérifier le statut
systemctl status postgresql
Configuration de PostgreSQL

# Se connecter en tant qu'utilisateur postgres
sudo -u postgres psql

# Dans le shell PostgreSQL, exécuter :
CREATE DATABASE yamaha_drt;
CREATE USER yamaha_user WITH PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE yamaha_drt TO yamaha_user;
\q
🔴 ÉTAPE 4 : Installation de Redis

# Installer Redis
apt install -y redis-server

# Démarrer et activer Redis
systemctl start redis-server
systemctl enable redis-server

# Vérifier que Redis fonctionne
redis-cli ping
# Doit répondre : PONG
📦 ÉTAPE 5 : Installation de PM2

# Installer PM2 globalement
npm install -g pm2

# Configurer PM2 pour démarrer automatiquement au boot
pm2 startup systemd
# Exécuter la commande qui s'affiche
📂 ÉTAPE 6 : Cloner et configurer l'application

# Créer un répertoire pour l'application
mkdir -p /var/www
cd /var/www

# Cloner votre projet (remplacer par votre URL Git)
git clone <url-de-votre-repo-git> yamaha-drt
# OU si vous transférez les fichiers manuellement :
# Utilisez scp ou FileZilla pour uploader les fichiers

cd yamaha-drt

# Installer les dépendances
npm install
⚙️ ÉTAPE 7 : Configuration des variables d'environnement

# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env
nano .env
Contenu du fichier .env pour la production :


# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="postgresql://yamaha_user:VotreMotDePasseSecurise123!@localhost:5432/yamaha_drt?schema=public"

# =============================================================================
# REDIS
# =============================================================================
REDIS_URL="redis://localhost:6379"

# =============================================================================
# JWT
# =============================================================================
JWT_SECRET="VOTRE-CLE-SECRETE-ALEATOIRE-TRES-LONGUE-ET-SECURISEE"
JWT_EXPIRES_IN="7d"

# =============================================================================
# API
# =============================================================================
NODE_ENV="production"
PORT=3001
API_URL="https://votre-domaine.com"

# =============================================================================
# FRONTEND URLs
# =============================================================================
WEB_URL="https://votre-domaine.com"
BACKOFFICE_URL="https://admin.votre-domaine.com"
TABLET_URL="https://tablet.votre-domaine.com"
CORS_ORIGIN="https://votre-domaine.com,https://admin.votre-domaine.com,https://tablet.votre-domaine.com"

# =============================================================================
# EMAIL (À configurer selon votre fournisseur)
# =============================================================================
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASS="votre-mot-de-passe-email"
EMAIL_FROM="Yamaha Demo Ride Tour <noreply@votre-domaine.com>"

# =============================================================================
# SMS (Twilio ou autre)
# =============================================================================
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="votre-account-sid"
TWILIO_AUTH_TOKEN="votre-auth-token"
TWILIO_PHONE_NUMBER="+33123456789"

# =============================================================================
# FILE UPLOADS
# =============================================================================
UPLOAD_MAX_SIZE=10485760
UPLOAD_DIR="/var/www/yamaha-drt/uploads"
STORAGE_PROVIDER="local"

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL="warn"
Sauvegarder avec Ctrl+O, puis Ctrl+X

🗄️ ÉTAPE 8 : Initialiser la base de données

cd /var/www/yamaha-drt

# Aller dans le package database
cd packages/database

# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base de données
npm run db:push

# Seed les données initiales (comptes admin, etc.)
npm run db:seed

# Retourner à la racine
cd ../..
🏗️ ÉTAPE 9 : Builder l'application pour la production

cd /var/www/yamaha-drt

# Builder tous les projets
NODE_ENV=production npm run build
🚀 ÉTAPE 10 : Démarrer l'API avec PM2

cd /var/www/yamaha-drt/apps/api

# Démarrer l'API avec PM2
pm2 start dist/index.js --name yamaha-api

# Vérifier que l'API fonctionne
pm2 status
pm2 logs yamaha-api

# Sauvegarder la configuration PM2
pm2 save
🌐 ÉTAPE 11 : Configurer Nginx comme reverse proxy

# Installer Nginx
apt install -y nginx

# Créer la configuration pour l'API
nano /etc/nginx/sites-available/yamaha-api
Contenu du fichier Nginx :


# API Backend
server {
    listen 80;
    server_name api.votre-domaine.com;  # Remplacer par votre domaine

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Site Web Public
server {
    listen 80;
    server_name votre-domaine.com;  # Remplacer par votre domaine

    root /var/www/yamaha-drt/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Back Office
server {
    listen 80;
    server_name admin.votre-domaine.com;  # Remplacer par votre domaine

    root /var/www/yamaha-drt/apps/backoffice/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Tablette
server {
    listen 80;
    server_name tablet.votre-domaine.com;  # Remplacer par votre domaine

    root /var/www/yamaha-drt/apps/tablette/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Activer la configuration
ln -s /etc/nginx/sites-available/yamaha-api /etc/nginx/sites-enabled/

# Tester la configuration Nginx
nginx -t

# Redémarrer Nginx
systemctl restart nginx
systemctl enable nginx
🔒 ÉTAPE 12 : Installer SSL avec Certbot (HTTPS)

# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir les certificats SSL (remplacer par vos domaines)
certbot --nginx -d votre-domaine.com -d api.votre-domaine.com -d admin.votre-domaine.com -d tablet.votre-domaine.com

# Suivre les instructions interactives
# Certbot configurera automatiquement Nginx pour HTTPS

# Tester le renouvellement automatique
certbot renew --dry-run
🔥 ÉTAPE 13 : Configurer le pare-feu

# Installer ufw (si pas déjà installé)
apt install -y ufw

# Autoriser SSH (IMPORTANT avant d'activer le pare-feu!)
ufw allow 22/tcp

# Autoriser HTTP et HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le pare-feu
ufw enable

# Vérifier le statut
ufw status
✅ ÉTAPE 14 : Vérification finale

# Vérifier que tout fonctionne
pm2 status
systemctl status nginx
systemctl status postgresql
systemctl status redis-server

# Tester l'API
curl http://localhost:3001/health

# Voir les logs en temps réel
pm2 logs yamaha-api
📊 ÉTAPE 15 : Monitoring et maintenance

# Voir l'utilisation des ressources
pm2 monit

# Redémarrer l'application si nécessaire
pm2 restart yamaha-api

# Voir les logs d'erreur
pm2 logs yamaha-api --err

# Mise à jour de l'application (après modifications)
cd /var/www/yamaha-drt
git pull
npm install
npm run build
cd apps/api
pm2 restart yamaha-api
🎯 Résumé des URLs
Après installation, votre application sera accessible sur :

Site Web Public : https://votre-domaine.com
API Backend : https://api.votre-domaine.com
Back Office : https://admin.votre-domaine.com
Interface Tablette : https://tablet.votre-domaine.com
🆘 Comptes de test (après seed)
Admin : heloise@yamaha.fr / admin123
Instructeur : instructor1@yamaha.fr / instructor123
Client : client1@example.com / client123
⚠️ Points importants
Sécurité : Changez TOUS les mots de passe dans le fichier .env
Domaines : Configurez vos DNS chez Hostinger pour pointer vers votre VPS
Emails : Configurez SMTP avec les paramètres Hostinger
Backups : Configurez des sauvegardes automatiques de PostgreSQL
Logs : Surveillez régulièrement les logs avec pm2 logs