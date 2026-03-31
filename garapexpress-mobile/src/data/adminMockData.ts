import type { User, Pharmacy, Order, Rider } from '../types';

// Types pour l'admin
export type UserStatus = 'active' | 'pending' | 'suspended';
export type ComplaintPriority = 'high' | 'medium' | 'low';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

// Extension du type User pour l'admin
export interface AdminUser extends User {
  status: UserStatus;
  createdAt: string;
}

// Extension du type Pharmacy pour l'admin
export interface AdminPharmacy extends Pharmacy {
  status: UserStatus;
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
  totalOrders: number;
}

// Extension du type Rider pour l'admin
export interface AdminRider extends Rider {
  status: UserStatus;
  createdAt: string;
  vehicleType: string;
  licenseNumber: string;
}

// Interface pour les plaintes
export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  orderId?: string;
  type: 'order' | 'rider' | 'pharmacy' | 'payment' | 'other';
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

// Données mock pour les utilisateurs clients
export const mockAdminClients: AdminUser[] = [
  {
    id: 'c1',
    name: 'Mamadou Faye',
    email: 'mamadou.faye@email.com',
    phone: '+221 77 123 45 67',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'client',
    address: 'Cité Keur Gorgui, Dakar',
    status: 'active',
    createdAt: '2025-06-15T10:00:00',
  },
  {
    id: 'c2',
    name: 'Aminata Diop',
    email: 'aminata.diop@email.com',
    phone: '+221 78 234 56 78',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'client',
    address: 'Point E, Dakar',
    status: 'active',
    createdAt: '2025-08-20T14:30:00',
  },
  {
    id: 'c3',
    name: 'Ibrahima Ndiaye',
    email: 'ibrahima.ndiaye@email.com',
    phone: '+221 76 345 67 89',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: 'client',
    address: 'Fann, Dakar',
    status: 'pending',
    createdAt: '2026-03-10T09:15:00',
  },
  {
    id: 'c4',
    name: 'Fatou Sow',
    email: 'fatou.sow@email.com',
    phone: '+221 70 456 78 90',
    avatar: 'https://i.pravatar.cc/150?img=9',
    role: 'client',
    address: 'Mermoz, Dakar',
    status: 'suspended',
    createdAt: '2025-12-01T16:45:00',
  },
];

// Données mock pour les pharmacies
export const mockAdminPharmacies: AdminPharmacy[] = [
  {
    id: 'p1',
    name: 'Pharmacie du Plateau',
    address: 'Avenue Léopold Sédar Senghor, Dakar',
    rating: 4.8,
    distance: '1.2 km',
    openNow: true,
    image: 'https://picsum.photos/200/120?grayscale&1',
    phone: '+221 33 821 45 67',
    deliveryTime: '25-35 min',
    status: 'active',
    ownerName: 'Dr. Alpha Diallo',
    ownerPhone: '+221 77 111 22 33',
    createdAt: '2025-01-10T08:00:00',
    totalOrders: 1250,
  },
  {
    id: 'p2',
    name: 'Grande Pharmacie de Dakar',
    address: 'Rue Mohamed V, Dakar Médina',
    rating: 4.6,
    distance: '2.5 km',
    openNow: true,
    image: 'https://picsum.photos/200/120?grayscale&2',
    phone: '+221 33 889 23 10',
    deliveryTime: '30-45 min',
    status: 'active',
    ownerName: 'Dr. Marie Ndiaye',
    ownerPhone: '+221 77 444 55 66',
    createdAt: '2025-02-15T10:30:00',
    totalOrders: 890,
  },
  {
    id: 'p3',
    name: 'Pharmacie Mame Diarra',
    address: 'Route de Rufisque, Pikine',
    rating: 4.4,
    distance: '3.8 km',
    openNow: false,
    image: 'https://picsum.photos/200/120?grayscale&3',
    phone: '+221 33 874 56 78',
    deliveryTime: '40-55 min',
    status: 'pending',
    ownerName: 'Dr. Ousmane Sy',
    ownerPhone: '+221 77 777 88 99',
    createdAt: '2026-03-18T14:00:00',
    totalOrders: 0,
  },
  {
    id: 'p4',
    name: 'Pharmacie les Almadies',
    address: 'Les Almadies, Dakar',
    rating: 4.9,
    distance: '5.2 km',
    openNow: true,
    image: 'https://picsum.photos/200/120?grayscale&4',
    phone: '+221 33 820 00 01',
    deliveryTime: '35-45 min',
    status: 'suspended',
    ownerName: 'Dr. Cheikh Fall',
    ownerPhone: '+221 77 999 00 11',
    createdAt: '2025-05-20T09:00:00',
    totalOrders: 450,
  },
];

