import { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

const StatCard = ({ title, value, icon, color, onPress }: StatCardProps) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

interface QuickActionProps {
  title: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const QuickAction = ({ title, count, icon, color, onPress }: QuickActionProps) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const router = useRouter();
  const {
    user,
    orders,
    pharmacies,
    notifications,
    loadingStates,
    errors,
    fetchOrders,
    fetchMedicines,
    fetchNotifications,
    fetchPharmacies,
  } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      fetchMedicines();
      fetchNotifications();
      fetchPharmacies();
    }, [fetchMedicines, fetchNotifications, fetchOrders, fetchPharmacies])
  );

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.montantTotal, 0);
    const pendingOrders = orders.filter((order) => order.statut === 'pending').length;
    const deliveredOrders = orders.filter((order) => order.statut === 'delivered').length;
    const urgentAlerts = notifications.filter(
      (notification) =>
        notification.type?.toLowerCase().includes('urgent') ||
        notification.type?.toLowerCase().includes('incident') ||
        notification.message?.toLowerCase().includes('urgence')
    ).length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      urgentAlerts,
    };
  }, [notifications, orders]);

  const recentActivity = useMemo(
    () =>
      orders.slice(0, 5).map((order) => ({
        id: order.id,
        message: `Commande ORD-${order.id} • ${order.statut}`,
        time: new Date(order.dateCommande).toLocaleTimeString('fr-FR'),
      })),
    [orders]
  );

  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim() || user?.nom || 'Admin';

  useEffect(() => {
    if (errors.order) {
      Alert.alert('Erreur commandes', errors.order);
    }
  }, [errors.order]);

  if (loadingStates.order && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.order && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{errors.order}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Bienvenue {displayName}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(admin)/complaints' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{stats.urgentAlerts}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Commandes"
            value={stats.totalOrders}
            icon="receipt"
            color={colors.info}
            onPress={() => router.push('/(admin)/orders' as any)}
          />
          <StatCard
            title="En cours"
            value={stats.pendingOrders}
            icon="time"
            color={colors.warning}
            onPress={() => router.push('/(admin)/orders' as any)}
          />
          <StatCard
            title="Revenus"
            value={formatPrice(stats.totalRevenue)}
            icon="wallet"
            color={colors.success}
            onPress={() => router.push('/(admin)/analytics' as any)}
          />
          <StatCard
            title="Livrées"
            value={stats.deliveredOrders}
            icon="checkmark-circle"
            color="#8B5CF6"
            onPress={() => router.push('/(admin)/riders' as any)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Utilisateurs"
              count={notifications.length}
              icon="people"
              color={colors.primary}
              onPress={() => router.push('/(admin)/users' as any)}
            />
            <QuickAction
              title="Pharmacies"
              count={pharmacies.length}
              icon="medical"
              color={colors.success}
              onPress={() => router.push('/(admin)/pharmacies' as any)}
            />
            <QuickAction
              title="Livreurs"
              count={stats.deliveredOrders}
              icon="bicycle"
              color={colors.warning}
              onPress={() => router.push('/(admin)/riders' as any)}
            />
            <QuickAction
              title="Incidents"
              count={stats.urgentAlerts}
              icon="warning"
              color={colors.error}
              onPress={() => router.push('/(admin)/complaints' as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité Récente</Text>
          {recentActivity.length === 0 ? (
            <Text style={styles.emptyText}>Aucune activité récente</Text>
          ) : (
            recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: colors.info + '20' }]}>
                  <Ionicons name="receipt" size={18} color={colors.info} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.message}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  statTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quickActionTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  activityItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  activityTime: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
