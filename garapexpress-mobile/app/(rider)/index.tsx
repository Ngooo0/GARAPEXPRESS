import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

export default function RiderDashboard() {
  const router = useRouter();
  const { deliveries, orders, pharmacies, user, loadingStates, errors, fetchDeliveries, fetchOrders, fetchPharmacies } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchDeliveries(user.id);
      }
      fetchOrders();
      fetchPharmacies();
    }, [fetchDeliveries, fetchOrders, fetchPharmacies, user?.id])
  );

  // Calculer stats depuis les vraies livraisons
  const riderStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries.filter(d => d.heureDepart.startsWith(today)).length;
    const todayEarnings = deliveries
      .filter(d => d.heureDepart.startsWith(today))
      .reduce((sum, d) => {
        const order = orders.find(orderItem => orderItem.id === d.commandeId);
        return sum + ((order?.montantTotal || 0) * 0.15);
      }, 0);

    return {
      todayDeliveries,
      todayEarnings: Math.round(todayEarnings),
      rating: deliveries.length > 0 ? 4.8 : 0,
      activeOrders: deliveries.filter(d => d.statut !== 'delivered').length,
    };
  }, [deliveries, orders]);

  // Activité récente = dernières livraisons
  const recentActivity = useMemo(() =>
    deliveries.slice(0, 3).map((d, i) => ({
      id: d.id.toString(),
      type: d.statut === 'delivered' ? 'delivery' : 'pickup',
      message: `Commande ORD-${d.commandeId} ${d.statut === 'delivered' ? 'livrée' : 'en cours'} `,
      time: new Date(d.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      icon: d.statut === 'delivered' ? 'checkmark-circle' : 'archive',
      iconColor: d.statut === 'delivered' ? colors.success : colors.info,
    })),
  [deliveries]);

  const activeOrders = useMemo(() =>
    deliveries
      .filter((delivery) => delivery.statut !== 'delivered')
      .map((delivery) => {
        const order = orders.find((orderItem) => orderItem.id === delivery.commandeId);
        const pharmacy = pharmacies.find((pharmacyItem) => pharmacyItem.id === order?.pharmacieId);

        return {
          id: delivery.id.toString(),
          orderId: order?.id ?? delivery.commandeId,
          pharmacyName: pharmacy?.raisonSociale ?? order?.pharmacie?.raisonSociale ?? 'Pharmacie',
          deliveryAddress: order?.adresseLivraison ?? delivery.adresse,
          estimatedTime: order?.statut === 'delivering' ? 'En cours' : 'A retirer',
          total: order?.montantTotal ?? 0,
        };
      }),
  [deliveries, orders, pharmacies]);

  if (loadingStates.delivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.delivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ color: colors.error, textAlign: 'center' }}>{errors.delivery}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {user?.prenom || 'Livreur'} 👋</Text>
            <Text style={styles.subtitle}>Prêt à livrer aujourd'hui ?</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Online Status Toggle */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <View>
              <Text style={styles.statusTitle}>En ligne</Text>
              <Text style={styles.statusSubtitle}>Vous recevez des commandes</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.toggleBtn}>
            <Ionicons name="power" size={20} color={colors.success} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="bicycle" size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{riderStats.todayDeliveries}</Text>
            <Text style={styles.statLabel}>Livraisons aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="wallet" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{formatPrice(riderStats.todayEarnings)}</Text>
            <Text style={styles.statLabel}>Gains aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="star" size={24} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{riderStats.rating}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="list" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{riderStats.activeOrders}</Text>
            <Text style={styles.statLabel}>Commandes actives</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(rider)/available' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="list" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Voir les disponibles</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(rider)/route' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.info }]}>
                <Ionicons name="map" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Voir la carte</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(rider)/history' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.warning }]}>
                <Ionicons name="time" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Historique des courses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commandes en cours</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {activeOrders.map((order) => (
            <TouchableOpacity 
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push({ pathname: '/(rider)/delivery/[id]' as any, params: { id: order.orderId } })}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>ORD-{order.orderId}</Text>
                  <Text style={styles.orderPharmacy}>{order.pharmacyName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.delivering + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: colors.delivering }]}>En livraison</Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <View style={styles.orderDetailItem}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.orderDetailText}>{order.deliveryAddress}</Text>
                </View>
                <View style={styles.orderDetailItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.orderDetailText}>{order.estimatedTime}</Text>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  <TouchableOpacity 
                    style={styles.trackBtn}
                    onPress={() => router.push('/(rider)/status' as any)}
                  >
                  <Text style={styles.trackBtnText}>Suivre</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          {activeOrders.length === 0 && (
            <View style={styles.orderCard}>
              <Text style={styles.orderPharmacy}>Aucune livraison active pour le moment.</Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { paddingBottom: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: activity.iconColor + '20' }]}>
                <Ionicons name={activity.icon as any} size={18} color={activity.iconColor} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  statusSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderPharmacy: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  orderDetails: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orderDetailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  orderTotal: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackBtnText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