// Données mock pour les riders
export const mockAdminRiders: AdminRider[] = [
  {
    id: 'r1',
    name: 'Moussa Diallo',
    phone: '+221 77 345 67 89',
    rating: 4.7,
    completedDeliveries: 342,
    earnings: 485000,
    isOnline: true,
    avatar: 'https://i.pravatar.cc/150?img=11',
    status: 'active',
    createdAt: '2025-04-10T07:00:00',
    vehicleType: 'Motocyclette',
    licenseNumber: 'DK-RIDER-001',
  },
  {
    id: 'r2',
    name: 'Souleymane Bâ',
    phone: '+221 76 456 78 90',
    rating: 4.5,
    completedDeliveries: 218,
    earnings: 312000,
    isOnline: false,
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'active',
    createdAt: '2025-06-22T08:30:00',
    vehicleType: 'Vélomoteur',
    licenseNumber: 'DK-RIDER-002',
  },
  {
    id: 'r3',
    name: 'Cheikh Tidiane Gningue',
    phone: '+221 78 567 89 01',
    rating: 4.8,
    completedDeliveries: 156,
    earnings: 245000,
    isOnline: true,
    avatar: 'https://i.pravatar.cc/150?img=13',
    status: 'pending',
    createdAt: '2026-03-15T10:00:00',
    vehicleType: 'Motocyclette',
    licenseNumber: 'DK-RIDER-003',
  },
  {
    id: 'r4',
    name: 'Papa Malick Seck',
    phone: '+221 70 678 90 12',
    rating: 4.2,
    completedDeliveries: 89,
    earnings: 125000,
    isOnline: false,
    avatar: 'https://i.pravatar.cc/150?img=14',
    status: 'suspended',
    createdAt: '2025-09-05T09:15:00',
    vehicleType: 'Vélomoteur',
    licenseNumber: 'DK-RIDER-004',
  },
];

