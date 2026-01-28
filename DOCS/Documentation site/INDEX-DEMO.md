# 📚 INDEX - Ressources de Démonstration Yamaha DRT

## 🎯 Démarrage Rapide

**Vous avez une démo dans 5 minutes ?**

1. Exécutez : `start-all.bat`
2. Ouvrez : http://localhost:5175
3. Connectez-vous : `heloise@yamaha.fr` / `admin123`
4. Consultez : [AIDE-MEMOIRE-DEMO.md](AIDE-MEMOIRE-DEMO.md)

---

## 📖 Documentation Complète

### 🎬 Pour Préparer Votre Démonstration

| Document | Usage | Durée de Lecture |
|----------|-------|------------------|
| **[PRET-POUR-DEMO.md](PRET-POUR-DEMO.md)** | ✅ **COMMENCEZ ICI** - État des lieux complet | 5 min |
| **[AIDE-MEMOIRE-DEMO.md](AIDE-MEMOIRE-DEMO.md)** | Antisèche 1 page à garder sous les yeux | 2 min |
| **[GUIDE-DEMONSTRATION.md](GUIDE-DEMONSTRATION.md)** | Guide détaillé 15-20 minutes | 10 min |
| **[SLIDES-DEMO.md](SLIDES-DEMO.md)** | 17 slides de présentation | 5 min |

### 🔧 Guides Techniques

| Document | Contenu | Quand l'Utiliser |
|----------|---------|------------------|
| **[README-DEMARRAGE-RAPIDE.md](README-DEMARRAGE-RAPIDE.md)** | Installation et configuration | Première utilisation |
| **[GUIDE-CONNEXION.md](GUIDE-CONNEXION.md)** | Tous les identifiants et URLs | Problème de connexion |
| **[SOLUTION.md](SOLUTION.md)** | Résolution des problèmes | Après dépannage |

### ☁️ Configuration Cloudflare

| Document | Contenu | Quand l'Utiliser |
|----------|---------|------------------|
| **[CLOUDFLARE-SETUP.md](CLOUDFLARE-SETUP.md)** | Configuration initiale | Setup Cloudflare |
| **[CLOUDFLARE-CONFIG-URGENT.md](CLOUDFLARE-CONFIG-URGENT.md)** | Fix erreur 403 | Accès externe bloqué |
| **[CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md)** | Désactiver protections | Erreurs de sécurité |
| **[ACCES-EXTERNE-GUIDE.md](ACCES-EXTERNE-GUIDE.md)** | Partage avec collègues | Démo distante |
| **[GUIDE-CLOUDFLARE-ETAPE-PAR-ETAPE.md](GUIDE-CLOUDFLARE-ETAPE-PAR-ETAPE.md)** | Guide pas à pas | Configuration détaillée |

---

## 🛠️ Scripts Disponibles

### Scripts de Démarrage

| Script | Description | Quand l'Utiliser |
|--------|-------------|------------------|
| **start-all.bat** | Démarre en mode développement (local) | Démo locale |
| **start-all-cloudflare.bat** | Démarre en mode production | Démo avec accès externe |
| **start-all-with-tunnel.bat** | Démarre services + tunnel | Démo complète externe |
| **FIX-PRODUCTION.bat** | ⚡ Redémarre en mode production | Fix problème accès externe |
| **QUICK-FIX.bat** | ⚡ Redémarre en mode développement | Fix problème local |

### Scripts de Maintenance

| Script | Description | Quand l'Utiliser |
|--------|-------------|------------------|
| **reset-database.bat** | Réinitialise la base avec données de test | Reset complet |
| **setup-demo-complete.bat** | Configuration complète de démo | Première installation |
| **add-demo-data.bat** | Ajoute données supplémentaires | Enrichir la démo |

### Scripts de Test

| Script | Description | Quand l'Utiliser |
|--------|-------------|------------------|
| **test-login.bat** | Teste la connexion API | Vérification auth |
| **test-cloudflare.bat** | Teste la configuration Cloudflare | Debug Cloudflare |
| **create-demo-bookings.bat** | Crée des réservations de test | Ajouter réservations |

### Scripts Cloudflare

| Script | Description | Quand l'Utiliser |
|--------|-------------|------------------|
| **start-cloudflare-tunnel.bat** | Démarre uniquement le tunnel | Tunnel seul |

