# Guide de Déploiement - Yamaha DRT sur VPS OVH Ubuntu

## Table des matières
1. [Prérequis](#1-prérequis)
2. [Configuration DNS](#2-configuration-dns)
3. [Préparation du serveur](#3-préparation-du-serveur)
4. [Installation des dépendances](#4-installation-des-dépendances)
5. [Déploiement de l'application](#5-déploiement-de-lapplication)
6. [Configuration et premiers pas](#6-configuration-et-premiers-pas)
7. [Maintenance](#7-maintenance)
8. [Dépannage](#8-dépannage)

---

## 1. Prérequis

### Serveur VPS OVH
- **OS**: Ubuntu 22.04 LTS ou 24.04 LTS
- **RAM**: Minimum 2 Go (recommandé 4 Go)
- **CPU**: Minimum 2 vCPU
- **Stockage**: Minimum 20 Go SSD
- **Ports ouverts**: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Domaine
- Un nom de domaine configuré (ex: `yamaha-drt.fr`)
- Accès au panneau DNS (OVH, Cloudflare, etc.)

### Local
- Git installé
- Node.js 20+ (pour le build local des frontends)

---

## 2. Configuration DNS

Configurez les enregistrements DNS suivants pointant vers l'IP de votre VPS:

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | VOTRE_IP_VPS | 3600 |
| A | www | VOTRE_IP_VPS | 3600 |
| A | api | VOTRE_IP_VPS | 3600 |
| A | admin | VOTRE_IP_VPS | 3600 |
| A | tablette | VOTRE_IP_VPS | 3600 |

> **Note**: Attendez la propagation DNS (quelques minutes à 24h) avant de continuer.

Vérification:
```bash
# Depuis votre machine locale
dig +short api.VOTRE_DOMAINE.com
# Doit retourner l'IP de votre VPS
```

---

## 3. Préparation du serveur

### 3.1 Connexion SSH

```bash
ssh root@VOTRE_IP_VPS
```

### 3.2 Mise à jour du système

```bash
apt update && apt upgrade -y
apt install -y curl wget git htop ufw fail2ban
```

### 3.3 Configuration du pare-feu (UFW)

```bash
# Configuration UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Vérification
ufw status
```

### 3.4 Création d'un utilisateur dédié (recommandé)

```bash
# Créer un utilisateur
adduser yamaha
usermod -aG sudo yamaha

# Copier la clé SSH
mkdir -p /home/yamaha/.ssh
cp ~/.ssh/authorized_keys /home/yamaha/.ssh/
chown -R yamaha:yamaha /home/yamaha/.ssh
chmod 700 /home/yamaha/.ssh
chmod 600 /home/yamaha/.ssh/authorized_keys

# Se connecter en tant que yamaha
su - yamaha
```

### 3.5 Configuration de Fail2ban (sécurité SSH)

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 4. Installation des dépendances

### 4.1 Installation de Docker

```bash
# Supprimer anciennes versions
sudo apt remove -y docker docker-engine docker.io containerd runc

# Installer les prérequis
sudo apt install -y ca-certificates curl gnupg lsb-release

# Ajouter la clé GPG Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Ajouter le repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Démarrer Docker
sudo systemctl enable docker
sudo systemctl start docker

# IMPORTANT: Déconnectez-vous et reconnectez-vous pour appliquer les permissions
exit
ssh yamaha@VOTRE_IP_VPS

# Vérification
docker --version
docker compose version
```

### 4.2 Installation de Node.js (pour build local)

```bash
# Installation via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérification
node --version  # doit afficher v20.x.x
npm --version   # doit afficher 10.x.x
```

---

## 5. Déploiement de l'application

### 5.1 Cloner le repository

```bash
# Créer le répertoire de l'application
sudo mkdir -p /opt/yamaha-drt
sudo chown $USER:$USER /opt/yamaha-drt
cd /opt/yamaha-drt

# Cloner le repository (remplacez par votre URL)
git clone https://github.com/VOTRE_UTILISATEUR/yamaha-drt.git .

# OU copier depuis votre machine locale
# scp -r /chemin/local/Yamaha_DRT/* yamaha@VOTRE_IP:/opt/yamaha-drt/
```

### 5.2 Configuration de l'environnement

```bash
cd /opt/yamaha-drt

# Copier le fichier de configuration
cp .env.production.example .env

# Éditer le fichier .env
nano .env
```

**Configuration minimale requise dans `.env`:**

```bash
# Remplacez VOTRE_DOMAINE.com par votre domaine réel
DOMAIN=yamaha-drt.fr
ACME_EMAIL=admin@yamaha-drt.fr

# Générez des mots de passe/secrets forts:
# openssl rand -base64 32
DB_PASSWORD=VotreMdpDBTresFort123!

# openssl rand -base64 64
JWT_SECRET=VotreCleJWTTresLongueEtAleatoire...

# Configuration SMTP (OVH Mail ou autre)
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yamaha-drt.fr
SMTP_PASS=VotreMdpSMTP
```

### 5.3 Installer les dépendances et builder les frontends

```bash
cd /opt/yamaha-drt

# Installer les dépendances npm
npm ci

# Builder toutes les applications frontend
npm run build
```

### 5.4 Créer les répertoires nécessaires

```bash
mkdir -p uploads apps/api/logs
chmod 755 uploads apps/api/logs
```

### 5.5 Rendre le script de déploiement exécutable

```bash
chmod +x scripts/deploy.sh
```

### 5.6 Premier déploiement

```bash
# Lancer le déploiement complet
./scripts/deploy.sh first
```

Le script va:
1. Créer les volumes Docker
2. Construire l'image de l'API
3. Démarrer PostgreSQL et Redis
4. Exécuter les migrations Prisma
5. Démarrer tous les services
6. Configurer les certificats SSL via Let's Encrypt

### 5.7 Vérification

```bash
# État des conteneurs
docker compose -f docker-compose.prod.yml ps

# Logs en temps réel
docker compose -f docker-compose.prod.yml logs -f

# Test des URLs (remplacez par votre domaine)
curl -I https://api.VOTRE_DOMAINE.com/health
curl -I https://www.VOTRE_DOMAINE.com
```

---

## 6. Configuration et premiers pas

### 6.1 Initialiser les données de démonstration (optionnel)

```bash
cd /opt/yamaha-drt
./scripts/deploy.sh seed
```

### 6.2 Créer un utilisateur admin

```bash
# Se connecter au conteneur API
docker exec -it yamaha-api sh

# Exécuter le script de seed ou créer manuellement
npx prisma db seed --schema=/app/packages/database/prisma/schema.prisma

# Ou réinitialiser le mot de passe admin
# npx tsx /app/packages/database/reset-admin.ts
```

### 6.3 Accès aux applications

| Application | URL |
|-------------|-----|
| Site public | https://www.VOTRE_DOMAINE.com |
| Back-office | https://admin.VOTRE_DOMAINE.com |
| Tablette | https://tablette.VOTRE_DOMAINE.com |
| API | https://api.VOTRE_DOMAINE.com |

Identifiants par défaut (à changer immédiatement):
- **Email**: admin@yamaha-drt.fr
- **Mot de passe**: AdminPassword123!

---

## 7. Maintenance

### 7.1 Commandes utiles

```bash
cd /opt/yamaha-drt

# Voir l'état des services
./scripts/deploy.sh status

# Voir les logs
./scripts/deploy.sh logs           # Tous les services
./scripts/deploy.sh logs api       # API uniquement
./scripts/deploy.sh logs postgres  # Base de données

# Redémarrer les services
./scripts/deploy.sh restart

# Arrêter les services
./scripts/deploy.sh stop

# Backup de la base de données
./scripts/deploy.sh backup
```

### 7.2 Mise à jour de l'application

```bash
cd /opt/yamaha-drt

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redéployer
./scripts/deploy.sh update
```

### 7.3 Backups automatiques

Créez un cron pour les backups automatiques:

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (backup quotidien à 3h du matin)
0 3 * * * /opt/yamaha-drt/scripts/deploy.sh backup >> /var/log/yamaha-backup.log 2>&1
```

### 7.4 Monitoring

```bash
# Utilisation des ressources
docker stats

# Espace disque
df -h

# Logs système
sudo journalctl -u docker -f
```

---

## 8. Dépannage

### Problème: Les certificats SSL ne se génèrent pas

```bash
# Vérifier les logs Traefik
docker compose -f docker-compose.prod.yml logs traefik

# Vérifier que le DNS est bien configuré
dig +short api.VOTRE_DOMAINE.com

# Forcer le renouvellement
docker compose -f docker-compose.prod.yml restart traefik
```

### Problème: L'API ne démarre pas

```bash
# Vérifier les logs de l'API
docker compose -f docker-compose.prod.yml logs api

# Vérifier la connexion à la base de données
docker compose -f docker-compose.prod.yml exec postgres psql -U yamaha_user -d yamaha_drt -c "SELECT 1"

# Reconstruire l'image
docker compose -f docker-compose.prod.yml build --no-cache api
docker compose -f docker-compose.prod.yml up -d api
```

### Problème: Erreur "Permission denied" sur les uploads

```bash
# Vérifier les permissions
ls -la uploads/

# Corriger les permissions
sudo chown -R 1000:1000 uploads/
chmod 755 uploads/
```

### Problème: Base de données corrompue

```bash
# Restaurer depuis un backup
gunzip -c /opt/backups/yamaha-drt/yamaha_drt_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U yamaha_user yamaha_drt
```

### Problème: Espace disque plein

```bash
# Nettoyer les images Docker inutilisées
docker system prune -a

# Nettoyer les vieux backups (garder les 5 derniers)
ls -t /opt/backups/yamaha-drt/*.sql.gz | tail -n +6 | xargs rm -f

# Voir l'utilisation par volume
docker system df -v
```

### Commandes de diagnostic

```bash
# État complet du système
./scripts/deploy.sh status

# Tester la connectivité API
curl -v https://api.VOTRE_DOMAINE.com/health

# Vérifier les migrations Prisma
docker compose -f docker-compose.prod.yml exec api npx prisma migrate status

# Se connecter à la base de données
docker compose -f docker-compose.prod.yml exec postgres psql -U yamaha_user yamaha_drt
```

---

## Résumé des commandes essentielles

```bash
# Premier déploiement
./scripts/deploy.sh first

# Mise à jour
./scripts/deploy.sh update

# Redémarrage
./scripts/deploy.sh restart

# Logs
./scripts/deploy.sh logs [service]

# Status
./scripts/deploy.sh status

# Backup
./scripts/deploy.sh backup

# Arrêt
./scripts/deploy.sh stop
```

---

## Support

En cas de problème:
1. Consultez les logs: `./scripts/deploy.sh logs`
2. Vérifiez l'état des services: `./scripts/deploy.sh status`
3. Consultez la documentation Traefik, Docker, et Prisma
