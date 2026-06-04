# Personal Finance Tracker — Frontend

> Application web de gestion des finances personnelles — Master 1 Informatique, S2 Programmation Web 2025–2026
>
> **Amina YOUS · Nadine MASROUR**

---

## Liens

| | URL |
|---|---|
| Frontend (ce dépôt) | https://github.com/nadine2407/Personal-Finance-Tracker-Front |
| Backend | https://github.com/nadine2407/Personal-Finance-Tracker-Back |
| Application | http://localhost:4200 |

---

## Présentation

Finance Tracker permet à un utilisateur de piloter l'ensemble de sa vie financière depuis une interface unique.

**Fonctionnalités :**
- Gestion de comptes bancaires (courant et épargne)
- Suivi des transactions (revenus, dépenses, virements) avec récurrence mensuelle automatique
- Catégorisation personnalisée (revenu / dépense / les deux)
- Budgets mensuels par catégorie avec alertes visuelles (normal / alerte / dépassé / non planifié)
- Objectifs d'épargne avec allocation, priorisation et débit vers compte courant
- Tableau de bord analytique (statistiques mensuelles, graphique annuel, transactions récentes)
- Transactions masquables sans suppression, notes par transaction
- Interface en français, sécurisée par jeton d'authentification

---

## Lancer le projet

### Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| npm | 9+ |

### Démarrage

```bash
git clone https://github.com/nadine2407/Personal-Finance-Tracker-Front.git
cd Personal-Finance-Tracker-Front
npm install
ng serve
```

- Application disponible sur **http://localhost:4200**

> **Prérequis :** Le backend doit être lancé sur `http://localhost:8080` avant de démarrer le frontend.  
> Voir : https://github.com/nadine2407/Personal-Finance-Tracker-Back

### Compte de démonstration

| Courriel | Mot de passe |
|---|---|
| `demo@gmail.app` | `demo123` |

---

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Angular — composants autonomes, signaux, chargement différé | 21.2.0 |
| Langage | TypeScript | 5.9.2 |
| Interface graphique | Bootstrap + Bootstrap Icons | 5.3.3 |
| Graphiques | Chart.js + ng2-charts | 4.5.1 |
| Traduction | @ngx-translate/core | 17.0.0 |
| Alertes | SweetAlert2 | 11.26.25 |

---

## Architecture frontend

```
src/app/
├── core/
│   ├── guards/         auth.guard — protection des routes
│   ├── interceptors/   auth.interceptor (token) · error.interceptor (erreurs HTTP)
│   └── services/       auth.service · notification.service
├── features/
│   ├── auth/           Connexion · Inscription
│   ├── dashboard/      Tableau de bord
│   ├── transactions/   Gestion des transactions
│   ├── categories/     Gestion des catégories
│   ├── accounts/       Gestion des comptes
│   ├── budgets/        Gestion des budgets
│   ├── goals/          Objectifs d'épargne
│   └── settings/       Profil · Mot de passe
├── shared/
│   ├── components/     stat-card · page-header · empty-state
│   └── pipes/          currency-format
├── layout/
│   └── shell/          Sidebar + routeur principal
└── data/               Interfaces TypeScript (modèles)
```

**Patterns utilisés :**
- Stores à base de signaux Angular (sans NgRx)
- Composants standalone avec lazy loading par feature
- Intercepteurs HTTP fonctionnels
- Reactive Forms avec validation dynamique

---

## Pages de l'application

| Page | Route | Description |
|---|---|---|
| Tableau de bord | `/dashboard` | Vue synthétique du mois, graphiques |
| Transactions | `/transactions` | Liste, filtres, création, récurrence |
| Catégories | `/categories` | Gestion des catégories personnalisées |
| Comptes | `/accounts` | Comptes bancaires et historique |
| Budgets | `/budgets` | Budgets mensuels par catégorie |
| Objectifs | `/goals` | Objectifs d'épargne par compte |
| Paramètres | `/settings` | Profil et mot de passe |

---

*Projet réalisé par **Amina YOUS** & **Nadine MASROUR** — Master 1 Informatique 2025–2026*
