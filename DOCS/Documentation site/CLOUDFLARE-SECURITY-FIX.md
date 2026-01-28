# Fix: Cloudflare 403 Forbidden Error

## Problème identifié

Les sites `demo-service1.barberet.fr`, `demo-service2.barberet.fr`, `demo-service3.barberet.fr`, et `demo-service4.barberet.fr` retournent une erreur **403 Forbidden** avec l'en-tête `cf-mitigated: challenge`.

Cela signifie que **Cloudflare bloque les requêtes** avec ses mécanismes de sécurité.

## Vérifications effectuées

✅ Le tunnel Cloudflare est actif (4 connexions)
✅ Les services locaux fonctionnent (API sur 3001, Backoffice sur 5175)
✅ Les fichiers `.env.production` sont configurés correctement
✅ La configuration CORS dans l'API est correcte

❌ **Cloudflare bloque l'accès avec ses règles de sécurité**

## Solutions à appliquer dans le Dashboard Cloudflare

### Solution 1: Désactiver temporairement le mode de sécurité élevé

1. Connectez-vous à https://dash.cloudflare.com
2. Sélectionnez votre domaine **barberet.fr**
3. Allez dans **Security** → **Settings**
4. Changez le **Security Level** de "High" ou "I'm Under Attack" à **"Medium"** ou **"Low"**

### Solution 2: Désactiver Bot Fight Mode

1. Dans Cloudflare Dashboard, allez dans **Security** → **Bots**
2. Désactivez **"Bot Fight Mode"** (si activé)
3. Ou ajoutez une exception pour vos sous-domaines demo-service*

### Solution 3: Créer une règle WAF pour autoriser les tunnels

1. Allez dans **Security** → **WAF**
2. Cliquez sur **"Create rule"**
3. Nommez la règle: "Allow Cloudflare Tunnel"
4. Configuration:
   ```
   Field: Hostname
   Operator: contains
   Value: demo-service
   ```
5. Action: **Skip** → Cochez toutes les règles WAF
6. **Deploy**

### Solution 4: Désactiver les challenges pour les tunnels (Recommandé)

1. Allez dans **Security** → **Settings**
2. Sous **"Security Level"**, cliquez sur **"Firewall Rules"**
3. Créez une nouvelle règle:
   - **Rule name**: "Allow Tunnel Traffic"
   - **When incoming requests match**:
     ```
     (http.host contains "demo-service1.barberet.fr") or
     (http.host contains "demo-service2.barberet.fr") or
     (http.host contains "demo-service3.barberet.fr") or
     (http.host contains "demo-service4.barberet.fr")
     ```
   - **Then**: Choose **"Allow"**
4. **Deploy**

### Solution 5: Utiliser Cloudflare Access (Plus sécurisé)

Si vous voulez maintenir la sécurité tout en permettant l'accès:

1. Allez dans **Zero Trust** → **Access** → **Applications**
2. **Add an application** → **Self-hosted**
3. Configuration:
   - Application name: "Yamaha Demo Services"
   - Subdomain: `demo-service*`
   - Domain: `barberet.fr`
4. **Next** → Configurez les politiques d'accès (email, IP, etc.)
5. **Save**

## Test après configuration

Après avoir appliqué l'une des solutions ci-dessus, testez:

```bash
# Test API
curl https://demo-service4.barberet.fr/health

# Test Backoffice (depuis un navigateur)
https://demo-service2.barberet.fr
```

Vous devriez voir:
- **API**: `{"status":"ok","timestamp":"...","environment":"development"}`
- **Backoffice**: La page de login

## Configuration la plus simple (Développement)

Pour le développement, la solution la plus rapide est:

1. **Security Level** → **Low** (ou Medium)
2. **Bot Fight Mode** → **Off**
3. Créer une **Firewall Rule** pour autoriser les sous-domaines demo-service*

## Configuration recommandée (Production)

Pour la production:

1. Gardez **Security Level** à **Medium**
2. Créez des **Firewall Rules** spécifiques pour vos sous-domaines
3. Utilisez **Cloudflare Access** pour l'authentification supplémentaire
4. Activez **Rate Limiting** pour éviter les abus

## Vérification des règles actuelles

Pour voir quelles règles bloquent vos requêtes:

1. Allez dans **Analytics** → **Security**
2. Regardez les événements récents
3. Vous devriez voir les requêtes bloquées avec la raison

## Commandes de diagnostic

```bash
# Voir les détails de la réponse Cloudflare
curl -I https://demo-service2.barberet.fr

# Tester avec un User-Agent différent
curl -I -A "Mozilla/5.0" https://demo-service2.barberet.fr

# Voir tous les headers de réponse
curl -v https://demo-service4.barberet.fr/health
```

## Prochaines étapes

1. ✅ Appliquer l'une des solutions ci-dessus dans Cloudflare
2. ✅ Tester l'accès aux sites
3. ✅ Démarrer les services avec `start-all-with-tunnel.bat`
4. ✅ Tester l'authentification sur https://demo-service2.barberet.fr

## Contact Support Cloudflare

Si le problème persiste, contactez le support Cloudflare avec ces informations:

- **CF-RAY ID**: Visible dans les headers de réponse (ex: 9bd42197aeca74f3)
- **Domaine**: barberet.fr
- **Sous-domaines**: demo-service1/2/3/4.barberet.fr
- **Problème**: 403 Forbidden avec cf-mitigated: challenge
- **Tunnel ID**: 546111e4-3f0c-48a7-b064-68d892ea0fb6
