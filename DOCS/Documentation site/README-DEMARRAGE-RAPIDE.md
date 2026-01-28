# 🚀 Yamaha DRT - Démarrage Rapide

## ✅ Problème résolu : Impossible de se connecter

**Cause**: La base de données n'avait pas d'utilisateurs.
**Solution**: La base a été initialisée avec succès !

## 🎯 Démarrage en 3 étapes

### Étape 1: Initialiser la base de données (DÉJÀ FAIT ✅)

```bash
npx tsx packages/database/prisma/seed.ts
```

### Étape 2: Démarrer les services

**Mode développement (local):**
```bash
start-all.bat
```

**Mode production (avec Cloudflare):**
```bash
start-all-with-tunnel.bat
```

### Étape 3: Se connecter

**Accès local:**
- Backoffice: http://localhost:5175
- Email: `heloise@yamaha.fr`
- Mot de passe: `admin123`

**Accès via Cloudflare:**
- Backoffice: https://demo-service2.barberet.fr
- Email: `heloise@yamaha.fr`
- Mot de passe: `admin123`

⚠️ **Si erreur 403 Forbidden**, voir [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md)

## 📋 Scripts disponibles

| Script | Description |
|--------|-------------|
| `start-all.bat` | Démarre tous les services en mode local |
| `start-all-cloudflare.bat` | Démarre les services en mode production |
| `start-all-with-tunnel.bat` | Démarre services + tunnel Cloudflare |
| `start-cloudflare-tunnel.bat` | Démarre uniquement le tunnel |
| `reset-database.bat` | Réinitialise la base avec les données de test |
| `test-login.bat` | Teste la connexion API |
| `test-cloudflare.bat` | Vérifie la configuration Cloudflare |

## 🔐 Tous les identifiants

### Administrateur (Backoffice)
- **Email**: heloise@yamaha.fr
- **Mot de passe**: admin123
- **Rôle**: ADMIN
- **Accès**: Complet (gestion de tout)

### Instructeurs (Backoffice)
- **Email**: instructor1@yamaha.fr ou instructor2@yamaha.fr
- **Mot de passe**: instructor123
- **Rôle**: INSTRUCTOR
- **Accès**: Gestion des sessions

### Clients (Site public)
- **Email**: client1@example.com ou client2@example.com
- **Mot de passe**: client123
- **Rôle**: CLIENT
- **Accès**: Réservations et profil

## 🌐 URLs d'accès

### Développement local
- 🔧 API: http://localhost:3001
- 👔 Backoffice: http://localhost:5175
- 🌍 Web: http://localhost:5173
- 📱 Tablette: http://localhost:5174

### Production (Cloudflare)
- 🔧 API: https://demo-service4.barberet.fr
- 👔 Backoffice: https://demo-service2.barberet.fr
- 🌍 Web: https://demo-service3.barberet.fr
- 📱 Tablette: https://demo-service1.barberet.fr

## 🔧 Dépannage rapide

### Impossible de se connecter en local
```bash
# 1. Vérifier que l'API est démarrée
curl http://localhost:3001/health

# 2. Réinitialiser la base si nécessaire
reset-database.bat

# 3. Tester la connexion
test-login.bat
```

### Erreur 403 sur Cloudflare
```bash
# 1. Vérifier le tunnel
cloudflared tunnel list

# 2. Voir le guide complet
# Lire: CLOUDFLARE-SECURITY-FIX.md
```

### L'API ne répond pas
```bash
# Vérifier que Docker (PostgreSQL) est démarré
docker ps

# Redémarrer tous les services
start-all.bat
```

## 📚 Documentation complète

- [GUIDE-CONNEXION.md](GUIDE-CONNEXION.md) - Guide détaillé de connexion
- [CLOUDFLARE-SETUP.md](CLOUDFLARE-SETUP.md) - Configuration Cloudflare
- [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md) - Fix erreur 403

## ✅ Checklist de vérification

- [x] Base de données initialisée
- [x] Utilisateur admin créé (heloise@yamaha.fr)
- [x] Scripts de démarrage créés
- [x] Configuration Cloudflare documentée
- [x] Fichiers `.env.production` créés
- [ ] Cloudflare sécurité configurée (si erreur 403)
- [ ] Test de connexion réussi

## 🎯 Prochaines actions

1. **Tester en local**: Ouvrez http://localhost:5175 et connectez-vous
2. **Configurer Cloudflare**: Si erreur 403, suivez [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md)
3. **Tester en production**: Ouvrez https://demo-service2.barberet.fr

## 💡 Astuces

### Changer de mot de passe admin
Connectez-vous au backoffice et allez dans "Paramètres" → "Mon profil"

### Créer de nouveaux utilisateurs
- **Admins/Instructeurs**: Via le backoffice, menu "Utilisateurs"
- **Clients**: Via l'inscription sur le site public ou le backoffice

### Voir les logs en temps réel
Les fenêtres de commande affichent les logs de chaque service

### Arrêter tous les services
Fermez toutes les fenêtres de commande ou appuyez sur Ctrl+C dans chacune

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes:

1. Consultez les fichiers de documentation
2. Exécutez les scripts de test
3. Vérifiez les logs dans les fenêtres de commande
4. Réinitialisez la base si nécessaire

---

**Dernière mise à jour**: 2026-01-13
**Version**: 1.0