// Données mock pour les commandes (version admin)
export const mockAdminOrders: Order[] = [
  {
    id: 'ORD-001',
    status: 'delivering',
    items: [
      { medicine: { id: 'm1', name: 'Paracétamol 500mg', genericName: 'Paracetamol', price: 1500, image: 'https://picsum.photos/80/80?&1', stock: 150, requiresPrescription: false, category: 'Analgésiques', pharmacyName: 'Pharmacie du Plateau', description: '', dosage: '' }, quantity: 2 },
      { medicine: { id: 'm4', name: 'Vitamine C 1000mg', genericName: 'Ascorbic Acid', price: 2500, image: 'https://picsum.photos/80/80?&4', stock: 200, requiresPrescription: false, category: 'Vitamines', pharmacyName: 'Pharmacie du Plateau', description: '', dosage: '' }, quantity: 1 },
    ],
    total: 5500,
    pharmacy: { id: 'p1', name: 'Pharmacie du Plateau', address: 'Avenue Léopold Sédar Senghor, Dakar', rating: 4.8, distance: '1.2 km', openNow: true, image: 'https://picsum.photos/200/120?grayscale&1', phone: '+221 33 821 45 67', deliveryTime: '25-35 min' },
    createdAt: '2026-03-20T09:30:00',
    estimatedTime: '15 min',
    deliveryAddress: 'Cité Keur Gorgui, Apt 4B, Dakar',
    riderName: 'Moussa Diallo',
    riderPhone: '+221 77 345 67 89',
  },
  {
    id: 'ORD-002',
    status: 'delivered',
    items: [
      { medicine: { id: 'm3', name: 'Ibuprofène 400mg', genericName: 'Ibuprofen', price: 2000, image: 'https://picsum.photos/80/80?&3', stock: 60, requiresPrescription: false, category: 'Anti-inflammatoires', pharmacyName: 'Grande Pharmacie de Dakar', description: '', dosage: '' }, quantity: 1 },
    ],
    total: 2000,
    pharmacy: { id: 'p2', name: 'Grande Pharmacie de Dakar', address: 'Rue Mohamed V, Dakar Médina', rating: 4.6, distance: '2.5 km', openNow: true, image: 'https://picsum.photos/200/120?grayscale&2', phone: '+221 33 889 23 10', deliveryTime: '30-45 min' },
    createdAt: '2026-03-19T14:20:00',
    estimatedTime: '0 min',
    deliveryAddress: 'Cité Keur Gorgui, Apt 4B, Dakar',
  },
  {
    id: 'ORD-003',
    status: 'pending',
    items: [
      { medicine: { id: 'm2', name: 'Amoxicilline 500mg', genericName: 'Amoxicillin', price: 3500, image: 'https://picsum.photos/80/80?&2', stock: 80, requiresPrescription: true, category: 'Antibiotiques', pharmacyName: 'Pharmacie du Plateau', description: '', dosage: '' }, quantity: 1 },
      { medicine: { id: 'm6', name: 'Oméprazole 20mg', genericName: 'Omeprazole', price: 3000, image: 'https://picsum.photos/80/80?&6', stock: 95, requiresPrescription: false, category: 'Gastro-entérologie', pharmacyName: 'Pharmacie du Plateau', description: '', dosage: '' }, quantity: 2 },
    ],
    total: 9500,
    pharmacy: { id: 'p1', name: 'Pharmacie du Plateau', address: 'Avenue Léopold Sédar Senghor, Dakar', rating: 4.8, distance: '1.2 km', openNow: true, image: 'https://picsum.photos/200/120?grayscale&1', phone: '+221 33 821 45 67', deliveryTime: '25-35 min' },
    createdAt: '2026-03-20T11:00:00',
    estimatedTime: '30 min',
    deliveryAddress: 'Cité Keur Gorgui, Apt 4B, Dakar',
  },
  {
    id: 'ORD-004',
    status: 'preparing',
    items: [
      { medicine: { id: 'm5', name: 'Metformine 850mg', genericName: 'Metformin', price: 4500, image: 'https://picsum.photos/80/80?&5', stock: 5, requiresPrescription: true, category: 'Antidiabétiques', pharmacyName: 'Grande Pharmacie de Dakar', description: '', dosage: '' }, quantity: 3 },
    ],
    total: 13500,
    pharmacy: { id: 'p2', name: 'Grande Pharmacie de Dakar', address: 'Rue Mohamed V, Dakar Médina', rating: 4.6, distance: '2.5 km', openNow: true, image: 'https://picsum.photos/200/120?grayscale&2', phone: '+221 33 889 23 10', deliveryTime: '30-45 min' },
    createdAt: '2026-03-20T10:15:00',
    estimatedTime: '25 min',
    deliveryAddress: 'Point E, Dakar',
  },
  {
    id: 'ORD-005',
    status: 'cancelled',
    items: [
      { medicine: { id: 'm1', name: 'Paracétamol 500mg', genericName: 'Paracetamol', price: 1500, image: 'https://picsum.photos/80/80?&1', stock: 150, requiresPrescription: false, category: 'Analgésiques', pharmacyName: 'Pharmacie du Plateau', description: '', dosage: '' }, quantity: 1 },
    ],
    total: 1500,
    pharmacy: { id: 'p1', name: 'Pharmacie du Plateau', address: 'Avenue Léopold Sédar Senghor, Dakar', rating: 4.8, distance: '1.2 km', openNow: true, image: 'https://picsum.photos/200/120?grayscale&1', phone: '+221 33 821 45 67', deliveryTime: '25-35 min' },
    createdAt: '2026-03-18T16:00:00',
    estimatedTime: '0 min',
    deliveryAddress: 'Fann, Dakar',
  },
  {
    id: 'ORD-006',
    status: 'ready',
    items: [
      { medicine: { id: 'm4', name: 'Vitamine C 1000mg', genericName: 'Ascorbic Acid', price: 2500, image: 'https://picsum.photos/80/80?&4', stock: 200, requiresPrescription: false, category: 'Vitamines', pharmacyName: 'Pharmacie du Plateau', description: '', dosage: '' }, quantity: 2 },
    ],
    total: 5000,
    pharmacy: { id: 'p1', name: 'Pharmacie du Plateau', address: 'Avenue Léopold Sédar Senghor, Dakar', rating: 4.8, distance: '1.2 km', openNow: true, image: 'https://picsum.photos/200/120?grayscale&1', phone: '+221 33 821 45 67', deliveryTime: '25-35 min' },
    createdAt: '2026-03-20T08:45:00',
    estimatedTime: '20 min',
    deliveryAddress: 'Mermoz, Dakar',
  },
];

