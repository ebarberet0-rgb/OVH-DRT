# 🚨 Configuration Cloudflare URGENTE

## ❌ Problème actuel

Cloudflare **BLOQUE** complètement l'accès à vos services avec son "Bot Fight Mode" ou "Security Challenge".

**Symptômes:**
- ✅ Connexion fonctionne en local (`localhost:5175`)
- ❌ Erreur 401 via Cloudflare (`demo-service2.barberet.fr`)
- ❌ API retourne "Just a moment..." au lieu du JSON

## 🎯 Solution IMMÉDIATE (5 minutes)

### Option 1 : Désactiver Security Level (Le plus rapide)

1. Ouvrez https://dash.cloudflare.com
2. Cliquez sur **barberet.fr**
3. Menu gauche : **Security** → **Settings**
4. Trouvez **"Security Level"**
5. Changez de "High" ou "I'm Under Attack" vers **"Medium"** ou **"Low"**
6. **Save**

### Option 2 : Désactiver Bot Fight Mode

1. Dans le dashboard Cloudflare
2. Menu gauche : **Security** → **Bots**
3. Trouvez **"Bot Fight Mode"**
4. **Désactivez-le** (toggle OFF)
5. **Save**

### Option 3 : Créer une règle WAF (Recommandé pour la production)

1. Menu gauche : **Security** → **WAF**
2. Onglet **Custom rules**
3. Cliquez sur **Create rule**
4. Configuration :
   - **Rule name** : `Allow Demo Services`
   - **Field** : `Hostname`
   - **Operator** : `contains`
   - **Value** : `demo-service`
5. **Then** :
   - Action : **Skip**
   - Cochez TOUTES les options (All remaining custom rules, All managed rulesets, etc.)
6. Cliquez sur **Deploy**

## 🧪 Test après configuration

Après avoir appliqué UNE des options ci-dessus, testez :

```bash
# Test 1 : L'API doit retourner du JSON (pas de HTML)
curl https://demo-service4.barberet.fr/health

# Résultat attendu :
# {"status":"ok","timestamp":"...","environment":"development"}
```

Puis essayez de vous connecter sur https://demo-service2.barberet.fr

## 📸 Captures d'écran des paramètres

### Security Level (Option 1)
```
Security > Settings
┌─────────────────────────────────┐
│ Security Level                  │
│ ◉ Essentially Off               │
│ ○ Low                          │ ← Choisir Low ou Medium
│ ○ Medium                       │
│ ○ High                         │
│ ○ I'm Under Attack             │
└─────────────────────────────────┘
```

### Bot Fight Mode (Option 2)
```
Security > Bots
┌─────────────────────────────────┐
│ Bot Fight Mode                  │
│ [X] OFF  [ ] ON                │ ← Mettre sur OFF
└─────────────────────────────────┘
```

### WAF Custom Rule (Option 3)
```
Security > WAF > Custom rules > Create rule
┌─────────────────────────────────┐
│ Rule name: Allow Demo Services  │
│                                 │
│ When incoming requests match:   │
│ Hostname contains demo-service  │
│                                 │
│ Then:                           │
│ Skip - All remaining rules      │
└─────────────────────────────────┘
```

## ⏱️ Temps de propagation

Les changements sont **immédiats** (quelques secondes).

Après avoir appliqué la configuration, testez immédiatement.

## ✅ Vérification que ça fonctionne

Une fois configuré, vous devriez pouvoir :

1. ✅ Ouvrir https://demo-service4.barberet.fr/health et voir du JSON
2. ✅ Ouvrir https://demo-service2.barberet.fr et voir la page de login
3. ✅ Vous connecter avec `heloise@yamaha.fr` / `admin123`

## 🚨 IMPORTANT

**Cloudflare bloque actuellement TOUT le trafic vers vos services.**

Sans cette configuration, il est **IMPOSSIBLE** d'utiliser les URLs demo-service*.barberet.fr

## 🔄 Alternative : Utiliser uniquement en local

Si vous ne pouvez pas modifier Cloudflare maintenant, utilisez l'environnement local :

```bash
# Exécutez
QUICK-FIX.bat

# Puis ouvrez
http://localhost:5175

# Connectez-vous avec
heloise@yamaha.fr / admin123
```

Cela fonctionnera immédiatement sans configuration Cloudflare.

---

**URGENT** : Appliquez l'une des 3 options ci-dessus sur Cloudflare MAINTENANT.