---

## 🔑 Identifiants de Connexion

### 👔 Backoffice

**Administrateur:**
```
URL: http://localhost:5175
Email: heloise@yamaha.fr
Mot de passe: admin123
```

**Instructeurs:**
```
Email: instructor1@yamaha.fr
Mot de passe: instructor123

Email: instructor2@yamaha.fr
Mot de passe: instructor123
```

### 👥 Clients (Site Web Public)

```
Email: client1@example.com
Mot de passe: client123

Email: client2@example.com
Mot de passe: client123
```

---

## 🌐 URLs d'Accès

### Développement (Local)

```
🔧 API:        http://localhost:3001
👔 Backoffice: http://localhost:5175
🌍 Web:        http://localhost:5173
📱 Tablette:   http://localhost:5174
```

### Production (Cloudflare)

```
🔧 API:        https://demo-service4.barberet.fr
👔 Backoffice: https://demo-service2.barberet.fr
🌍 Web:        https://demo-service3.barberet.fr
📱 Tablette:   https://demo-service1.barberet.fr
```

---

## 📊 Données Disponibles

### Base de Données Actuelle

- **20 Motos Yamaha** (toute la gamme 2026)
- **2 Événements** programmés
- **12 Sessions** de démonstration
- **2 Concessionnaires**
- **2 Instructeurs**
- **2 Clients de test**

### Modèles de Motos Disponibles

**Sport:** YZF-R1, YZF-R7, YZF-R3, YZF-R125
**Roadster:** MT-10, MT-09, MT-09 SP, MT-07, MT-125
**Néo-rétro:** XSR900, XSR900 GP, XSR700
**Touring:** Tracer 9 GT, Tracer 7 GT, FJR1300
**Trail:** Ténéré 700
**Scooters Y-AMT:** TMAX 560, XMAX 300, NMAX 125

---

## 🎯 Parcours Recommandé

### Pour une Démo de 5 Minutes

1. [AIDE-MEMOIRE-DEMO.md](AIDE-MEMOIRE-DEMO.md)
2. Lancer `start-all.bat`
3. Ouvrir http://localhost:5175
4. Suivre l'aide-mémoire

### Pour une Démo de 15 Minutes

1. [PRET-POUR-DEMO.md](PRET-POUR-DEMO.md) (lecture)
2. [GUIDE-DEMONSTRATION.md](GUIDE-DEMONSTRATION.md) (préparation)
3. Lancer `start-all.bat`
4. Suivre le guide de démonstration

### Pour une Présentation Complète (30 Minutes)

1. [SLIDES-DEMO.md](SLIDES-DEMO.md) (slides)
2. [GUIDE-DEMONSTRATION.md](GUIDE-DEMONSTRATION.md) (scénario)
3. Lancer `start-all.bat`
4. Présenter puis démontrer

---

## 🚨 Troubleshooting Rapide

### Problème : Services ne démarrent pas

**Solution:**
```bash
taskkill /F /IM node.exe
docker-compose up -d
start-all.bat
```

**Documentation:** [README-DEMARRAGE-RAPIDE.md](README-DEMARRAGE-RAPIDE.md)

### Problème : Impossible de se connecter

**Solution:**
1. Vérifier identifiants : `heloise@yamaha.fr` / `admin123`
2. Réinitialiser : `reset-database.bat`
3. Retester

**Documentation:** [GUIDE-CONNEXION.md](GUIDE-CONNEXION.md)

### Problème : 403 sur Cloudflare

**Solution:**
1. Lire [CLOUDFLARE-CONFIG-URGENT.md](CLOUDFLARE-CONFIG-URGENT.md)
2. Configurer Security Level = Low
3. Désactiver Bot Fight Mode

**Documentation:** [CLOUDFLARE-SECURITY-FIX.md](CLOUDFLARE-SECURITY-FIX.md)

### Problème : Erreur CORS

**Solution:**
```bash
FIX-PRODUCTION.bat
```

**Documentation:** [ACCES-EXTERNE-GUIDE.md](ACCES-EXTERNE-GUIDE.md)

---

## 📁 Structure des Fichiers