// Données mock pour les plaintes
export const mockComplaints: Complaint[] = [
  {
    id: 'comp1',
    userId: 'c1',
    userName: 'Mamadou Faye',
    userPhone: '+221 77 123 45 67',
    orderId: 'ORD-005',
    type: 'rider',
    subject: 'Livraison retardée',
    description: 'Le livreur a pris plus de 2 heures pour livrer ma commande. Inacceptable!',
    priority: 'high',
    status: 'open',
    createdAt: '2026-03-18T18:00:00',
    updatedAt: '2026-03-18T18:00:00',
  },
  {
    id: 'comp2',
    userId: 'c2',
    userName: 'Aminata Diop',
    userPhone: '+221 78 234 56 78',
    type: 'pharmacy',
    subject: 'Médicament différent',
    description: 'La pharmacie m\'a donné un générique au lieu du médicament de marque prescrit.',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-03-17T10:30:00',
    updatedAt: '2026-03-18T09:00:00',
    assignedTo: 'Support Pharmacie',
  },
  {
    id: 'comp3',
    userId: 'c4',
    userName: 'Fatou Sow',
    userPhone: '+221 70 456 78 90',
    orderId: 'ORD-002',
    type: 'payment',
    subject: 'Problème de remboursement',
    description: 'Mon remboursement n\'a toujours pas été traité après 5 jours.',
    priority: 'high',
    status: 'resolved',
    createdAt: '2026-03-15T14:00:00',
    updatedAt: '2026-03-19T11:00:00',
    assignedTo: 'Finance',
  },
  {
    id: 'comp4',
    userId: 'c1',
    userName: 'Mamadou Faye',
    userPhone: '+221 77 123 45 67',
    type: 'order',
    subject: 'Commande incomplète',
    description: 'Il manquait un article dans ma commande. Veuillez vérifier.',
    priority: 'low',
    status: 'open',
    createdAt: '2026-03-20T13:00:00',
    updatedAt: '2026-03-20T13:00:00',
  },
];

// Statistiques pour le dashboard admin
export interface AdminStats {
  totalUsers: number;
  activeOrders: number;
  totalRevenue: number;
  activePharmacies: number;
  activeRiders: number;
  pendingApprovals: number;
  totalIssues: number;
  totalReports: number;
}

export const mockAdminStats: AdminStats = {
  totalUsers: 1250,
  activeOrders: 45,
  totalRevenue: 15750000,
  activePharmacies: 28,
  activeRiders: 32,
  pendingApprovals: 8,
  totalIssues: 12,
  totalReports: 5,
};

// Activité récente
export interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'pharmacy' | 'rider' | 'complaint';
  title: string;
  description: string;
  time: string;
}

export const mockRecentActivity: RecentActivity[] = [
  { id: 'a1', type: 'order', title: 'Nouvelle commande', description: 'ORD-006 créée par Mamadou Faye', time: 'Il y a 5 min' },
  { id: 'a2', type: 'pharmacy', title: 'Pharmacie en attente', description: 'Pharmacie Mame Diarra en attente d\'approbation', time: 'Il y a 1h' },
  { id: 'a3', type: 'rider', title: 'Nouveau livreur', description: 'Cheikh Tidiane Gningue a soumis sa candidature', time: 'Il y a 2h' },
  { id: 'a4', type: 'complaint', title: 'Nouvelle plainte', description: 'Plainte de Mamadou Faye concernant la livraison', time: 'Il y a 3h' },
  { id: 'a5', type: 'order', title: 'Commande livrée', description: 'ORD-002 livrée avec succès', time: 'Hier' },
];

// Données pour les graphiques
export interface ChartData {
  label: string;
  value: number;
}

export const mockRevenueData: ChartData[] = [
  { label: 'Jan', value: 1200000 },
  { label: 'Fév', value: 1500000 },
  { label: 'Mar', value: 1800000 },
  { label: 'Avr', value: 1650000 },
  { label: 'Mai', value: 2100000 },
  { label: 'Juin', value: 2400000 },
];

export const mockOrdersByStatus: ChartData[] = [
  { label: 'En attente', value: 12 },
  { label: 'En cours', value: 25 },
  { label: 'Livrées', value: 156 },
  { label: 'Annulées', value: 8 },
];

export const mockUserGrowth: ChartData[] = [
  { label: 'Jan', value: 850 },
  { label: 'Fév', value: 920 },
  { label: 'Mar', value: 1050 },
  { label: 'Avr', value: 1120 },
  { label: 'Mai', value: 1200 },
  { label: 'Juin', value: 1250 },
];

// Labels de statut
export const userStatusLabel: Record<UserStatus, string> = {
  active: 'Actif',
  pending: 'En attente',
  suspended: 'Suspendu',
};

export const complaintPriorityLabel: Record<ComplaintPriority, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

export const complaintStatusLabel: Record<ComplaintStatus, string> = {
  open: 'Ouverte',
  in_progress: 'En cours',
  resolved: 'Résolue',
};

export const complaintTypeLabel: Record<string, string> = {
  order: 'Commande',
  rider: 'Livreur',
  pharmacy: 'Pharmacie',
  payment: 'Paiement',
  other: 'Autre',
};
