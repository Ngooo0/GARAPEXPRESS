# 📱 Refactorisation Garap Express - Guide Complet

## 🎯 Objectif Atteint
L'application est en cours de **transition totale des données fictives vers une connexion réelle au backend**. 

---

## ✅ Ce Qui a Été Fait

### 1. **Infrastructure Core Refactorisée**

#### `src/store/appStore.ts` 
- ✅ États de chargement granulaires pour chaque ressource
- ✅ États d'erreur détaillés (`errors.pharmacy`, `errors.medicine`, etc.)
- ✅ Méthodes `setError()` et `clearErrors()`
- ✅ Nouvelle méthode `fetchDeliveries()` pour les livreurs
- ✅ Gestion async avec `Promise.all()` pour requêtes parallèles
- ✅ Validation des données et gestion robuste des erreurs

**Utilisation:**
```typescript
import { useAppStore } from '../src/store/appStore';

const { 
  pharmacies,           // Les vraies données du backend
  medicines,            // Vraies medicines avec prix
  orders,               // Vraies commandes
  loadingStates: {      // États de chargement
    pharmacy,
    medicine,
    order,
    notification,
    delivery
  },
  errors: {             // Messages d'erreur
    pharmacy,
    medicine,
    // ...
  },
  fetchPharmacies,      // Fetch automatique
  fetchOrders,
  // ... autres méthodes
} = useAppStore();
```

### 2. **Utilitaires Créés**

#### `src/utils/formatters.ts`
Remplace les mocks et offre des fonctions pures:
- `formatPrice(price)` - Format XOF
- `formatDate(date)` - Format "25 mars 2026 14:30"
- `formatTime(time)` - Format "14:30"
- `orderStatusLabel` - Labels pour les statuts
- `getOrderStatusColor(status)` - Couleurs des statuts

**Utilisation:**
```typescript
import { formatPrice, formatDate, orderStatusLabel } from '../src/utils/formatters';

console.log(formatPrice(1500)); // "1 500 XOF"
console.log(orderStatusLabel['pending']); // "En attente"
```

### 3. **Hook Personnalisé**

#### `src/hooks/useDataLoading.ts`
Automatise le chargement des données au focus de la page:

```typescript
import { useDataLoading } from '../src/hooks/useDataLoading';

export default function MyPage() {
  const { data, isLoading, error } = useDataLoading('medicines');
  
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      {data.map(/*...*/)}
    </>
  );
}
```

### 4. **Pages Corrigées**

| Page | Status | Description |
|------|--------|-------------|
| `app/notifications.tsx` | ✅ | Affiche vraies notifications du backend |
| `app/(tabs)/index.tsx` | ✅ | Accueil avec données réelles, nom utilisateur dynamique |
| Imports cleanés | ✅ | 8 fichiers avec imports `src/utils/formatters` |

---

## 🚀 Comment Continuer

### Pattern à Suivre pour Chaque Page

#### Exemple: Corriger `app/(admin)/orders.tsx`

**Avant (avec mocks):**
```typescript
import { mockAdminOrders } from '../../src/data/adminMockData';
import { formatPrice } from '../../src/data/mockData';

// Affiche mockAdminOrders directement
```

**Après (avec données réelles):**
```typescript
import { useAppStore } from '../../src/store/appStore';
import { formatPrice, orderStatusLabel } from '../../src/utils/formatters';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function OrdersScreen() {
  const { orders, loadingStates, errors, fetchOrders } = useAppStore();
  
  // Charger les données au focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );
  
  if (loadingStates.order) return <ActivityIndicator />;
  if (errors.order) return <Text>{errors.order}</Text>;
  
  // Afficher les vraies commandes
  return (
    <View>
      {orders.map(order => (
        <View key={order.id}>
          <Text>{order.id}</Text>
          <Text>{orderStatusLabel[order.statut]}</Text>
          <Text>{formatPrice(order.montantTotal)}</Text>
        </View>
      ))}
    </View>
  );
}
```

### Checklist par Module

#### 📦 Pharmacy Module
- [ ] Remplacer mocks par `appStore.orders` filtrés pour la pharmacie
- [ ] Charger le catalogue avec `api.pharmacies.getCatalogue(pharmacieId)`
- [ ] Afficher commandes en attente/préparation

