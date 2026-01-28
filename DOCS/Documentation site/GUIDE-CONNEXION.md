# Guide de connexion - Yamaha DRT

## ✅ Problème résolu !

Le problème d'authentification était dû à l'absence d'utilisateurs dans la base de données. La base a maintenant été initialisée avec succès.

## 🔐 Identifiants de connexion

### Pour le backoffice (demo-service2.barberet.fr)

**Administrateur:**
- Email: `heloise@yamaha.fr`
- Mot de passe: `admin123`
- Rôle: ADMIN (accès complet)

**Instructeurs:**
- Email: `instructor1@yamaha.fr` / Mot de passe: `instructor123`
- Email: `instructor2@yamaha.fr` / Mot de passe: `instructor123`
- Rôle: INSTRUCTOR (gestion des sessions)

### Pour le site public (demo-service3.barberet.fr)

**Clients de test:**
- Email: `client1@example.com` / Mot de passe: `client123`
- Email: `client2@example.com` / Mot de passe: `client123`
- Rôle: CLIENT (réservations)

## 🚀 Comment démarrer l'application

### Mode développement (local uniquement)

```bash
start-all.bat
```

Puis accédez à:
- API: http://localhost:3001
- Backoffice: http://localhost:5175
- Web: http://localhost:5173
- Tablette: http://localhost:5174

### Mode production (avec Cloudflare)

```bash
start-all-with-tunnel.bat
```

Puis accédez à:
- API: https://demo-service4.barberet.fr
- Backoffice: https://demo-service2.barberet.fr
- Web: https://demo-service3.barberet.fr
- Tablette: https://demo-service1.barberet.fr

## ⚠️ Important: Configuration Cloudflare

Si vous obtenez une erreur **403 Forbidden** en accédant aux sites demo-service*.barberet.fr, vous devez configurer Cloudflare:

1. Connectez-vous à https://dash.cloudflare.com
2. Sélectionnez le domaine **barberet.fr**
3. Allez dans **Security** → **Settings**
4. Changez le **Security Level** à **"Medium"** ou **"Low"**
5. Désactivez **"Bot Fight Mode"** dans **Security** → **Bots**

Voir le fichier [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md) pour plus de détails.

## 🔄 Réinitialiser la base de données

Si vous avez besoin de remettre la base à zéro avec les données de test:

```bash
npx tsx packages/database/prisma/seed.ts
```

⚠️ **Attention**: Cette commande supprime TOUTES les données existantes et recrée les données de test.

## 🧪 Tester l'API directement

### Test de santé
```bash
curl http://localhost:3001/health
```

### Test de connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"heloise@yamaha.fr\",\"password\":\"admin123\"}"
```

## 📝 Configuration des variables d'environnement

### Développement local
Les fichiers `.env` dans chaque application utilisent `http://localhost:3001`

### Production (Cloudflare)
Les fichiers `.env.production` utilisent `https://demo-service4.barberet.fr`

Pour forcer le mode production en local:
```bash
# Dans chaque terminal d'application frontend
cd apps/backoffice
npm run dev -- --mode production
```

## 🔍 Dépannage

### "Invalid credentials"
- Vérifiez que vous utilisez les bons identifiants
- Assurez-vous que la base de données a été initialisée (seed)

### "Cannot connect to API"
- Vérifiez que l'API est démarrée sur le port 3001
- Testez: `curl http://localhost:3001/health`

### "403 Forbidden" (Cloudflare)
- Suivez les instructions dans [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md)
- Vérifiez que le tunnel est actif: `cloudflared tunnel list`

### Erreur CORS
- Vérifiez le fichier `.env` à la racine
- La variable `CORS_ORIGIN` doit contenir tous vos domaines

## 📊 Structure de la base de données

Après le seed, vous aurez:
- ✅ 1 administrateur
- ✅ 2 instructeurs
- ✅ 2 concessionnaires
- ✅ 6 motos (3 groupe A2, 3 groupe A)
- ✅ 2 événements
- ✅ 24 sessions de démonstration
- ✅ 2 clients de test

## 🎯 Prochaines étapes

1. ✅ Base de données initialisée
2. ✅ Identifiants admin disponibles
3. ⏳ Configurer Cloudflare (si erreur 403)
4. ⏳ Tester la connexion sur demo-service2.barberet.fr
5. ⏳ Créer de vrais comptes utilisateurs

## 📞 Support

En cas de problème persistant:
1. Vérifiez les logs de l'API
2. Consultez les fichiers de documentation:
   - [CLOUDFLARE-SETUP.md](CLOUDFLARE-SETUP.md)
   - [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md)
3. Relancez les services avec `start-all.bat`
