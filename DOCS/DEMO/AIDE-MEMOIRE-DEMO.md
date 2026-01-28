# 🎯 Aide-Mémoire Démonstration - YAMAHA DRT

## ⚡ Accès Rapide

```
🔐 CONNEXION BACKOFFICE
URL: http://localhost:5175
Email: heloise@yamaha.fr
Mot de passe: admin123
```

---

## 📋 Checklist 2 Minutes Avant

- [ ] Services démarrés (`start-all.bat`)
- [ ] Connexion testée
- [ ] Page de motos charge correctement

---

## 🎬 Plan de Démonstration (15 min)

### 1️⃣ Dashboard (2 min)
- Vue d'ensemble
- Statistiques clés

### 2️⃣ Flotte de Motos (4 min)
- Liste des 20 motos
- Ouvrir fiche MT-09
- **💡 Point fort :** Photos + toute la gamme

### 3️⃣ Événements (4 min)
- 2 événements disponibles
- Ouvrir "Paris Nord"
- Voir les sessions (12)
- **Créer une réservation en direct**

### 4️⃣ Réservations (3 min)
- Vue globale
- Modifier un statut

### 5️⃣ Utilisateurs (2 min)
- Rôles: Admin, Instructeur, Dealer, Client

---

## 💡 Points Forts à Mentionner

✅ **20 motos** avec photos (toute la gamme 2026)
✅ **3 permis** gérés (A, A2, A1)
✅ **Multi-sites** (événements concessionnaires + salons)
✅ **Temps réel** (WebSocket pour tablettes)
✅ **Sécurisé** (JWT, rôles)
✅ **Responsive** (PC, tablette, mobile)

---

## 🎯 Données de Démo

| Élément | Quantité |
|---------|----------|
| Motos | 20 |
| Événements | 2 |
| Sessions | 12 |
| Concessionnaires | 2 |
| Instructeurs | 2 |

---

## 🏍️ Motos Phares à Montrer

- **YZF-R1** (Sport, Permis A)
- **MT-09** (Roadster, Permis A)
- **Ténéré 700** (Trail, Permis A)
- **MT-07** (Permis A2)
- **TMAX 560** (Scooter Y-AMT)

---

## 🎭 Scénario "Quick Win"

**"Client veut essayer une MT-09"**

1. Événements → Paris Nord
2. Sélectionner une session
3. Nouvelle réservation
4. Choisir client (ou créer)
5. Sélectionner MT-09
6. ✅ Confirmer

**Temps: 2 minutes**

---

## ❓ Questions Probables

**"Combien de motos ?"**
→ Illimité, 20 en démo

**"Export données ?"**
→ Oui, CSV/Excel

**"Notifications ?"**
→ Email (SMS possible via Twilio)

**"Hors ligne ?"**
→ Tablette peut marquer présences offline

**"Sécurité ?"**
→ JWT, RBAC, validation données

---

## 🔗 URLs à Partager

**Local:**
- Backoffice: http://localhost:5175
- Web: http://localhost:5173
- API: http://localhost:3001

**Production (si Cloudflare OK):**
- Backoffice: https://demo-service2.barberet.fr
- Web: https://demo-service3.barberet.fr
- API: https://demo-service4.barberet.fr

---

## 🚨 Troubleshooting Express

**Page ne charge pas ?**
→ Vérifier que services sont démarrés

**403 sur Cloudflare ?**
→ Utiliser URLs localhost

**Erreur connexion ?**
→ `heloise@yamaha.fr` / `admin123`

---

## 🎬 Phrase de Conclusion

> "Yamaha DRT digitalise la gestion des essais moto avec une solution complète, moderne et scalable. Prête pour la production."

---

## 📞 Contact Post-Démo

- [ ] Envoyer récap par email
- [ ] Partager accès si besoin
- [ ] Planifier suivi

---

**🚀 Bonne démo !**

Imprimez cette page ou gardez-la sur un second écran.