```
C:\Dev\Yamaha\
│
├── 📚 DOCUMENTATION
│   ├── INDEX-DEMO.md                       ← Vous êtes ici
│   ├── PRET-POUR-DEMO.md                   ← Commencez ici
│   ├── AIDE-MEMOIRE-DEMO.md                ← Antisèche
│   ├── GUIDE-DEMONSTRATION.md              ← Guide complet
│   ├── SLIDES-DEMO.md                      ← Présentation
│   ├── README-DEMARRAGE-RAPIDE.md          ← Guide technique
│   ├── GUIDE-CONNEXION.md                  ← Identifiants
│   ├── SOLUTION.md                         ← Problèmes résolus
│   │
│   └── 📂 CLOUDFLARE
│       ├── CLOUDFLARE-SETUP.md
│       ├── CLOUDFLARE-CONFIG-URGENT.md
│       ├── CLOUDFLARE-SECURITY-FIX.md
│       ├── ACCES-EXTERNE-GUIDE.md
│       └── GUIDE-CLOUDFLARE-ETAPE-PAR-ETAPE.md
│
├── 🛠️ SCRIPTS
│   ├── start-all.bat
│   ├── start-all-cloudflare.bat
│   ├── start-all-with-tunnel.bat
│   ├── FIX-PRODUCTION.bat
│   ├── QUICK-FIX.bat
│   ├── reset-database.bat
│   ├── test-login.bat
│   ├── test-cloudflare.bat
│   └── ...
│
├── 📂 APPLICATIONS
│   ├── apps/
│   │   ├── api/          (Backend API)
│   │   ├── backoffice/   (Admin Panel)
│   │   ├── web/          (Site Public)
│   │   └── tablette/     (Interface Instructeur)
│   │
│   └── packages/
│       └── database/     (Prisma + Seeds)
│
└── 📋 CONFIGURATION
    ├── .env
    ├── docker-compose.yml
    └── cloudflared-config.yml
```

---

## 🎓 Ressources d'Apprentissage

### Pour Comprendre le Projet

1. **Architecture:** [README-DEMARRAGE-RAPIDE.md](README-DEMARRAGE-RAPIDE.md) - Section "Architecture"
2. **Base de données:** `packages/database/prisma/schema.prisma`
3. **API:** `apps/api/src/index.ts`
4. **Frontend:** `apps/backoffice/src/`

### Pour Aller Plus Loin

- **Prisma Documentation:** https://prisma.io/docs
- **React Documentation:** https://react.dev
- **Express.js:** https://expressjs.com
- **Cloudflare Tunnels:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

---

## ✅ Checklist Pré-Démonstration

**30 minutes avant:**
- [ ] Lire [PRET-POUR-DEMO.md](PRET-POUR-DEMO.md)
- [ ] Lancer `start-all.bat`
- [ ] Tester la connexion
- [ ] Vérifier que les 20 motos s'affichent
- [ ] Imprimer [AIDE-MEMOIRE-DEMO.md](AIDE-MEMOIRE-DEMO.md)

**5 minutes avant:**
- [ ] Rafraîchir le navigateur
- [ ] Avoir l'aide-mémoire à portée
- [ ] Respirer et sourire 😊

---

## 📞 Support

### En Cas de Problème

1. **Consultez la doc appropriée** (voir tableaux ci-dessus)
2. **Vérifiez les logs** (fenêtres de commande)
3. **Réinitialisez si besoin** (`reset-database.bat`)

### Après la Démonstration

- Partager les accès si demandé
- Envoyer récapitulatif par email
- Noter les feedbacks
- Planifier un suivi

---

## 🎯 Objectifs de la Démonstration

✅ Montrer la flotte de motos (20 modèles)
✅ Démontrer la gestion des événements
✅ Créer une réservation en direct
✅ Souligner l'UX moderne
✅ Prouver que c'est prêt pour la production

---

## 🚀 Prêt à Démarrer ?

1. **Première fois ?** → [PRET-POUR-DEMO.md](PRET-POUR-DEMO.md)
2. **Démo rapide ?** → [AIDE-MEMOIRE-DEMO.md](AIDE-MEMOIRE-DEMO.md)
3. **Présentation ?** → [SLIDES-DEMO.md](SLIDES-DEMO.md)
4. **Problème ?** → Section Troubleshooting ci-dessus

---

**BONNE DÉMONSTRATION ! 🎬🏍️**

*Dernière mise à jour: 2026-01-13*
