import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { formatPrice } from '../../src/utils/formatters';
import { api } from '../../src/services/api';

type DateRange = 'week' | 'month' | 'year';

const screenWidth = Dimensions.get('window').width;

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const { orders, loadingStates, errors, fetchOrders } = useAppStore();
  
  // Load orders when page is focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      const loadPayments = async () => {
        try {
          setPaymentsLoading(true);
          setPayments(await api.paiements.getAll());
        } finally {
          setPaymentsLoading(false);
        }
      };
      loadPayments();
    }, [fetchOrders])
  );

  const dateRanges: { key: DateRange; label: string }[] = [
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'year', label: 'Année' },
  ];

  // Calculate basic stats from real orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.montantTotal, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.statut === 'pending').length;
  const deliveredOrders = orders.filter(o => o.statut === 'delivered').length;
  const successfulPayments = useMemo(() => payments.filter((payment) => payment.statut === 'succes' || payment.statut === 'success'), [payments]);
  const pendingPayments = useMemo(() => payments.filter((payment) => payment.statut === 'pending'), [payments]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loadingStates.order && (
          <View style={{ padding: spacing.md, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {errors.order && (
          <View style={{ padding: spacing.md }}>
            <Text style={{ color: colors.error }}>{errors.order}</Text>
          </View>
        )}

        {/* Date Range Selector */}
        <View style={styles.header}>
          <View style={styles.dateRangeContainer}>
            {dateRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[styles.dateRangeButton, dateRange === range.key && styles.activeDateRangeButton]}
                onPress={() => setDateRange(range.key)}
              >
                <Text style={[styles.dateRangeText, dateRange === range.key && styles.activeDateRangeText]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={18} color={colors.primary} />
            <Text style={styles.exportText}>Exporter</Text>
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="wallet" size={20} color={colors.success} />
            </View>
            <Text style={styles.metricValue}>{formatPrice(totalRevenue)}</Text>
            <Text style={styles.metricLabel}>Revenus Totaux</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="receipt" size={20} color={colors.info} />
            </View>
            <Text style={styles.metricValue}>{totalOrders}</Text>
            <Text style={styles.metricLabel}>Commandes Totales</Text>
          </View>
        </View>

        {/* Orders Summary */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Résumé des Commandes</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>En attente</Text>
              <Text style={styles.summaryValue}>{pendingOrders}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Livrées</Text>
              <Text style={styles.summaryValue}>{deliveredOrders}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Transactions</Text>
          {paymentsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Paiements réussis</Text>
                  <Text style={styles.summaryValue}>{successfulPayments.length}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>En attente</Text>
                  <Text style={styles.summaryValue}>{pendingPayments.length}</Text>
                </View>
              </View>
              {payments.slice(0, 5).map((payment) => (
                <View key={payment.id} style={styles.orderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderIdText}>Paiement #{payment.id}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                      {payment.modePaiement} • {payment.statut}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>{formatPrice(payment.montant)}</Text>
                </View>
              ))}
              {payments.length === 0 && (
                <Text style={{ paddingTop: spacing.sm, color: colors.textSecondary }}>Aucune transaction disponible.</Text>
              )}
            </>
          )}
        </View>

        {/* Recent Orders */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Dernières Commandes</Text>
          {orders.length === 0 ? (
            <Text style={{ padding: spacing.md, color: colors.textSecondary }}>Aucune commande</Text>
          ) : (
            orders.slice(0, 5).map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderIdText}>{order.id}</Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                    {order.statut}
                  </Text>
                </View>
                <Text style={styles.orderAmount}>{formatPrice(order.montantTotal)}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  dateRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  activeDateRangeButton: {
    backgroundColor: colors.primary,
  },
  dateRangeText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  activeDateRangeText: {
    color: '#FFFFFF',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exportText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  metricLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chartSection: {
    padding: spacing.md,
    backgroundColor: colors.card,
    marginTop: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  chartYAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  axisLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
  barChart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statusChart: {
    gap: spacing.md,
  },
  statusItem: {
    gap: spacing.xs,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  summarySection: {
    padding: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderIdText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  orderAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});
