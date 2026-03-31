import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../../../src/constants/theme';
import { useAppStore } from '../../../src/store/appStore';
import { formatPrice, orderStatusLabel } from '../../../src/utils/formatters';

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'preparing':
      return '#8B5CF6';
    case 'ready':
      return colors.success;
    case 'picked_up':
    case 'delivering':
      return colors.primary;
    case 'delivered':
      return colors.success;
    case 'cancelled':
      return colors.error;
    default:
      return colors.textMuted;
  }
};

export default function AdminOrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orders = useAppStore((state) => state.orders);
  const order = useMemo(() => orders.find((item) => item.id === Number(id)), [id, orders]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Commande introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(order.statut);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.orderId}>ORD-{order.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.dateCommande).toLocaleString('fr-FR')}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {orderStatusLabel[order.statut] || order.statut}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.card}>
            <Text style={styles.line}>Client ID: {order.clientId}</Text>
            <Text style={styles.line}>Pharmacie ID: {order.pharmacieId}</Text>
            <Text style={styles.line}>Adresse: {order.adresseLivraison}</Text>
            <Text style={styles.line}>Montant: {formatPrice(order.montantTotal)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Livraison</Text>
          <View style={styles.card}>
            {order.livraison ? (
              <>
                <Text style={styles.line}>Statut: {order.livraison.statut}</Text>
                <Text style={styles.line}>Livreur ID: {order.livraison.livreurId}</Text>
                <Text style={styles.line}>Adresse: {order.livraison.adresse}</Text>
                <Text style={styles.line}>Départ: {new Date(order.livraison.heureDepart).toLocaleString('fr-FR')}</Text>
              </>
            ) : (
              <Text style={styles.line}>Aucune livraison associée pour le moment.</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textSecondary },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  orderDate: { color: colors.textSecondary, marginTop: spacing.xs },
  badge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  line: { color: colors.textSecondary, fontSize: fontSize.sm },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backButtonText: { color: '#fff', fontWeight: '700' },
});
