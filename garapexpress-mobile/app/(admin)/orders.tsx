import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { orderStatusLabel, formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';
import type { Order } from '../../src/store/appStore';

type OrderTab = 'all' | 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

interface OrderCardProps {
  order: Order;
  onView: () => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return colors.warning;
    case 'confirmed': return colors.info;
    case 'preparing': return '#8B5CF6';
    case 'ready': return colors.success;
    case 'picked_up': return colors.primary;
    case 'delivering': return colors.primary;
    case 'delivered': return colors.success;
    case 'cancelled': return colors.error;
    default: return colors.textMuted;
  }
};

const OrderCard = ({ order, onView }: OrderCardProps) => (
  <TouchableOpacity style={styles.orderCard} onPress={onView} activeOpacity={0.7}>
    <View style={styles.orderHeader}>
      <View>
        <Text style={styles.orderId}>ORD-{order.id}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.dateCommande).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.statut) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(order.statut) }]}>
          {orderStatusLabel[order.statut] || order.statut}
        </Text>
      </View>
    </View>

    <View style={styles.orderContent}>
      <View style={styles.orderDetails}>
        <Text style={styles.pharmacyName}>Commande #{order.id}</Text>
        <Text style={styles.deliveryAddress} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          {' '}{order.adresseLivraison}
        </Text>
      </View>
    </View>

    <View style={styles.orderFooter}>
      <View>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{formatPrice(order.montantTotal)}</Text>
      </View>
      {order.livraison?.livreur && (
        <View style={styles.riderInfo}>
          <Ionicons name="bicycle" size={14} color={colors.primary} />
          <Text style={styles.riderName}>{order.livraison.livreur.nom}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.viewButtonText}>Voir</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function OrdersManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, loadingStates, errors, fetchOrders } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const tabs: { key: OrderTab; label: string }[] = [
    { key: 'all', label: 'Tout' },
    { key: 'pending', label: 'En attente' },
    { key: 'preparing', label: 'Préparation' },
    { key: 'ready', label: 'Prête' },
    { key: 'delivering', label: 'En livraison' },
    { key: 'delivered', label: 'Livrée' },
  ];

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (activeTab !== 'all') {
      if (activeTab === 'delivering') {
        filtered = filtered.filter(o => o.statut === 'delivering' || o.statut === 'picked_up');
      } else {
        filtered = filtered.filter(o => o.statut === activeTab);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.id.toString().includes(searchQuery.toLowerCase()) ||
        o.adresseLivraison.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [orders, activeTab, searchQuery]);

  const getCountForTab = (tab: OrderTab): number => {
    if (tab === 'all') return orders.length;
    if (tab === 'delivering') {
      return orders.filter(o => o.statut === 'delivering' || o.statut === 'picked_up').length;
    }
    return orders.filter(o => o.statut === tab).length;
  };

  if (loadingStates.order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ color: colors.error, textAlign: 'center' }}>{errors.order}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par ID, adresse..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item.key && styles.activeTab]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.tabText, activeTab === item.key && styles.activeTabText]}>
                {item.label}
              </Text>
              {getCountForTab(item.key) > 0 && (
                <View style={[styles.tabBadge, activeTab === item.key && styles.activeTabBadge]}>
                  <Text style={[styles.tabBadgeText, activeTab === item.key && styles.activeTabBadgeText]}>
                    {getCountForTab(item.key)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onView={() => router.push({ pathname: '/(admin)/order/[id]' as any, params: { id: item.id.toString() } })}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aucune commande trouvée</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  tabsContainer: {
    backgroundColor: colors.card,
    paddingBottom: spacing.sm,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  orderDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pharmacyImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  orderDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  pharmacyName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  deliveryAddress: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderItems: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  moreItemsText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  riderName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
