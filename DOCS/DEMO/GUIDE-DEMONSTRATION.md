# 🎯 Guide de Démonstration - Yamaha Demo Ride Tour

## 📋 Checklist Avant la Démo

### Vérifications Préalables (5 minutes avant)

- [ ] **Base de données prête**
  - 20 motos avec photos ✅
  - 2 événements avec sessions ✅
  - Utilisateur admin actif ✅

- [ ] **Services démarrés**
  ```bash
  # Si démo en LOCAL uniquement
  start-all.bat

  # Si démo accessible EXTERNE (collègues)
  FIX-PRODUCTION.bat
  # + Vérifier que Cloudflare ne bloque pas (403)
  ```

- [ ] **Connexion testée**
  - Ouvrir : http://localhost:5175
  - Se connecter : `heloise@yamaha.fr` / `admin123`
  - Vérifier que la page charge correctement

---

## 🎬 Scénario de Démonstration (15-20 minutes)

### 1. Introduction (2 minutes)

**Contexte à présenter :**
> "Yamaha Demo Ride Tour est une plateforme complète pour gérer les événements d'essai moto. Elle permet de gérer les réservations, la flotte de motos, les événements, et de suivre la satisfaction client."

**Architecture :**
- 👔 **Backoffice** : Gestion pour les admins, concessionnaires et instructeurs
- 🌍 **Site Web** : Réservation en ligne pour les clients
- 📱 **Tablette** : Interface pour les instructeurs sur le terrain

---

### 2. Connexion et Dashboard (3 minutes)

#### Étape 1 : Se connecter
```
URL : http://localhost:5175
Email : heloise@yamaha.fr
Mot de passe : admin123
```

**À montrer :**
- ✅ Page de login sécurisée
- ✅ Authentification JWT
- ✅ Redirection vers le dashboard

#### Étape 2 : Dashboard (Vue d'ensemble)

**Points à souligner :**
- 📊 Statistiques en temps réel
- 📅 Événements à venir
- 🏍️ État de la flotte
- 📝 Réservations récentes

**Script suggéré :**
> "Le dashboard donne une vue d'ensemble de l'activité. On peut voir rapidement les événements à venir, l'état des réservations, et les motos disponibles."

---

### 3. Gestion de la Flotte de Motos (4 minutes)

#### Étape 1 : Accéder à la liste des motos
- Menu : **Motos** ou **Flotte**

**À montrer :**
- ✅ Liste de 20 motos Yamaha
- ✅ Photos de chaque modèle
- ✅ Informations : Modèle, Groupe, Permis requis, Statut

**Points forts :**
- 🏍️ Gamme complète : Sport (YZF-R1, R7), Roadster (MT-09, MT-10), Trail (Ténéré 700)
- 🎓 Classification par permis : A, A2, A1
- 🔄 Boîte automatique Y-AMT (TMAX, XMAX, NMAX)

#### Étape 2 : Consulter une fiche moto
- Cliquer sur une moto (ex: **MT-09**)

**À montrer :**
- Photo haute qualité
- Caractéristiques techniques
- Groupe et permis
- Numéro d'immatriculation
- Statut de disponibilité

**Script suggéré :**
> "Chaque moto a sa fiche détaillée avec photo. On peut voir immédiatement si elle est disponible, à quel groupe elle appartient, et quel permis est nécessaire."

#### Étape 3 : Modifier une moto (optionnel)
- Bouton **Modifier**
- Changer le statut : AVAILABLE → MAINTENANCE

**Points à souligner :**
- Gestion de la maintenance
- Suivi des dommages
- Historique des affectations

---

### 4. Gestion des Événements (4 minutes)

#### Étape 1 : Liste des événements
- Menu : **Événements**

**À montrer :**
- ✅ 2 événements existants
  - Demo Ride Tour - Paris Nord
  - Demo Ride Tour - Lyon Centre
- ✅ Dates, lieu, type d'événement

#### Étape 2 : Détails d'un événement
- Cliquer sur **Demo Ride Tour - Paris Nord**

