import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice, orderStatusLabel } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

export default function PharmacyDashboard() {
  const { user, pharmacies, medicines, orders, notifications, loadingStates, errors, fetchMedicines, fetchOrders, fetchNotifications } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
      fetchOrders();
      fetchNotifications();
    }, [fetchMedicines, fetchOrders, fetchNotifications])
  );

  const pharmacyMedicines = useMemo(() => medicines.filter((medicine) => medicine.pharmacieId === user?.id), [medicines, user?.id]);
  const pharmacyOrders = useMemo(() => orders.filter((order) => order.pharmacieId === user?.id), [orders, user?.id]);
  const pharmacy = useMemo(() => pharmacies.find((item) => item.id === user?.id) || null, [pharmacies, user?.id]);
  const ordersToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return pharmacyOrders.filter((order) => order.dateCommande.slice(0, 10) === today).length;
  }, [pharmacyOrders]);
  const pendingOrders = pharmacyOrders.filter((order) => ['pending', 'preparing', 'ready'].includes(order.statut)).length;
  const revenue = pharmacyOrders.reduce((sum, order) => sum + order.montantTotal, 0);
  const lowStockItems = pharmacyMedicines.filter((medicine) => medicine.stock < 20);
  const recentOrders = pharmacyOrders.slice(0, 5);
  const urgentNotifications = notifications.filter((notification) => ['alert', 'order'].includes(notification.type) && !notification.lu).length;

  if ((loadingStates.order || loadingStates.medicine) && pharmacyOrders.length === 0 && pharmacyMedicines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if ((errors.order || errors.medicine) && pharmacyOrders.length === 0 && pharmacyMedicines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{errors.order || errors.medicine}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenue,</Text>
          <Text style={styles.pharmacyName}>{pharmacy?.raisonSociale || user?.nom || 'Pharmacie'}</Text>
          <Text style={styles.pharmacyMeta}>
            {pharmacy?.estDeGarde ? 'Actuellement de garde' : pharmacy?.horaires || 'Horaires non renseignés'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {urgentNotifications > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{ordersToday}</Text>
              <Text style={styles.statLabel}>Aujourd'hui</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="time-outline" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{pendingOrders}</Text>
              <Text style={styles.statLabel}>À traiter</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="wallet-outline" size={24} color={colors.success} />
              <Text style={styles.statValue}>{formatPrice(revenue)}</Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning-outline" size={24} color={colors.error} />
              <Text style={styles.statValue}>{lowStockItems.length}</Text>
              <Text style={styles.statLabel}>Stock faible</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(pharmacy)/orders' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Commandes</Text>
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{pendingOrders}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(pharmacy)/low-stock' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning-outline" size={24} color={colors.error} />
            </View>
            <Text style={styles.quickActionText}>Stock faible</Text>
            {lowStockItems.length > 0 && (
              <View style={[styles.quickActionBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.quickActionBadgeText}>{lowStockItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(pharmacy)/delivery-follow' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="bicycle-outline" size={24} color={colors.info} />
            </View>
            <Text style={styles.quickActionText}>Livraisons</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentOrdersHeader}>
          <Text style={styles.sectionTitle}>Commandes récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(pharmacy)/orders' as any)}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentOrders}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.ordersList}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>ORD-{item.id}</Text>
                <Text style={styles.orderStatus}>{orderStatusLabel[item.statut] || item.statut}</Text>
              </View>
              <Text style={styles.orderMeta}>{item.adresseLivraison}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderPrice}>{formatPrice(item.montantTotal)}</Text>
                <Text style={styles.orderTime}>{new Date(item.dateCommande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucune commande récente</Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  greeting: { fontSize: fontSize.sm, color: colors.textSecondary },
  pharmacyName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  pharmacyMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  notificationBtn: { position: 'relative', padding: spacing.sm },
  notificationBadge: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  statsContainer: { padding: spacing.md, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.sm, textAlign: 'center' },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  quickActions: { paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.lg },
  quickAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  quickActionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  quickActionText: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  quickActionBadge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  quickActionBadgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '700' },
  recentOrdersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: spacing.md },
  seeAll: { color: colors.primary, fontWeight: '600' },
  ordersList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  orderCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: colors.text, fontWeight: '700' },
  orderStatus: { color: colors.primary, fontWeight: '600', fontSize: fontSize.xs },
  orderMeta: { color: colors.textSecondary, marginTop: spacing.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  orderPrice: { color: colors.primary, fontWeight: '700' },
  orderTime: { color: colors.textMuted, fontSize: fontSize.xs },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  emptyText: { color: colors.textSecondary, marginTop: spacing.sm },
});
