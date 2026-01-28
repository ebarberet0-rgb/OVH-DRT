# 🌐 Guide d'accès externe (pour vos collègues)

## 🔍 Problème actuel

Votre collègue ne peut pas se connecter car :

1. ❌ **Cloudflare bloque l'accès** (erreur 403 Forbidden)
2. ❌ Le backoffice essaie d'appeler `http://localhost:3001` qui n'existe que sur votre machine

## ✅ Solution en 2 étapes

### Étape 1 : Configurer Cloudflare (OBLIGATOIRE)

**Sans cette étape, PERSONNE ne peut accéder aux URLs demo-service*.barberet.fr**

#### Option rapide (5 minutes)

1. Allez sur https://dash.cloudflare.com
2. Sélectionnez **barberet.fr**
3. Menu : **Security** → **Settings**
4. **Security Level** : Changez vers **"Low"** ou **"Medium"**
5. Menu : **Security** → **Bots**
6. **Bot Fight Mode** : Désactivez (toggle OFF)
7. **Enregistrez**

#### Vérification que ça fonctionne

Après la config Cloudflare, testez :

```bash
curl https://demo-service4.barberet.fr/health
```

**Résultat attendu** :
```json
{"status":"ok","timestamp":"2026-01-13T...","environment":"development"}
```

**Si vous voyez du HTML** au lieu de JSON, Cloudflare bloque encore.

### Étape 2 : Redémarrer les services en mode production

Sur **VOTRE machine** (là où tourne l'API), exécutez :

```bash
FIX-PRODUCTION.bat
```

Ce script :
- ✅ Démarre l'API sur votre machine locale
- ✅ Configure les apps frontend pour appeler `https://demo-service4.barberet.fr`
- ✅ Le tunnel Cloudflare redirige vers votre API locale

## 📊 Architecture

```
Collègue (externe)
       │
       ▼
https://demo-service2.barberet.fr (Backoffice)
       │
       ├─ HTML/JS chargé depuis Cloudflare
       │
       ▼
Appels API vers: https://demo-service4.barberet.fr
       │
       ▼
Cloudflare Tunnel (546111e4-3f0c...)
       │
       ▼
Votre API locale: http://localhost:3001
       │
       ▼
PostgreSQL local: localhost:5432
```

## ⚙️ Configuration actuelle

### Sur VOTRE machine
- ✅ API : `localhost:3001` (accessible uniquement par vous)
- ✅ Base de données : PostgreSQL en Docker
- ✅ Tunnel Cloudflare actif

### Via Cloudflare (accès externe)
- ❌ demo-service4.barberet.fr → **BLOQUÉ 403**
- ❌ demo-service2.barberet.fr → **BLOQUÉ 403**

## 🔧 Checklist complète

### Sur votre machine (serveur)

- [ ] **Cloudflare configuré** (Security Level = Low, Bot Fight Mode = Off)
- [ ] **Tunnel Cloudflare actif** (`cloudflared tunnel list`)
- [ ] **API démarrée** (`localhost:3001`)
- [ ] **Services en mode production** (`FIX-PRODUCTION.bat`)
- [ ] **Test API via Cloudflare réussi** (`curl https://demo-service4.barberet.fr/health`)

### Test avec votre collègue

Une fois la checklist complète :

1. **Votre collègue** ouvre : https://demo-service2.barberet.fr
2. **Devrait voir** : La page de login (sans erreur)
3. **Se connecte avec** : `heloise@yamaha.fr` / `admin123`
4. **Devrait fonctionner** : Accès au backoffice

## 🚨 Erreurs courantes

### Erreur : "Blocage requête multiorigine (CORS)"

**Cause** : Le backoffice essaie d'appeler `localhost:3001`

**Solution** : Redémarrez avec `FIX-PRODUCTION.bat`

### Erreur : 403 Forbidden

**Cause** : Cloudflare bloque l'accès

**Solution** : Configurez Cloudflare (Étape 1)

### Erreur : 401 Unauthorized

**Cause** : L'API via Cloudflare fonctionne mais rejette les identifiants

**Vérifications** :
1. L'API locale est bien démarrée ?
2. La base de données a été seed ? (`npx tsx packages/database/prisma/seed.ts`)
3. Le tunnel pointe bien vers `localhost:3001` ?

### Erreur : "Could not establish connection"

**Causes possibles** :
1. Tunnel Cloudflare non actif
2. API non démarrée
3. Cloudflare bloque

**Solution** :
```bash
# Vérifier le tunnel
cloudflared tunnel list

# Vérifier l'API
curl http://localhost:3001/health

# Redémarrer tout
FIX-PRODUCTION.bat
```

## 💡 Test complet étape par étape

### 1. Depuis votre machine

```bash
# Test API locale
curl http://localhost:3001/health

# Test API via Cloudflare
curl https://demo-service4.barberet.fr/health

# Test login local
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"heloise@yamaha.fr\",\"password\":\"admin123\"}"
```

Tous ces tests doivent retourner du JSON (pas de HTML, pas d'erreur 403).

### 2. Depuis le navigateur de votre collègue

1. Ouvrir : https://demo-service4.barberet.fr/health
   - **Attendu** : JSON avec `{"status":"ok",...}`
   - **Si HTML/403** : Cloudflare bloque encore

2. Ouvrir : https://demo-service2.barberet.fr
   - **Attendu** : Page de login
   - **Si 403** : Cloudflare bloque

3. Se connecter avec `heloise@yamaha.fr` / `admin123`
   - **Attendu** : Accès au dashboard
   - **Si erreur CORS** : Redémarrez avec `FIX-PRODUCTION.bat`

## 📞 Dépannage rapide

### Test 1 : Cloudflare fonctionne ?

```bash
curl -I https://demo-service4.barberet.fr/health
```

- ✅ Si `HTTP/1.1 200 OK` → Cloudflare OK
- ❌ Si `HTTP/1.1 403 Forbidden` → Configurez Cloudflare

### Test 2 : Tunnel actif ?

```bash
cloudflared tunnel list
```

- ✅ Si vous voyez votre tunnel avec des connexions → Tunnel OK
- ❌ Si pas de tunnel ou 0 connexions → Redémarrez le tunnel

### Test 3 : API locale fonctionne ?

```bash
curl http://localhost:3001/health
```

- ✅ Si JSON → API OK
- ❌ Si erreur → Démarrez l'API avec `FIX-PRODUCTION.bat`

## 🎯 Résumé pour que votre collègue puisse accéder

1. ✅ **Vous** : Configurez Cloudflare (Security Level = Low)
2. ✅ **Vous** : Exécutez `FIX-PRODUCTION.bat`
3. ✅ **Vous** : Vérifiez que l'API est accessible via Cloudflare
4. ✅ **Collègue** : Ouvre https://demo-service2.barberet.fr
5. ✅ **Collègue** : Se connecte avec `heloise@yamaha.fr` / `admin123`

---

**IMPORTANT** : Le point critique est la configuration Cloudflare. Sans elle, rien ne fonctionnera pour l'accès externe.
