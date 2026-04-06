# Configuration des Environnements

## Structure

```
src/environments/
├── environment.ts       # Développement (par défaut)
└── environment.prod.ts  # Production
```

## Fichiers d'environnement

### environment.ts (Développement)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### environment.prod.ts (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-api-production.com/api'
};
```

## Utilisation dans le code

```typescript
import { environment } from '../../../environments/environment';

// Utiliser l'URL de l'API
const apiUrl = environment.apiUrl;
```

## Build

### Développement
```bash
npm start
# ou
ng serve
```
Utilise automatiquement `environment.ts`

### Production
```bash
npm run build
# ou
ng build --configuration production
```
Utilise automatiquement `environment.prod.ts`

## Configuration pour la production

Avant de déployer en production, modifiez `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.votre-domaine.com/api'  // ⚠️ À MODIFIER
};
```

## Avantages par rapport à .env

1. ✅ **Type-safety**: TypeScript vérifie les types
2. ✅ **Compilation**: Valeurs remplacées au build time
3. ✅ **Tree-shaking**: Meilleure optimisation
4. ✅ **Pas de dépendances**: Méthode native Angular
5. ✅ **Sécurité**: Pas de variables exposées

## Variables disponibles

Actuellement configurées:
- `production`: boolean - Mode production ou développement
- `apiUrl`: string - URL de base de l'API backend

## Ajouter de nouvelles variables

1. Modifier `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'CliniquePro',
  version: '1.0.0'
};
```

2. Modifier `environment.prod.ts` de la même façon

3. Utiliser dans le code:
```typescript
import { environment } from '../environments/environment';
console.log(environment.appName); // 'CliniquePro'
```

## Notes importantes

- ⚠️ Ne jamais commiter de secrets/tokens dans ces fichiers
- ⚠️ Les valeurs sont visibles dans le bundle final
- ⚠️ Pour les secrets, utiliser des variables d'environnement côté serveur
- ✅ Ces fichiers sont parfaits pour les URLs, noms d'app, versions, etc.
