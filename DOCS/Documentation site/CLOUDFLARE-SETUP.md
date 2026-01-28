# Configuration Cloudflare Tunnel

## Problème résolu

Les applications frontend ne pouvaient pas s'authentifier car elles appelaient `http://localhost:3001` depuis des pages servies en HTTPS par Cloudflare, ce qui est bloqué par les navigateurs (mixed content).

## Solution

Les applications utilisent maintenant `https://demo-service4.barberet.fr` pour l'API quand elles sont démarrées en mode production.

## Architecture

```
┌─────────────────────────────────────────┐
│     Cloudflare Tunnel (cloudflared)     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
  demo-service1  demo-service2  demo-service3  demo-service4
   (Tablette)    (Backoffice)     (Web)         (API)
   port 5174     port 5175      port 5173     port 3001
```

## Fichiers créés

### Fichiers de configuration
- `.env.production` pour chaque app (backoffice, web, tablette)
  - Configure `VITE_API_URL=https://demo-service4.barberet.fr`

### Scripts de démarrage

1. **`start-all-cloudflare.bat`**
   - Démarre tous les services en mode production
   - Les apps utilisent automatiquement les fichiers `.env.production`

2. **`start-cloudflare-tunnel.bat`**
   - Démarre uniquement le tunnel Cloudflare

3. **`start-all-with-tunnel.bat`**
   - Démarre tout en une seule commande (services + tunnel)

### Configuration tunnel
- **`cloudflared-config.yml`**
  - Configuration du tunnel avec vos identifiants

## Comment utiliser

### Option 1: Tout en une seule commande (Recommandé)
```bash
start-all-with-tunnel.bat
```

### Option 2: Séparément
```bash
# Terminal 1: Démarrer les services
start-all-cloudflare.bat

# Terminal 2: Démarrer le tunnel
start-cloudflare-tunnel.bat
```

## Développement local vs Production

### Mode développement (local uniquement)
```bash
start-all.bat
```
- Utilise les fichiers `.env` standard
- API URL: `http://localhost:3001`
- Pas besoin du tunnel

### Mode production (avec Cloudflare)
```bash
start-all-cloudflare.bat
```
- Utilise les fichiers `.env.production`
- API URL: `https://demo-service4.barberet.fr`
- Nécessite le tunnel actif

## URLs de production

| Service | URL Cloudflare | Port local |
|---------|----------------|------------|
| Tablette | https://demo-service1.barberet.fr | 5174 |
| Backoffice | https://demo-service2.barberet.fr | 5175 |
| Web | https://demo-service3.barberet.fr | 5173 |
| API | https://demo-service4.barberet.fr | 3001 |

## Vérification

1. Démarrez les services avec le tunnel
2. Ouvrez https://demo-service4.barberet.fr/health
3. Vous devriez voir: `{"status":"ok","timestamp":"...","environment":"development"}`
4. Testez l'authentification sur https://demo-service2.barberet.fr

## Dépannage

### Erreur CORS
Si vous voyez des erreurs CORS, vérifiez que le fichier `.env` à la racine contient bien:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,https://demo-service1.barberet.fr,https://demo-service2.barberet.fr,https://demo-service3.barberet.fr,https://demo-service4.barberet.fr
```

### L'API n'est pas joignable
1. Vérifiez que l'API est démarrée: http://localhost:3001/health
2. Vérifiez que le tunnel est actif: `cloudflared tunnel list`
3. Vérifiez les logs du tunnel

### Mixed content error
Cela signifie que l'app essaie encore d'appeler `http://localhost:3001`.
- Vérifiez que vous avez démarré avec `start-all-cloudflare.bat`
- Vérifiez que les fichiers `.env.production` existent
- Rafraîchissez le cache du navigateur (Ctrl+Shift+R)

## Configuration DNS Cloudflare

Assurez-vous que les enregistrements DNS suivants existent dans votre dashboard Cloudflare:

| Type | Nom | Cible | Proxy |
|------|-----|-------|-------|
| CNAME | demo-service1 | 546111e4-3f0c-48a7-b064-68d892ea0fb6.cfargotunnel.com | ✅ Activé |
| CNAME | demo-service2 | 546111e4-3f0c-48a7-b064-68d892ea0fb6.cfargotunnel.com | ✅ Activé |
| CNAME | demo-service3 | 546111e4-3f0c-48a7-b064-68d892ea0fb6.cfargotunnel.com | ✅ Activé |
| CNAME | demo-service4 | 546111e4-3f0c-48a7-b064-68d892ea0fb6.cfargotunnel.com | ✅ Activé |
