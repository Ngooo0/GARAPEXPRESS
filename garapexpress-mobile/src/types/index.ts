export type Role = 'client' | 'rider' | 'pharmacy' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  price: number;
  image: string;
  stock: number;
  requiresPrescription: boolean;
  category: string;
  pharmacyName: string;
  description: string;
  dosage: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  openNow: boolean;
  image: string;
  phone: string;
  deliveryTime: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  pharmacy: Pharmacy;
  createdAt: string;
  estimatedTime: string;
  deliveryAddress: string;
  riderName?: string;
  riderPhone?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  completedDeliveries: number;
  earnings: number;
  isOnline: boolean;
  avatar: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'promo' | 'alert' | 'system';
}

// Types pour l'API backend
export interface ApiUser {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: 'client' | 'livreur' | 'pharmacie' | 'admin';
}

export interface ApiPharmacie {
  id: number;
  raisonSociale: string;
  adresse: string;
  numeroAgrement: string;
  estDeGarde: boolean;
  horaires: string;
  latitude: number;
  longitude: number;
}

export interface ApiMedicament {
  id: number;
  nom: string;
  DCI: string;
  categorie: string;
  surOrdonnance: boolean;
  stock: number;
  prix: number;
}

export interface ApiCommande {
  id: number;
  dateCommande: string;
  statut: string;
  montantTotal: number;
  adresseLivraison: string;
  clientId: number;
  pharmacieId: number;
}

export interface ApiLivraison {
  id: number;
  heureDepart: string;
  heureArrivee: string;
  statut: string;
  adresse: string;
  commandeId: number;
  livreurId: number;
}

export interface ApiNotification {
  id: number;
  message: string;
  type: string;
  dateEnvoi: string;
  lu: boolean;
  utilisateurId: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  address?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  category: string;
  expiryDate: string;
}
