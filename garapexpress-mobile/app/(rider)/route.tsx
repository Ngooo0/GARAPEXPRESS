import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';

export default function RouteScreen() {
  const router = useRouter();
  const deliveries = useAppStore((state) => state.deliveries);
  const orders = useAppStore((state) => state.orders);
  const pharmacies = useAppStore((state) => state.pharmacies);

  const currentRoute = useMemo(() => {
    const activeDelivery = deliveries.find((delivery) => !['delivered', 'cancelled'].includes(delivery.statut));
    if (!activeDelivery) {
      return null;
    }

    const order = orders.find((item) => item.id === activeDelivery.commandeId);
    const pharmacy = pharmacies.find((item) => item.id === order?.pharmacieId);

    return {
      distance: 'Trajet en cours',
      duration: activeDelivery.statut === 'delivering' ? 'Vers le client' : 'Vers la pharmacie',
      earnings: Math.round((order?.montantTotal ?? 0) * 0.15),
      steps: [
        {
          step: 1,
          title: 'Aller à la pharmacie',
          description: pharmacy?.raisonSociale || 'Pharmacie',
          address: pharmacy?.adresse || 'Adresse non renseignée',
          status: activeDelivery.statut === 'assigned' ? 'current' : 'completed',
        },
        {
          step: 2,
          title: 'Récupérer la commande',
          description: `Commande ORD-${order?.id ?? activeDelivery.commandeId}`,
          address: '',
          status: activeDelivery.statut === 'picked_up' ? 'current' : activeDelivery.statut === 'delivering' || activeDelivery.statut === 'delivered' ? 'completed' : 'pending',
        },
        {
          step: 3,
          title: 'Se rendre chez le client',
          description: `Client ${order?.clientId ?? 'inconnu'}`,
          address: order?.adresseLivraison || activeDelivery.adresse,
          status: activeDelivery.statut === 'delivering' ? 'current' : activeDelivery.statut === 'delivered' ? 'completed' : 'pending',
        },
        {
          step: 4,
          title: 'Confirmer la livraison',
          description: 'Remettre la commande au client',
          address: '',
          status: activeDelivery.statut === 'delivered' ? 'completed' : 'pending',
        },
      ],
    };
  }, [deliveries, orders, pharmacies]);

  if (!currentRoute) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Aucun itinéraire actif pour le moment.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Itinéraire</Text>
        <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/(rider)/status')}>
          <Ionicons name="navigate" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color={colors.primary} />
          <Text style={styles.mapTitle}>Parcours de livraison</Text>
          <Text style={styles.mapSubtitle}>Pharmacie puis client</Text>
        </View>

        <View style={styles.routeSummary}>
          <View style={styles.summaryItem}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={styles.summaryValue}>{currentRoute.distance}</Text>
            <Text style={styles.summaryLabel}>Distance</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="time" size={20} color={colors.warning} />
            <Text style={styles.summaryValue}>{currentRoute.duration}</Text>
            <Text style={styles.summaryLabel}>Étape</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="cash" size={20} color={colors.success} />
            <Text style={styles.summaryValue}>{formatPrice(currentRoute.earnings)}</Text>
            <Text style={styles.summaryLabel}>Gain</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Étapes</Text>

        {currentRoute.steps.map((routeStep) => (
          <View key={routeStep.step} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, routeStep.status === 'current' && styles.stepNumberActive, routeStep.status === 'completed' && styles.stepNumberCompleted]}>
                {routeStep.status === 'completed' ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text style={[styles.stepNumberText, routeStep.status === 'current' && styles.stepNumberTextActive]}>{routeStep.step}</Text>
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, routeStep.status === 'current' && styles.stepTitleActive]}>{routeStep.title}</Text>
                <Text style={styles.stepDescription}>{routeStep.description}</Text>
                {routeStep.address ? <Text style={styles.stepAddressText}>{routeStep.address}</Text> : null}
              </View>
            </View>
          </View>
        ))}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/(rider)/status')}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>Suivre la livraison</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  title: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text },
  mapButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  mapContainer: { marginHorizontal: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  mapPlaceholder: { height: 200, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  mapTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  mapSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  routeSummary: { flexDirection: 'row', padding: spacing.md, backgroundColor: colors.card },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text, marginTop: 4, textAlign: 'center' },
  summaryLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  stepsContainer: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  stepCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.textMuted, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  stepNumberActive: { backgroundColor: colors.primary },
  stepNumberCompleted: { backgroundColor: colors.success },
  stepNumberText: { color: '#fff', fontWeight: '700' },
  stepNumberTextActive: { color: '#fff' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  stepTitleActive: { color: colors.text },
  stepDescription: { color: colors.text, marginTop: 2 },
  stepAddressText: { color: colors.textSecondary, marginTop: 4 },
  actions: { marginTop: spacing.lg },
  primaryAction: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.md, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  primaryActionText: { color: '#fff', fontWeight: '700', marginLeft: spacing.sm },
});
