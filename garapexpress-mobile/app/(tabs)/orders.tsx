import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
};

const statusColors: Record<string, string> = {
  pending: colors.warning,
  confirmed: colors.info,
  preparing: '#8B5CF6',
  ready: colors.success,
  picked_up: '#14B8A6',
  delivering: colors.primary,
  delivered: colors.success,
  cancelled: colors.error,
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  picked_up: 'Retirée',
  delivering: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useAppStore((s) => s.orders);
  const isLoading = useAppStore((s) => s.loadingStates.order);
  const fetchOrders = useAppStore((s) => s.fetchOrders);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>Mes Commandes</Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
          Suivez vos commandes en temps réel
        </Text>
      </View>

      {/* Orders List */}
      {orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="bag-outline" size={48} color={colors.textMuted} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary, fontSize: fontSize.md }}>Aucune commande</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: spacing.md, marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.md, paddingBottom: spacing.xl }}>
            {orders.map((order) => (
              <TouchableOpacity 
                key={order.id}
                onPress={() => router.push(`/order-tracking`)}
                style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}
              >
                {/* Order Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: 'bold', color: colors.text }}>ORD-{order.id}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                      {new Date(order.dateCommande).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: statusColors[order.statut] + '20', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full }}>
                    <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: statusColors[order.statut] }}>
                      {statusLabels[order.statut] || order.statut}
                    </Text>
                  </View>
                </View>

                {/* Order Info */}
                <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Adresse: {order.adresseLivraison}</Text>
                  {order.livraison && (
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                      Statut livraison: {order.livraison.statut}
                    </Text>
                  )}
                </View>

                {/* Order Footer */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
                  <View>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>Total</Text>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text }}>{formatPrice(order.montantTotal)}</Text>
                  </View>
                  {order.statut === 'delivering' && order.livraison && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full }}>
                      <Ionicons name="time-outline" size={14} color={colors.primary} />
                      <Text style={{ fontSize: fontSize.xs, color: colors.primary, marginLeft: 4, fontWeight: '600' }}>
                        En cours...
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