**À montrer :**
- 📍 Informations : Date, lieu, adresse
- 👥 Concessionnaire associé
- ⏰ Sessions programmées (12 sessions)
- 🏍️ Flotte de motos disponibles
- 📊 Taux de remplissage des sessions

**Script suggéré :**
> "Pour chaque événement, on a toutes les informations : dates, lieu, sessions programmées. On voit en temps réel combien de places sont réservées pour chaque session."

#### Étape 3 : Créer une réservation manuellement
- Onglet **Réservations** de l'événement
- Bouton **Nouvelle réservation**

**À montrer :**
1. Sélectionner une session
2. Sélectionner un client (ou en créer un)
3. Choisir une moto adaptée au permis
4. Valider

**Points à souligner :**
- ✅ Vérification automatique du permis
- ✅ Gestion des conflits (slots pleins)
- ✅ Confirmation immédiate

---

### 5. Gestion des Réservations (3 minutes)

#### Étape 1 : Vue globale des réservations
- Menu : **Réservations**

**À montrer :**
- Liste de toutes les réservations
- Filtres : Par statut, par événement, par date
- Statuts : PENDING, CONFIRMED, COMPLETED, CANCELLED

#### Étape 2 : Consulter/Modifier une réservation
- Cliquer sur une réservation

**Actions possibles :**
- ✅ Confirmer une réservation
- ✅ Marquer comme complétée
- ✅ Annuler
- ✅ Ajouter des notes

**Script suggéré :**
> "On peut gérer le cycle de vie complet d'une réservation : de la demande initiale jusqu'à la complétion de l'essai, avec possibilité d'ajouter des notes sur le déroulement."

---

### 6. Gestion des Utilisateurs (2 minutes)

#### Menu : Utilisateurs

**À montrer :**
- 👤 **Admin** : Accès complet
- 👨‍🏫 **Instructeurs** : Gestion des sessions
- 🏢 **Dealers** : Gestion de leurs événements
- 👥 **Clients** : Historique des réservations

**Actions :**
- Créer un nouvel utilisateur
- Modifier les rôles
- Désactiver un compte

---

### 7. Points Forts à Souligner

#### 🎨 Interface Utilisateur
- ✅ Design moderne et intuitif
- ✅ Responsive (fonctionne sur mobile/tablette)
- ✅ Navigation fluide

#### 🔒 Sécurité
- ✅ Authentification JWT
- ✅ Gestion des rôles (RBAC)
- ✅ Validation des données

#### ⚡ Performance
- ✅ Temps de réponse rapide
- ✅ Mise à jour en temps réel (Socket.io)
- ✅ Pagination et filtres

#### 🔄 Intégrations
- ✅ API RESTful complète
- ✅ Base de données PostgreSQL
- ✅ Cloudflare pour l'accès externe

---

## 🎭 Scénarios d'Usage

### Scénario 1 : Nouveau Client veut essayer une moto

**Étape par étape :**
1. Client va sur le site web public
2. Parcourt les événements disponibles
3. Sélectionne "Demo Ride Tour - Paris"
4. Choisit une session avec des places disponibles
5. Crée son compte ou se connecte
6. Sélectionne la moto qu'il veut essayer (ex: MT-09)
7. Confirme sa réservation

**Côté Backoffice :**
- La réservation apparaît en statut PENDING
- L'admin/concessionnaire peut la valider
- Le client reçoit une confirmation par email

### Scénario 2 : Instructeur prépare sa journée

**Le matin de l'événement :**
1. Instructeur se connecte sur la tablette
2. Voit la liste de ses sessions du jour
3. Consulte les clients inscrits pour chaque session
4. Vérifie les motos assignées
5. Marque les présences
6. Note les incidents éventuels

### Scénario 3 : Admin analyse les performances

**Tableau de bord Analytics :**
1. Menu : **Statistiques** ou **Analytics**
2. Voit les KPI clés :
   - Nombre total de réservations
   - Taux de conversion
   - Motos les plus demandées
   - Événements les plus populaires
3. Export des données pour reporting

---

