import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

export default function EarningsSummary() {
  const { deliveries, loadingStates, errors, fetchDeliveries, fetchOrders, user } = useAppStore();
  
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchDeliveries(user.id);
      }
      fetchOrders();
    }, [fetchDeliveries, fetchOrders, user?.id])
  );

  // Calculer les gains à partir des livraisons réelles
  const today = new Date().toISOString().split('T')[0];
  const thisWeekDeliveries = deliveries.filter(d => {
    const deliveryDate = d.heureDepart.split('T')[0];
    return new Date(deliveryDate) >= new Date(new Date().setDate(new Date().getDate() - 7));
  });
  
  const earningsData = useMemo(() => {
    const totalThisWeek = thisWeekDeliveries.reduce((sum, d) => {
      const order = useAppStore.getState().orders.find(o => o.id === d.commandeId);
      return sum + (order?.montantTotal || 0) * 0.15; // 15% pour le livreur
    }, 0);
    
    const totalThisMonth = deliveries.reduce((sum, d) => {
      const deliveryDate = new Date(d.heureDepart);
      const currentMonth = new Date().getMonth();
      if (deliveryDate.getMonth() === currentMonth) {
        const order = useAppStore.getState().orders.find(o => o.id === d.commandeId);
        return sum + (order?.montantTotal || 0) * 0.15;
      }
      return sum;
    }, 0);
    
    return {
      totalThisWeek: Math.round(totalThisWeek),
      totalThisMonth: Math.round(totalThisMonth),
      availableBalance: Math.round(totalThisMonth * 0.7),
      pendingBalance: Math.round(totalThisMonth * 0.3),
      averagePerDelivery: deliveries.length > 0 ? Math.round((totalThisMonth) / deliveries.length) : 0,
    };
  }, [deliveries]);

  // Générer données hebdomadaires depuis les livraisons
  const weeklyData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (date.getDay() - index));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayDeliveries = deliveries.filter(d => d.heureDepart.startsWith(dateStr));
      const amount = dayDeliveries.reduce((sum, d) => {
        const order = useAppStore.getState().orders.find(o => o.id === d.commandeId);
        return sum + (order?.montantTotal || 0) * 0.15;
      }, 0);
      
      return { day, amount: Math.round(amount), deliveries: dayDeliveries.length };
    });
  }, [deliveries]);

  // Transactions = livraisons complètes
  const transactions = useMemo(() => 
    deliveries.map(d => ({
      id: `TXN-${d.id}`,
      type: d.statut === 'delivered' ? 'earning' : 'pending',
      amount: Math.round((useAppStore.getState().orders.find(o => o.id === d.commandeId)?.montantTotal || 0) * 0.15),
      description: `Livraison ORD-${d.commandeId}`,
      date: d.heureDepart.split('T')[0],
      status: d.statut,
    })).slice(0, 6),
  [deliveries]);
  const maxAmount = Math.max(...weeklyData.map(d => d.amount), 1);
  const maxBarHeight = 120;

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
          <Text style={styles.errorText}>{errors.delivery}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gains</Text>
        <Text style={styles.subtitle}>Vos revenus</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Cards */}
        <View style={styles.balanceCards}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceValue}>{formatPrice(earningsData.availableBalance)}</Text>
            <TouchableOpacity style={styles.withdrawButton}>
              <Ionicons name="cash" size={16} color={colors.primary} />
              <Text style={styles.withdrawText}>Retirer</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.balanceCardSmall}>
            <View style={styles.smallBalanceItem}>
              <Text style={styles.smallBalanceLabel}>Ce mois</Text>
              <Text style={styles.smallBalanceValue}>{formatPrice(earningsData.totalThisMonth)}</Text>
            </View>
            <View style={styles.smallBalanceItem}>
              <Text style={styles.smallBalanceLabel}>En attente</Text>
              <Text style={[styles.smallBalanceValue, { color: colors.warning }]}>
                {formatPrice(earningsData.pendingBalance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="bicycle" size={20} color={colors.success} />
            <Text style={styles.statValue}>
              {thisWeekDeliveries.length}
            </Text>
            <Text style={styles.statLabel}>Livraisons</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trending-up" size={20} color={colors.info} />
            <Text style={styles.statValue}>{formatPrice(earningsData.averagePerDelivery)}</Text>
            <Text style={styles.statLabel}>Moyenne/livraison</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Cette semaine</Text>
            <Text style={styles.chartValue}>{formatPrice(earningsData.totalThisWeek)}</Text>
          </View>
          <View style={styles.chartContainer}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar,
                      { height: day.amount > 0 ? (day.amount / maxAmount) * maxBarHeight : 4 }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{day.day}</Text>
                {day.amount > 0 && (
                  <Text style={styles.barAmount}>{day.amount / 1000}k</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cash" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Retirer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="document-text" size={20} color={colors.info} />
            </View>
            <Text style={styles.actionText}>Relevé</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="help-circle" size={20} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Aide</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historique des transactions</Text>
          </View>
          
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === 'earning' ? colors.success + '20' : colors.info + '20' }
              ]}>
                <Ionicons 
                  name={transaction.type === 'earning' ? 'arrow-down' : 'arrow-up'} 
                  size={18} 
                  color={transaction.type === 'earning' ? colors.success : colors.info} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'earning' ? colors.success : colors.text }
              ]}>
                {transaction.type === 'earning' ? '+' : ''}{formatPrice(Math.abs(transaction.amount))}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xl }} />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  balanceCards: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  balanceCard: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceValue: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: spacing.xs,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  withdrawText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  balanceCardSmall: {
    flex: 1,
    gap: spacing.sm,
  },
  smallBalanceItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  smallBalanceLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  smallBalanceValue: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  chartValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  barAmount: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '500',
  },
  transactionsSection: {
    paddingHorizontal: spacing.md,
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
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  transactionDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});
