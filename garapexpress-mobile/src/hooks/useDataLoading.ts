import { useAppStore } from '../store/appStore';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type DataType = 'pharmacies' | 'medicines' | 'orders' | 'notifications' | 'deliveries';

const dataKeyMap: Record<DataType, 'pharmacies' | 'medicines' | 'orders' | 'notifications' | 'deliveries'> = {
  pharmacies: 'pharmacies',
  medicines: 'medicines',
  orders: 'orders',
  notifications: 'notifications',
  deliveries: 'deliveries',
};

const loadingKeyMap: Record<DataType, 'pharmacy' | 'medicine' | 'order' | 'notification' | 'delivery'> = {
  pharmacies: 'pharmacy',
  medicines: 'medicine',
  orders: 'order',
  notifications: 'notification',
  deliveries: 'delivery',
};

/**
 * Hook pour charger les données avec gestion automatique
 * @param dataType - Type de données à charger: 'pharmacies' | 'medicines' | 'orders' | 'notifications' | 'deliveries'
 */
export const useDataLoading = (
  dataType: DataType
) => {
  const store = useAppStore();
  
  useFocusEffect(
    useCallback(() => {
      // Charger les données appropriées quand la page est en focus
      const loadData = async () => {
        switch (dataType) {
          case 'pharmacies':
            await store.fetchPharmacies();
            break;
          case 'medicines':
            await store.fetchMedicines();
            break;
          case 'orders':
            await store.fetchOrders();
            break;
          case 'notifications':
            await store.fetchNotifications();
            break;
          case 'deliveries':
            await store.fetchDeliveries();
            break;
        }
      };
      
      loadData();
    }, [dataType, store])
  );

  return {
    data: store[dataKeyMap[dataType]],
    isLoading: store.loadingStates[loadingKeyMap[dataType]],
    error: store.errors[loadingKeyMap[dataType]],
  };
};

/**
 * Hook pour charger les commandes d'un livreur
 */
export const useRiderDeliveries = (livreurId?: number) => {
  const store = useAppStore();
  
  useFocusEffect(
    useCallback(() => {
      if (livreurId) {
        store.fetchDeliveries(livreurId);
      }
    }, [livreurId, store])
  );

  return {
    deliveries: store.deliveries,
    isLoading: store.loadingStates.delivery,
    error: store.errors.delivery,
  };
};
