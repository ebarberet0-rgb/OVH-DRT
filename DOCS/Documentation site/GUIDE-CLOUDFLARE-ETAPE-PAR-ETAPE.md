# 🎯 Guide Cloudflare - Étape par étape

## Étape 1 : Se connecter à Cloudflare ✅

1. Ouvrez : https://dash.cloudflare.com
2. Connectez-vous

## Étape 2 : Sélectionner le domaine

Sur le dashboard, vous devriez voir une liste de domaines.

**→ Cliquez sur : `barberet.fr`**

Vous êtes maintenant sur la page d'accueil du domaine barberet.fr.

## Étape 3 : Aller dans Security Settings

Dans le **menu de gauche**, cherchez :

```
🛡️ Security
```

**→ Cliquez sur "Security"**

Ensuite, cherchez et cliquez sur :

```
⚙️ Settings
```

Vous êtes maintenant sur la page "Security Settings".

## Étape 4 : Modifier Security Level

Sur cette page, cherchez la section :

```
┌─────────────────────────────────┐
│ Security Level                  │
│                                 │
│ Ajuste le niveau de sécurité    │
│ des challenges Cloudflare       │
└─────────────────────────────────┘
```

Vous verrez un menu déroulant ou des boutons radio avec ces options :
- Essentially Off
- Low
- Medium (probablement sélectionné)
- High
- Under Attack

**→ Sélectionnez : "Low" ou "Medium"**

**→ Cliquez sur "Save" ou le bouton s'enregistre automatiquement**

## Étape 5 : Désactiver Bot Fight Mode

Maintenant, dans le **menu de gauche**, cliquez sur :

```
🤖 Bots
```

Sur la page "Bots", cherchez :

```
┌─────────────────────────────────┐
│ Bot Fight Mode                  │
│                                 │
│ [Toggle ON/OFF]                 │
└─────────────────────────────────┘
```

**→ Si le toggle est sur "ON", cliquez dessus pour le mettre sur "OFF"**

**→ Confirmez si nécessaire**

## Étape 6 : Tester la configuration

Maintenant, testez si Cloudflare ne bloque plus.

### Test 1 : Depuis votre navigateur

Ouvrez un nouvel onglet et allez sur :

```
https://demo-service4.barberet.fr/health
```

**✅ Résultat attendu (BON)** :
```json
{"status":"ok","timestamp":"2026-01-13T10:30:00.000Z","environment":"development"}
```

**❌ Résultat si ça ne marche pas (MAUVAIS)** :
- Page HTML "Just a moment..."
- Page blanche
- Erreur 403

### Test 2 : Depuis la ligne de commande

Ouvrez un terminal et tapez :

```bash
curl https://demo-service4.barberet.fr/health
```

**✅ Vous devez voir du JSON**, pas du HTML.

## Étape 7 : Redémarrer les services en mode production

Si les tests ci-dessus fonctionnent (vous voyez du JSON), exécutez :

```bash
FIX-PRODUCTION.bat
```

Ce script va :
1. Arrêter tous les services Node
2. Redémarrer l'API locale
3. Redémarrer les frontends en mode PRODUCTION (ils appelleront demo-service4.barberet.fr)

**→ Attendez que les fenêtres de commande s'ouvrent**

## Étape 8 : Test final avec votre collègue

Demandez à votre collègue d'ouvrir :

```
https://demo-service2.barberet.fr
```

**✅ Il devrait voir la page de login**

**Identifiants :**
- Email : `heloise@yamaha.fr`
- Mot de passe : `admin123`

---

## 🔍 Si ça ne fonctionne toujours pas

### Option alternative : Créer une règle WAF

Si même après avoir baissé Security Level et désactivé Bot Fight Mode, Cloudflare bloque encore, créez une règle WAF :

1. Dans le menu gauche : **Security** → **WAF**
2. Onglet : **Custom rules**
3. Cliquez : **Create rule**
4. Configuration :
   - **Rule name** : `Allow Demo Services`
   - **Field** : `Hostname`
   - **Operator** : `contains`
   - **Value** : `demo-service`
5. **Then** :
   - **Action** : `Skip`
   - Cochez : **All remaining custom rules**
   - Cochez : **All managed rulesets**
   - Cochez : **All rate limiting rules**
6. **Deploy**

---

## 📸 Captures d'écran de référence

### Menu Security > Settings
```
Dashboard Cloudflare
├── Home
├── Analytics
├── DNS
├── SSL/TLS
├── 🛡️ Security ← CLIQUEZ ICI
│   ├── ⚙️ Settings ← PUIS ICI
│   ├── WAF
│   ├── DDoS
│   └── 🤖 Bots ← OU ICI
├── Speed
└── ...
```

### Security Level
```
┌──────────────────────────────────────┐
│ Security Level                       │
│                                      │
│ Choose the level of security for    │
│ your website                         │
│                                      │
│ ○ Essentially Off                   │
│ ● Low              ← CHOISIR ICI    │
│ ○ Medium                            │
│ ○ High                              │
│ ○ Under Attack                      │
│                                      │
│ [Save]                              │
└──────────────────────────────────────┘
```

### Bot Fight Mode
```
┌──────────────────────────────────────┐
│ Bot Fight Mode                       │
│                                      │
│ Protects your site from bad bots   │
│                                      │
│ [Toggle: ON] → [Toggle: OFF]       │
│              ← METTRE SUR OFF       │
└──────────────────────────────────────┘
```

---

## ✅ Checklist finale

- [ ] Connecté à Cloudflare Dashboard
- [ ] Domaine barberet.fr sélectionné
- [ ] Security Level changé vers "Low"
- [ ] Bot Fight Mode désactivé (OFF)
- [ ] Test `curl https://demo-service4.barberet.fr/health` → JSON visible
- [ ] Exécuté `FIX-PRODUCTION.bat`
- [ ] Collègue peut accéder à https://demo-service2.barberet.fr
- [ ] Collègue peut se connecter avec heloise@yamaha.fr / admin123

---

**Durée totale estimée : 5-10 minutes**