## 💡 Conseils pour la Démo

### ✅ À Faire

1. **Préparez quelques données en direct**
   - Créez 1-2 réservations pendant la démo
   - Modifiez un statut en temps réel

2. **Montrez la fluidité**
   - Navigation rapide entre les pages
   - Recherche et filtres

3. **Mettez en avant les photos**
   - Les 20 motos ont de belles photos
   - C'est visuellement impactant

4. **Soulignez la gestion multi-permis**
   - Filtre automatique des motos selon le permis du client
   - Évite les erreurs

### ❌ À Éviter

1. **Ne pas montrer les erreurs**
   - Testez votre connexion avant
   - Vérifiez que tout fonctionne

2. **Ne pas aller trop vite**
   - Laissez le temps de voir chaque écran
   - Commentez ce que vous faites

3. **Ne pas oublier de mentionner**
   - L'accès externe via Cloudflare
   - Les 3 interfaces (backoffice, web, tablette)
   - La satisfaction client

---

## 🎯 Questions Fréquentes

### Q: Combien de motos peut-on gérer ?
**R:** Illimité. La base de données est conçue pour scaler. Actuellement 20 motos en démo, mais peut aller bien au-delà.

### Q: Peut-on créer des événements récurrents ?
**R:** Oui, les événements peuvent être créés manuellement pour chaque date. Une fonction de récurrence peut être ajoutée facilement.

### Q: Les clients peuvent-ils annuler leur réservation ?
**R:** Oui, via leur espace client sur le site web. Les admins peuvent aussi annuler depuis le backoffice.

### Q: Y a-t-il des notifications ?
**R:** Oui, le système envoie des emails de confirmation et des rappels. Les SMS peuvent aussi être intégrés (Twilio).

### Q: Peut-on exporter les données ?
**R:** Oui, export CSV/Excel disponible pour les réservations, les statistiques, etc.

### Q: Ça fonctionne hors ligne ?
**R:** La tablette peut fonctionner en mode hors ligne pour marquer les présences, avec synchronisation automatique quand la connexion revient.

---

## 📊 Métriques à Mentionner

**Données actuelles dans la démo :**
- ✅ 20 motos Yamaha (toute la gamme 2026)
- ✅ 2 événements programmés
- ✅ 12 sessions créées
- ✅ Gestion de 3 types de permis (A, A2, A1)
- ✅ 2 concessionnaires
- ✅ 2 instructeurs

**Capacités du système :**
- 🚀 Gestion de plusieurs centaines d'événements
- 🚀 Des milliers de réservations
- 🚀 Mise à jour temps réel (WebSocket)
- 🚀 Scalable et performant

---

## 🔗 URLs de Démonstration

### Environnement Local
- **Backoffice** : http://localhost:5175
- **Site Web** : http://localhost:5173
- **Tablette** : http://localhost:5174
- **API** : http://localhost:3001

### Environnement Production (Cloudflare)
- **Backoffice** : https://demo-service2.barberet.fr
- **Site Web** : https://demo-service3.barberet.fr
- **Tablette** : https://demo-service1.barberet.fr
- **API** : https://demo-service4.barberet.fr

---

## 🎬 Script de Conclusion

**Pour conclure la démo :**

> "Yamaha Demo Ride Tour est une solution complète qui digitalise et optimise la gestion des événements d'essai moto. Elle permet de :
>
> ✅ Gérer efficacement la flotte de motos
> ✅ Organiser des événements multi-sites
> ✅ Faciliter les réservations en ligne
> ✅ Suivre les performances et la satisfaction
> ✅ Offrir une expérience utilisateur moderne
>
> Le système est prêt pour la production, scalable, et peut être adapté aux besoins spécifiques de Yamaha France."

---

## 📝 Checklist Post-Démo

- [ ] Répondre aux questions
- [ ] Noter les demandes de fonctionnalités
- [ ] Partager les URLs d'accès (si applicable)
- [ ] Planifier un suivi
- [ ] Envoyer un récapitulatif par email

---

**Bonne démonstration ! 🚀**
