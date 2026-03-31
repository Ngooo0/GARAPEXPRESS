import { create } from 'zustand';
import api, { getStoredUser, getToken, setStoredUser } from '../services/api';
import { decodeJwtPayload, normalizeRole } from '../utils/auth';

// Types pour les données du backend
export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: string; // Accepte 'client' | 'livreur' | 'pharmacie' | 'admin'
  address?: string;
}

export interface Pharmacy {
  id: number;
  raisonSociale: string;
  adresse: string;
  numeroAgrement: string;
  estDeGarde: boolean;
  horaires: string;
  latitude: number;
  longitude: number;
  telephone?: string;
  email?: string;
  rating?: number;
  distance?: string;
  deliveryTime?: string;
}

export interface Medicine {
  id: number;
  nom: string;
  DCI: string;
  categorie: string;
  surOrdonnance: boolean;
  stock: number;
  image?: string;
}

export interface MedicineWithPrice extends Medicine {
  catalogueId: number;
  pharmacieId: number;
  pharmacieName: string;
  prix: number;
  disponibilite: boolean;
  dateMAJ?: string;
}

export interface CartItem {
  medicine: MedicineWithPrice;
  quantity: number;
}

export interface Order {
  id: number;
  dateCommande: string;
  statut: string;
  montantTotal: number;
  adresseLivraison: string;
  clientId: number;
  pharmacieId: number;
  pharmacie?: Pharmacy;
  livraison?: Delivery;
  paiement?: Payment;
  ordonnance?: {
    id: number;
    fichier: string;
    statut: string;
    dateEmission: string;
  };
}

export interface Delivery {
  id: number;
  heureDepart: string;
  heureArrivee: string;
  statut: string;
  adresse: string;
  commandeId: number;
  livreurId: number;
  livreur?: {
    id: number;
    nom: string;
    prenom?: string;
    telephone: string;
  };
  commande?: Order;
}

export interface Payment {
  id: number;
  montant: number;
  modePaiement: string;
  statut: string;
  dateTransaction: string;
}

export interface AppNotification {
  id: number;
  message: string;
  type: string;
  dateEnvoi: string;
  lu: boolean;
  utilisateurId?: number;
}

// Error state interface
export interface ErrorState {
  pharmacy?: string | null;
  medicine?: string | null;
  order?: string | null;
  notification?: string | null;
  delivery?: string | null;
  stats?: string | null;
}

// Store principal
interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // Data
  pharmacies: Pharmacy[];
  medicines: MedicineWithPrice[];
  orders: Order[];
  notifications: AppNotification[];
  deliveries: any[];
  
  // Loading states
  loadingStates: {
    pharmacy: boolean;
    medicine: boolean;
    order: boolean;
    notification: boolean;
    delivery: boolean;
    stats: boolean;
  };
  
  // Error states
  errors: ErrorState;
  
  // Cart
  cartItems: CartItem[];
  selectedPharmacy: Pharmacy | null;
  
  // Actions
  setRole: (role: string) => void;
  setAuthenticated: (value: boolean) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string, preferredRole?: 'client' | 'livreur' | 'admin' | 'pharmacy') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  
  // Data fetching
  fetchPharmacies: () => Promise<void>;
  fetchMedicines: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchDeliveries: (livreurId?: number) => Promise<void>;
  
  // Cart
  addToCart: (medicine: MedicineWithPrice) => void;
  removeFromCart: (medicineId: number) => void;
  updateQuantity: (medicineId: number, quantity: number) => void;
  clearCart: () => void;
  setSelectedPharmacy: (pharmacy: Pharmacy | null) => void;
  cartTotal: () => number;
  cartCount: () => number;
  
  // Order
  createOrder: (adresseLivraison: string) => Promise<Order>;
  
  // Utility
  setError: (key: keyof ErrorState, error: string | null) => void;
  clearErrors: () => void;
}

const normalizeStatus = (status?: string): string => {
  switch (status) {
    case 'en_attente':
      return 'pending';
    case 'confirmee':
      return 'confirmed';
    case 'en_preparation':
      return 'preparing';
    case 'prete':
      return 'ready';
    case 'recuperee':
      return 'picked_up';
    case 'en_livraison':
      return 'delivering';
    case 'livre':
      return 'delivered';
    case 'annule':
      return 'cancelled';
    case 'assignee':
      return 'assigned';
    case 'en_cours':
      return 'delivering';
    default:
      return status || 'pending';
  }
};

