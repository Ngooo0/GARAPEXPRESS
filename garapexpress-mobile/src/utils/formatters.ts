/**
 * Utilitaires de formatage - À utiliser à la place de mockData
 */

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
  }).format(price);
};

export const orderStatusLabel: Record<string, string> = {
  'pending': 'En attente',
  'en_attente': 'En attente',
  'confirmed': 'Confirmée',
  'confirmee': 'Confirmée',
  'preparing': 'En préparation',
  'en_preparation': 'En préparation',
  'ready': 'Prête',
  'picked_up': 'Collectée',
  'recuperee': 'Collectée',
  'delivering': 'En livraison',
  'en_livraison': 'En livraison',
  'delivered': 'Livrée',
  'livre': 'Livrée',
  'cancelled': 'Annulée',
  'annule': 'Annulée',
  'assigned': 'Assignée',
};

export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': '#FFA500',
    'en_attente': '#FFA500',
    'confirmed': '#4CAF50',
    'confirmee': '#4CAF50',
    'preparing': '#2196F3',
    'en_preparation': '#2196F3',
    'ready': '#10B981',
    'picked_up': '#FF9800',
    'recuperee': '#FF9800',
    'delivering': '#00BCD4',
    'en_livraison': '#00BCD4',
    'delivered': '#4CAF50',
    'livre': '#4CAF50',
    'cancelled': '#F44336',
    'annule': '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString('fr-SN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};
