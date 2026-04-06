# Frontend - Système de Gestion de Clinique Médicale

Application Angular 18 avec Tailwind CSS

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

L'application sera accessible sur **http://localhost:4200**

## Structure du projet

```
src/app/
├── core/                    # Services, guards, interceptors, models
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   └── jwt.interceptor.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── patient.model.ts
│   │   ├── medecin.model.ts
│   │   ├── rendez-vous.model.ts
│   │   └── dashboard.model.ts
│   └── services/
│       ├── auth.service.ts
│       ├── patient.service.ts
│       ├── medecin.service.ts
│       ├── rendez-vous.service.ts
│       └── dashboard.service.ts
├── features/                # Composants par fonctionnalité
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── patients/
│   │   ├── patient-list/
│   │   └── patient-form/
│   ├── medecins/
│   │   └── medecin-list/
│   └── rendez-vous/
│       └── rendez-vous-list/
├── shared/                  # Composants partagés
│   └── components/
│       └── layout/
├── app.config.ts           # Configuration de l'application
├── app.routes.ts           # Configuration des routes
└── app.ts                  # Composant racine
```

## Fonctionnalités

### Authentification
- ✅ Connexion avec JWT
- ✅ Inscription
- ✅ Protection des routes (AuthGuard)
- ✅ Intercepteur JWT automatique

### Dashboard
- ✅ Statistiques en temps réel
- ✅ Graphiques (rendez-vous par statut)
- ✅ Actions rapides

### Patients
- ✅ Liste paginée
- ✅ Recherche avec debounce
- ✅ Création / Modification / Suppression
- ✅ Formulaire modal avec validation

### Médecins
- ✅ Liste avec cartes
- ✅ Recherche par spécialité
- ✅ Affichage disponibilité

### Rendez-vous
- ✅ Liste avec détails patient/médecin
- ✅ Filtrage par statut
- ✅ Affichage coloré par statut

## Technologies

- **Angular 18** : Framework frontend
- **Tailwind CSS** : Styling utility-first
- **RxJS** : Programmation réactive
- **TypeScript** : Typage statique
- **Standalone Components** : Architecture moderne Angular

## Configuration

### API Backend

L'URL de l'API est configurée dans chaque service :
```typescript
private readonly API_URL = 'http://localhost:3000/api/...';
```

Pour changer l'URL, modifiez-la dans :
- `auth.service.ts`
- `patient.service.ts`
- `medecin.service.ts`
- `rendez-vous.service.ts`
- `dashboard.service.ts`

### Tailwind CSS

Configuration dans `tailwind.config.js` :
- Couleurs personnalisées (primary, secondary)
- Classes utilitaires globales dans `styles.css`

## Commandes utiles

```bash
# Démarrer en mode développement
npm start

# Build pour production
npm run build

# Lancer les tests
npm test

# Vérifier le code
ng lint
```

## Connexion par défaut

Après avoir créé un compte via `/register`, utilisez vos identifiants pour vous connecter.

## Notes importantes

- Le token JWT est stocké dans `localStorage`
- L'intercepteur ajoute automatiquement le token à toutes les requêtes
- Le guard `authGuard` protège les routes privées
- La recherche utilise `debounceTime(300ms)` pour optimiser les performances

## Prochaines améliorations possibles

- [ ] Formulaires pour médecins et rendez-vous
- [ ] Graphiques Chart.js dans le dashboard
- [ ] Notifications toast
- [ ] Export PDF/Excel
- [ ] Filtres avancés
- [ ] Mode sombre
- [ ] Internationalisation (i18n)