const normalizeDelivery = (delivery: any): Delivery => ({
  ...delivery,
  statut: normalizeStatus(delivery?.statut),
  heureDepart: delivery?.heureDepart ?? new Date().toISOString(),
  heureArrivee: delivery?.heureArrivee ?? delivery?.heureDepart ?? new Date().toISOString(),
  livreur: delivery?.livreur
    ? {
        id: delivery.livreur.id,
        nom: delivery.livreur.utilisateur?.nom ?? delivery.livreur.nom ?? 'Livreur',
        prenom: delivery.livreur.utilisateur?.prenom ?? delivery.livreur.prenom ?? '',
        telephone: delivery.livreur.utilisateur?.telephone ?? delivery.livreur.telephone ?? '',
      }
    : undefined,
});

const normalizeOrder = (order: any): Order => ({
  ...order,
  statut: normalizeStatus(order?.statut),
  livraison: order?.livraison ? normalizeDelivery(order.livraison) : undefined,
});

const resolveAuthenticatedUser = async (baseUser: User): Promise<User> => {
  let resolvedUser = { ...baseUser };

  if (!resolvedUser.id) {
    const token = await getToken();
    const payload = token ? decodeJwtPayload(token) : null;
    const tokenId = payload?.idUtilisateur ?? payload?.idPharmacie ?? 0;

    if (tokenId) {
      resolvedUser = {
        ...resolvedUser,
        id: tokenId,
        nom: resolvedUser.nom || payload?.nom || payload?.raisonSociale || '',
        prenom: resolvedUser.prenom || payload?.prenom || '',
        telephone: resolvedUser.telephone || payload?.telephone || '',
        email: resolvedUser.email || payload?.email || '',
      };
    }
  }

  if (!resolvedUser.id && normalizeRole(resolvedUser.role) === 'pharmacy') {
    try {
      const pharmacies = await api.pharmacies.getAll();
      const matchedPharmacy = pharmacies.find((pharmacy) =>
        (resolvedUser.nom && pharmacy.raisonSociale === resolvedUser.nom) ||
        (resolvedUser.address && pharmacy.adresse === resolvedUser.address)
      );

      if (matchedPharmacy) {
        resolvedUser = {
          ...resolvedUser,
          id: matchedPharmacy.id,
          nom: resolvedUser.nom || matchedPharmacy.raisonSociale,
          address: resolvedUser.address || matchedPharmacy.adresse,
        };
      }
    } catch {
      return resolvedUser;
    }
  }

  return resolvedUser;
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  
  pharmacies: [],
  medicines: [],
  orders: [],
  notifications: [],
  deliveries: [],
  
  loadingStates: {
    pharmacy: false,
    medicine: false,
    order: false,
    notification: false,
    delivery: false,
    stats: false,
  },
  
  errors: {
    pharmacy: null,
    medicine: null,
    order: null,
    notification: null,
    delivery: null,
    stats: null,
  },
  
  cartItems: [],
  selectedPharmacy: null,
  
  // Set role
  setRole: (role: string) => {
    set({ user: { ...get().user, role } as User });
  },
  
  // Set authenticated
  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },
  
  // Initialize - check for stored auth
  initialize: async () => {
    try {
      const user = await getStoredUser();
      const token = await getToken();
      
      if (user && token) {
        const resolvedUser = await resolveAuthenticatedUser({ ...user, role: normalizeRole(user.role) });
        await setStoredUser(resolvedUser);
        set({ user: resolvedUser, isAuthenticated: true, isAuthLoading: false });
        // Fetch data after auth
        await get().fetchPharmacies();
        await get().fetchMedicines();
        await get().fetchOrders();
        await get().fetchNotifications();
      } else {
        set({ isAuthLoading: false });
      }
    } catch (error) {
      set({ isAuthLoading: false });
    }
  },
  
  // Auth actions
  login: async (email: string, password: string, preferredRole) => {
    set({ isAuthLoading: true });
    try {
      await api.auth.login(email, password, preferredRole);
      const storedUser = await getStoredUser();
      const user = await resolveAuthenticatedUser({
        id: storedUser?.id ?? 0,
        email: storedUser?.email ?? email,
        role: normalizeRole(storedUser?.role),
        nom: storedUser?.nom ?? '',
        prenom: storedUser?.prenom ?? '',
        telephone: storedUser?.telephone ?? '',
        address: storedUser?.address ?? '',
      });
      await setStoredUser(user);
      set({ 
        user, 
        isAuthenticated: true, 
        isAuthLoading: false 
      });
      // Fetch data after login
      await Promise.all([
        get().fetchPharmacies(),
        get().fetchMedicines(),
        get().fetchOrders(),
        get().fetchNotifications(),
      ]);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  
  register: async (data: any) => {
    set({ isAuthLoading: true });
    try {
      const response = await api.auth.register(data);
      const registered = response?.data ?? {};
      const user = await resolveAuthenticatedUser({ 
        id: registered.id ?? 0, 
        email: registered.email ?? data.email, 
        role: normalizeRole(data.role || 'client'), 
        nom: registered.nom ?? data.nom ?? registered.raisonSociale ?? data.raisonSociale ?? '', 
        prenom: registered.prenom ?? data.prenom ?? '', 
        telephone: registered.telephone ?? data.telephone ?? '',
        address: registered.adresse ?? data.adresse ?? '',
      });
      await setStoredUser(user);
      set({ 
        user, 
        isAuthenticated: true, 
        isAuthLoading: false 
      });
      await Promise.all([
        get().fetchPharmacies(),
        get().fetchMedicines(),
      ]);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await api.auth.logout();
    set({
      user: null,
      isAuthenticated: false,
      pharmacies: [],
      medicines: [],
      orders: [],
      notifications: [],
      deliveries: [],
      cartItems: [],
      selectedPharmacy: null,
      errors: { pharmacy: null, medicine: null, order: null, notification: null, delivery: null, stats: null },
    });
  },
  
  // Utility functions
  setError: (key: keyof ErrorState, error: string | null) => {
    set({ errors: { ...get().errors, [key]: error } });
  },
  
  clearErrors: () => {
    set({ 
      errors: { 
        pharmacy: null, 
        medicine: null, 
        order: null, 
        notification: null, 
        delivery: null, 
        stats: null 
      } 
    });
  },
  
  // Data fetching
  fetchPharmacies: async () => {
    set({ loadingStates: { ...get().loadingStates, pharmacy: true } });
    try {
      const data = await api.pharmacies.getAll();
      set({ 
        pharmacies: data || [],
        errors: { ...get().errors, pharmacy: null }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des pharmacies';
      set({ errors: { ...get().errors, pharmacy: errorMsg } });
    } finally {
      set({ loadingStates: { ...get().loadingStates, pharmacy: false } });
    }
  },
  
  fetchMedicines: async () => {
    set({ loadingStates: { ...get().loadingStates, medicine: true } });
    try {
      const medicinesWithPrice: MedicineWithPrice[] = [];
      let pharmacies = get().pharmacies;
      
      if (pharmacies.length === 0) {
        pharmacies = await api.pharmacies.getAll();
        set({ pharmacies });
      }
      
      for (const pharmacy of pharmacies) {
        try {
          const catalogue = await api.pharmacies.getCatalogue(pharmacy.id);
          if (catalogue && Array.isArray(catalogue)) {
            for (const item of catalogue) {
              if (item.medicament) {
                medicinesWithPrice.push({
                  ...item.medicament,
                  catalogueId: item.id,
                  pharmacieId: item.pharmacieId ?? pharmacy.id,
                  pharmacieName: pharmacy.raisonSociale,
                  prix: item.prix,
                  disponibilite: item.disponibilite,
                  stock: item.quantiteStock ?? item.medicament.stock ?? 0,
                  dateMAJ: item.dateMAJ,
                });
              }
            }
          }
        } catch (e) {
          void e;
        }
      }
      
      set({ 
        medicines: medicinesWithPrice,
        errors: { ...get().errors, medicine: null }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des médicaments';
      set({ errors: { ...get().errors, medicine: errorMsg } });
    } finally {
      set({ loadingStates: { ...get().loadingStates, medicine: false } });
    }
  },
  
  fetchOrders: async () => {
    set({ loadingStates: { ...get().loadingStates, order: true } });
    try {
      const { user } = get();
      let data;

      if (user?.role === 'client') {
        data = user.id ? await api.commandes.getByClient(user.id) : [];
      } else if (user?.role === 'pharmacy') {
        data = user.id ? await api.commandes.getByPharmacie(user.id) : [];
      } else {
        data = await api.commandes.getAll();
      }

      set({ 
        orders: (data || [])
          .map(normalizeOrder)
          .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime()),
        errors: { ...get().errors, order: null }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des commandes';
      set({ errors: { ...get().errors, order: errorMsg } });
    } finally {
      set({ loadingStates: { ...get().loadingStates, order: false } });
    }
  },
  
  fetchNotifications: async () => {
    set({ loadingStates: { ...get().loadingStates, notification: true } });
    try {
      const { user } = get();
      const data = await api.notifications.getAll(user?.role === 'pharmacy' ? undefined : user?.id);
      set({ 
        notifications: (data || []).filter((notification) =>
          user?.role === 'admin' || user?.role === 'pharmacy'
            ? true
            : !notification.utilisateurId || notification.utilisateurId === user?.id
        ),
        errors: { ...get().errors, notification: null }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des notifications';
      set({ errors: { ...get().errors, notification: errorMsg } });
    } finally {
      set({ loadingStates: { ...get().loadingStates, notification: false } });
    }
  },
  
  fetchDeliveries: async (livreurId?: number) => {
    set({ loadingStates: { ...get().loadingStates, delivery: true } });
    try {
      const data = livreurId 
        ? await api.livraisons.getByLivreur(livreurId)
        : await api.livraisons.getAll();
      set({ 
        deliveries: (data || [])
          .map(normalizeDelivery)
          .sort((a, b) => new Date(b.heureDepart).getTime() - new Date(a.heureDepart).getTime()),
        errors: { ...get().errors, delivery: null }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des livraisons';
      set({ errors: { ...get().errors, delivery: errorMsg } });
    } finally {
      set({ loadingStates: { ...get().loadingStates, delivery: false } });
    }
  },
  
  // Cart actions
  addToCart: (medicine: any) => {
    // Ensure we have the required fields for MedicineWithPrice
    let medicineWithPrice: MedicineWithPrice;
    
    if ('prix' in medicine && 'pharmacieId' in medicine) {
      // Already has price and pharmacy - cast directly
      medicineWithPrice = medicine as MedicineWithPrice;
    } else {
      // Convert from basic medicine
      medicineWithPrice = {
        id: medicine.id,
        nom: medicine.nom || '',
        DCI: medicine.DCI || '',
        categorie: medicine.categorie || '',
        surOrdonnance: medicine.surOrdonnance ?? false,
        stock: medicine.stock,
        image: medicine.image,
        catalogueId: medicine.catalogueId ?? 0,
        pharmacieId: medicine.pharmacieId ?? 0,
        pharmacieName: medicine.pharmacieName ?? '',
        prix: medicine.prix ?? 0,
        disponibilite: true,
      };
    }
    const existing = get().cartItems.find(
      (i) => i.medicine.id === medicineWithPrice.id && i.medicine.pharmacieId === medicineWithPrice.pharmacieId
    );
    
    if (existing) {
      set({
        cartItems: get().cartItems.map((i) =>
          i.medicine.id === medicineWithPrice.id && i.medicine.pharmacieId === medicineWithPrice.pharmacieId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({ cartItems: [...get().cartItems, { medicine: medicineWithPrice, quantity: 1 }] });
    }
    
    // Set selected pharmacy if not set
    if (!get().selectedPharmacy) {
      const pharmacy = get().pharmacies.find(p => p.id === medicineWithPrice.pharmacieId);
      if (pharmacy) {
        set({ selectedPharmacy: pharmacy });
      }
    }
  },
  
  removeFromCart: (medicineId: number) => {
    set({
      cartItems: get().cartItems.filter((i) => i.medicine.id !== medicineId),
    });
  },
  
  updateQuantity: (medicineId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(medicineId);
      return;
    }
    
    set({
      cartItems: get().cartItems.map((i) =>
        i.medicine.id === medicineId ? { ...i, quantity } : i
      ),
    });
  },
  
  clearCart: () => {
    set({ cartItems: [], selectedPharmacy: null });
  },
  
  setSelectedPharmacy: (pharmacy: Pharmacy | null) => {
    set({ selectedPharmacy: pharmacy });
  },
  
  cartTotal: () => {
    return get().cartItems.reduce(
      (sum, i) => sum + i.medicine.prix * i.quantity,
      0
    );
  },
  
  cartCount: () => {
    return get().cartItems.reduce((sum, i) => sum + i.quantity, 0);
  },
  
  // Create order
  createOrder: async (adresseLivraison: string) => {
    const { selectedPharmacy, cartItems, user } = get();
    
    if (!selectedPharmacy) {
      throw new Error('Aucune pharmacie sélectionnée');
    }
    
    if (cartItems.length === 0) {
      throw new Error('Le panier est vide');
    }

    if (!user?.id) {
      throw new Error('Utilisateur non connecté');
    }
    
    set({ loadingStates: { ...get().loadingStates, order: true } });
    try {
      const order = await api.commandes.create({
        dateCommande: new Date().toISOString(),
        statut: 'pending',
        montantTotal: cartItems.reduce((sum, item) => sum + item.medicine.prix * item.quantity, 0),
        adresseLivraison,
        pharmacieId: selectedPharmacy.id,
        clientId: user.id,
      });
      
      // Clear cart after successful order
      set({ cartItems: [], selectedPharmacy: null });
      
      // Refresh orders
      await get().fetchOrders();
      
      set({ errors: { ...get().errors, order: null } });
      return order;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de la création de la commande';
      set({ errors: { ...get().errors, order: errorMsg } });
      throw error;
    } finally {
      set({ loadingStates: { ...get().loadingStates, order: false } });
    }
  },
}));
