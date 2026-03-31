import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice, orderStatusLabel } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

type TabType = 'new' | 'preparing' | 'ready' | 'completed';

const tabs: { key: TabType; label: string }[] = [
  { key: 'new', label: 'Nouvelles' },
  { key: 'preparing', label: 'Préparation' },
  { key: 'ready', label: 'Prêtes' },
  { key: 'completed', label: 'Terminées' },
];

export default function PharmacyOrders() {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const { user, orders, loadingStates, errors, fetchOrders } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const pharmacyOrders = useMemo(
    () => orders.filter((order) => order.pharmacieId === user?.id),
    [orders, user?.id]
  );

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return pharmacyOrders.filter((order) => order.statut === 'pending');
      case 'preparing':
        return pharmacyOrders.filter((order) => order.statut === 'preparing');
      case 'ready':
        return pharmacyOrders.filter((order) => ['ready', 'picked_up', 'delivering'].includes(order.statut));
      case 'completed':
        return pharmacyOrders.filter((order) => ['delivered', 'cancelled'].includes(order.statut));
      default:
        return pharmacyOrders;
    }
  }, [activeTab, pharmacyOrders]);

  if (loadingStates.order && pharmacyOrders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.order && pharmacyOrders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{errors.order}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ordonnances et commandes</Text>
        <Text style={styles.headerSubtitle}>Prépare les commandes en attente et suis les ordonnances reçues.</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isActionable = ['pending', 'preparing'].includes(item.statut);

          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.orderId}>ORD-{item.id}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderStatusLabel[item.statut] || item.statut}</Text>
                </View>
              </View>

              <Text style={styles.meta}>{item.adresseLivraison}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color={colors.primary} />
                <Text style={styles.price}>{formatPrice(item.montantTotal)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.meta}>{new Date(item.dateCommande).toLocaleString('fr-FR')}</Text>
              </View>
              {item.ordonnance ? (
                <View style={styles.ordonnanceChip}>
                  <Ionicons name="document-text-outline" size={14} color={colors.info} />
                  <Text style={styles.ordonnanceText}>Ordonnance jointe</Text>
                </View>
              ) : null}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() => router.push({ pathname: '/(pharmacy)/order/[id]' as any, params: { id: item.id.toString() } })}
                >
                  <Text style={styles.secondaryActionText}>Voir détail</Text>
                </TouchableOpacity>

                {isActionable ? (
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() =>
                      router.push({
                        pathname: item.statut === 'pending' ? '/(pharmacy)/order/[id]' as any : '/(pharmacy)/prepare/[id]' as any,
                        params: { id: item.id.toString() },
                      })
                    }
                  >
                    <Text style={styles.primaryActionText}>
                      {item.statut === 'pending' ? 'Traiter' : 'Continuer'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>Aucune commande pour cette catégorie.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: spacing.md, backgroundColor: colors.card },
  headerTitle: { color: colors.text, fontWeight: '700', fontSize: fontSize.xl },
  headerSubtitle: { color: colors.textSecondary, marginTop: spacing.xs },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm, backgroundColor: colors.card },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.background },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: colors.text, fontWeight: '700', fontSize: fontSize.md },
  badge: { backgroundColor: colors.primary + '20', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  meta: { color: colors.textSecondary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  price: { color: colors.primary, fontWeight: '700', fontSize: fontSize.md },
  ordonnanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.info + '18',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  ordonnanceText: { color: colors.info, fontWeight: '700', fontSize: fontSize.xs },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  secondaryAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionText: { color: colors.text, fontWeight: '700' },
  primaryAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  primaryActionText: { color: '#fff', fontWeight: '700' },
});
