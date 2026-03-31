import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

type FilterStatus = 'all' | 'delivered' | 'cancelled';

export default function DeliveryHistory() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const { user, deliveries, orders, loadingStates, errors, fetchDeliveries, fetchOrders } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchDeliveries(user.id);
      }
      fetchOrders();
    }, [fetchDeliveries, fetchOrders, user?.id])
  );

  const history = useMemo(() => {
    return deliveries.map((delivery) => {
      const order = orders.find((item) => item.id === delivery.commandeId);
      const delivered = delivery.statut === 'delivered';
      return {
        id: delivery.id.toString(),
        orderId: order?.id ?? delivery.commandeId,
        deliveryAddress: order?.adresseLivraison ?? delivery.adresse,
        earnings: Math.round((order?.montantTotal ?? 0) * 0.15),
        status: delivered ? 'delivered' : 'cancelled',
        date: new Date(delivery.heureDepart).toLocaleDateString('fr-FR'),
        time: new Date(delivery.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  }, [deliveries, orders]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') {
      return history;
    }
    return history.filter((item) => item.status === activeFilter);
  }, [activeFilter, history]);

  const totalEarnings = filteredHistory
    .filter((item) => item.status === 'delivered')
    .reduce((sum, item) => sum + item.earnings, 0);

  if (loadingStates.delivery && history.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.delivery && history.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{errors.delivery}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>{history.length} livraisons</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="bicycle" size={22} color={colors.success} />
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={22} color={colors.info} />
          <Text style={styles.statValue}>{history.filter((item) => item.status === 'delivered').length}</Text>
          <Text style={styles.statLabel}>Livrées</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle" size={22} color={colors.warning} />
          <Text style={styles.statValue}>{history.filter((item) => item.status === 'cancelled').length}</Text>
          <Text style={styles.statLabel}>Non terminées</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all' as FilterStatus, label: 'Tous' },
            { key: 'delivered' as FilterStatus, label: 'Livrées' },
            { key: 'cancelled' as FilterStatus, label: 'Non terminées' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterButton, activeFilter === filter.key && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Gains cumulés</Text>
        <Text style={styles.earningsValue}>{formatPrice(totalEarnings)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {filteredHistory.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>ORD-{item.orderId}</Text>
              <Text style={{ color: item.status === 'delivered' ? colors.success : colors.warning, fontWeight: '700' }}>
                {item.status === 'delivered' ? 'Livrée' : 'En cours'}
              </Text>
            </View>
            <Text style={styles.detailText}>{item.deliveryAddress}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>{item.date} à {item.time}</Text>
              <Text style={styles.earnings}>+{formatPrice(item.earnings)}</Text>
            </View>
          </View>
        ))}
        {filteredHistory.length === 0 && (
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>Aucune livraison trouvée.</Text>
          </View>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  statLabel: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  filterContainer: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  filterButton: { marginRight: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.card, borderRadius: borderRadius.full },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  earningsCard: { margin: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  earningsLabel: { color: colors.textSecondary },
  earningsValue: { color: colors.success, fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.md },
  historyCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: colors.text, fontWeight: '700', fontSize: fontSize.md },
  detailText: { color: colors.textSecondary, marginTop: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  dateText: { color: colors.textMuted, fontSize: fontSize.xs },
  earnings: { color: colors.primary, fontWeight: '700' },
});
