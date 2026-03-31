import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';
import api from '../../src/services/api';

const statusSteps = [
  { id: 0, label: 'Assignée', icon: 'time-outline', statuses: ['assigned'] },
  { id: 1, label: 'Collectée', icon: 'archive-outline', statuses: ['picked_up'] },
  { id: 2, label: 'En route', icon: 'bicycle-outline', statuses: ['delivering'] },
  { id: 3, label: 'Livrée', icon: 'checkmark-circle-outline', statuses: ['delivered'] },
];

export default function DeliveryStatus() {
  const router = useRouter();
  const { user, deliveries, orders, pharmacies, loadingStates, fetchDeliveries, fetchOrders, fetchPharmacies } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', variant: 'info' as 'success' | 'error' | 'info' });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchDeliveries(user.id);
      }
      fetchOrders();
      fetchPharmacies();
    }, [fetchDeliveries, fetchOrders, fetchPharmacies, user?.id])
  );

  const currentDelivery = useMemo(() => {
    const activeDelivery = deliveries.find((delivery) => !['delivered', 'cancelled'].includes(delivery.statut));
    if (!activeDelivery) {
      return null;
    }

    const order = orders.find((item) => item.id === activeDelivery.commandeId);
    const pharmacy = pharmacies.find((item) => item.id === order?.pharmacieId);
    const currentStep =
      statusSteps.findIndex((step) => step.statuses.includes(activeDelivery.statut)) >= 0
        ? statusSteps.findIndex((step) => step.statuses.includes(activeDelivery.statut))
        : 0;

    return {
      livraisonId: activeDelivery.id,
      orderId: order?.id ?? activeDelivery.commandeId,
      currentStep,
      clientName: `Client ${order?.clientId ?? 'inconnu'}`,
      clientPhone: order?.livraison?.livreur?.telephone || 'Non renseigné',
      deliveryAddress: order?.adresseLivraison ?? activeDelivery.adresse,
      pharmacyName: pharmacy?.raisonSociale || order?.pharmacie?.raisonSociale || 'Pharmacie',
      earnings: Math.round((order?.montantTotal ?? 0) * 0.15),
      estimatedTime: activeDelivery.statut === 'delivering' ? 'En cours' : 'A retirer',
      elapsedTime: new Date(activeDelivery.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: activeDelivery.statut,
    };
  }, [deliveries, orders, pharmacies]);

  const closePopup = () => setPopup((current) => ({ ...current, visible: false }));

  const handleAdvanceStatus = async () => {
    if (!currentDelivery) return;

    const nextDeliveryStatus =
      currentDelivery.status === 'assigned'
        ? 'picked_up'
        : currentDelivery.status === 'picked_up'
        ? 'delivering'
        : 'delivered';
    const nextOrderStatus = nextDeliveryStatus === 'delivered' ? 'delivered' : nextDeliveryStatus;

    try {
      setSubmitting(true);
      await api.livraisons.update(currentDelivery.livraisonId, { statut: nextDeliveryStatus });
      await api.commandes.updateStatus(currentDelivery.orderId, nextOrderStatus);
      if (user?.id) {
        await Promise.all([fetchDeliveries(user.id), fetchOrders()]);
      }
      setPopup({
        visible: true,
        title: 'Statut mis à jour',
        message: nextDeliveryStatus === 'delivered' ? 'La livraison a été marquée comme terminée.' : 'Le statut de la livraison a été mis à jour.',
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      setPopup({ visible: true, title: 'Action impossible', message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStates.delivery && !currentDelivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentDelivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucune livraison active à suivre.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppPopup visible={popup.visible} title={popup.title} message={popup.message} variant={popup.variant} onClose={closePopup} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Statut de livraison</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>ORD-{currentDelivery.orderId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.delivering + '20' }]}>
              <Text style={[styles.statusText, { color: colors.delivering }]}>{currentDelivery.status}</Text>
            </View>
          </View>
          <Text style={styles.earnings}>Gain: {formatPrice(currentDelivery.earnings)}</Text>
        </View>

        <View style={styles.timerCard}>
          <View style={styles.timerItem}>
            <Text style={styles.timerLabel}>Départ</Text>
            <Text style={styles.timerValue}>{currentDelivery.elapsedTime}</Text>
          </View>
          <View style={styles.timerDivider} />
          <View style={styles.timerItem}>
            <Text style={styles.timerLabel}>Étape actuelle</Text>
            <Text style={styles.timerValue}>{currentDelivery.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Progression</Text>
          {statusSteps.map((step, index) => (
            <View key={step.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, currentDelivery.currentStep >= step.id && styles.timelineDotActive]}>
                  <Ionicons name={currentDelivery.currentStep > step.id ? 'checkmark' : (step.icon as any)} size={14} color="#fff" />
                </View>
                {index < statusSteps.length - 1 ? <View style={[styles.timelineLine, currentDelivery.currentStep > step.id && styles.timelineLineCompleted]} /> : null}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, currentDelivery.currentStep >= step.id && styles.timelineLabelActive]}>{step.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Client</Text>
          <Text style={styles.infoText}>{currentDelivery.clientName}</Text>
          <Text style={styles.infoText}>{currentDelivery.deliveryAddress}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pharmacie</Text>
          <Text style={styles.infoText}>{currentDelivery.pharmacyName}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.confirmButton, submitting && { opacity: 0.6 }]} onPress={handleAdvanceStatus} disabled={submitting}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.confirmButtonText}>
              {currentDelivery.status === 'assigned'
                ? 'Confirmer la collecte'
                : currentDelivery.status === 'picked_up'
                ? 'Passer en livraison'
                : 'Confirmer la livraison'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(`tel:${currentDelivery.clientPhone}`).catch(() => null)}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(rider)/route')}>
              <Ionicons name="navigate" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Itinéraire</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  title: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text },
  orderCard: { marginHorizontal: spacing.md, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.text },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md },
  statusText: { fontSize: fontSize.sm, fontWeight: '600' },
  earnings: { fontSize: fontSize.lg, color: colors.success, fontWeight: '600', marginTop: 4 },
  timerCard: { flexDirection: 'row', marginHorizontal: spacing.md, marginTop: spacing.md, backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.xl },
  timerItem: { flex: 1, alignItems: 'center' },
  timerLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.8)' },
  timerValue: { fontSize: fontSize.xl, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  timerDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: spacing.md },
  timelineCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', marginRight: spacing.md },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.textMuted, justifyContent: 'center', alignItems: 'center' },
  timelineDotActive: { backgroundColor: colors.primary },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  timelineLineCompleted: { backgroundColor: colors.primary },
  timelineContent: { paddingBottom: spacing.md, justifyContent: 'center' },
  timelineLabel: { color: colors.textSecondary, fontWeight: '600' },
  timelineLabelActive: { color: colors.text },
  infoCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  infoTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  infoText: { color: colors.textSecondary, marginTop: 2 },
  actions: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  confirmButton: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: '700', marginLeft: spacing.sm },
  secondaryActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, flexDirection: 'row' },
  actionButtonText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '600' },
});