#### 👤 Rider Module  
- [ ] Charger livraisons avec `fetchDeliveries(livreurId)`
- [ ] Calculer gains: `livraison.statut === 'delivered'`
- [ ] Mettre à jour statut: `api.livraisons.update(id, { statut: 'delivered' })`

#### 📊 Admin Module
- [ ] Charger stats: `api.stats.getDashboard()`
- [ ] Afficher utilisateurs: `api.utilisateurs.getAll()`
- [ ] Afficher pharmacies: `appStore.pharmacies`

#### 🛒 Tabs/Client Module
- [ ] Recherche: `api.medicaments.search(query)`
- [ ] Cart → Checkout: `useAppStore.createOrder(address)`
- [ ] Mes commandes: `appStore.orders` du user

---

## 🔌 Endpoints Backend Disponibles

### Authentication
```
POST /api/utilisateurs/login
POST /api/utilisateurs/register/client
POST /api/utilisateurs/register/livreur
POST /api/utilisateurs/register/admin
```

### Data Fetching
```
GET /api/pharmacies                    # Toutes les pharmacies
GET /api/medicaments                   # Tous les médicaments
GET /api/commandes                     # Toutes les commandes
GET /api/livraisons                    # Toutes les livraisons
GET /api/livraisons/livreur/:id        # Livraisons d'un livreur
GET /api/notifications                 # Notifications utilisateur
GET /api/catalogues/pharmacie/:id      # Catalogue pharmacie
GET /api/stats                         # Statistiques admin
```

---

## ⚠️ Important: Points à Ne PAS Oublier

1. **AUCUNE donnée fictive** - Si vous écrivez du mock anywhere, vous créez de la dette technique
2. **Toujours charger au focus** - Utilisez `useFocusEffect` avec `fetchXXX()`
3. **Gestion d'erreurs** - Vérifiez `errors.pharmacy` et `errors.order` partout
4. **Loading states** - Jamais afficher de données sans `isLoading` check

### Anti-patterns ❌

```typescript
// ❌ PAS BON
const mockOrders = [{ id: 1, ... }];

// ❌ PAS BON
if (isLoading) return null;  // Affiche rien!

// ❌ PAS BON
fetchOrders(); // Appelé à chaque render = boucle infinie

// ✅ BON
useFocusEffect(useCallback(() => {
  fetchOrders();
}, [fetchOrders]));
```

---

## 🧹 Cleanup à Faire Après

Une fois toutes les pages corrigées:

```bash
# Supprimer les mocks (mais garder backup)
rm src/data/mockData.ts
rm src/data/adminMockData.ts

# Vérifier imports
grep -r "mockData\|mockAdmin" app/
```

---

## 📝 Template pour Nouvelles Pages

Utilisez ce template pour créer nouvelles pages:

```typescript
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useAppStore } from '../../src/store/appStore';
import { colors, spacing } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';

export default function MyScreen() {
  const { orders, loadingStates, errors, fetchOrders } = useAppStore();
  
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const isLoading = loadingStates.order;
  const hasError = !!errors.order;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : hasError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.error }}>{errors.order}</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Aucune commande</Text>
        </View>
      ) : (
        <ScrollView>
          {orders.map(order => (
            <View key={order.id} style={{ padding: spacing.md }}>
              <Text>{order.id}</Text>
              <Text>{formatPrice(order.montantTotal)}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
```

---

## 🆘 Troubleshooting

### "Data doesn't load"
→ Vérifiez `useFocusEffect` est appelé  
→ Vérifiez API endpoint existe et fonctionne  
→ Vérifiez `isLoading` = false après requête

### "TypeError: Cannot read property 'map' of undefined"
→ Vérifiez `medicines` est initialisé à `[]` pas `null`  
→ Vérifiez `medicines?.length > 0` avant map

### "Infinite loading"
→ `fetchOrders()` appelé sans dépendances → boucle  
→ Utilisez `useFocusEffect` au lieu de `useEffect`

---

## 📊 Architecture Finale (Target)

```
appStore (Source of Truth)
├── Toutes les données (pharmacies, medicines, orders)
├── Loading/Error states
└── Fetch methods

Pages (Consumers)
├── Charger data au focus
├── Afficher loading/error
└── Afficher des vraies données
```

---

**Bonne chance pour la finalisation! Vous êtes maintenant 50% du chemin.** 🚀
