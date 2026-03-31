import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../../src/constants/theme';
import { formatPrice } from '../../../src/utils/formatters';
import { useAppStore } from '../../../src/store/appStore';
import AppPopup from '../../../src/components/ui/AppPopup';
import api from '../../../src/services/api';

export default function DeliveryDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const orderId = Number(String(id).replace(/[^\d]/g, ''));
  const { orders, pharmacies, user, loadingStates, fetchOrders, fetchPharmacies, fetchDeliveries } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', variant: 'info' as 'success' | 'error' | 'info' });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchDeliveries(user.id);
      }
      fetchOrders();
      fetchPharmacies();
    }, [fetchOrders, fetchPharmacies, fetchDeliveries, user?.id])
  );

  const delivery = useMemo(() => {
    const order = orders.find((item) => item.id === orderId);
    const pharmacy = pharmacies.find((item) => item.id === order?.pharmacieId);
    const assignedDelivery = order?.livraison;

    if (!order) {
      return null;
    }

    // Les informations du client ne sont pas directement disponibles dans la commande
    // Elles seront affichées telles que disponibles dans la commande
    const clientName = `Client #${order.clientId}`;
    const clientPhone = 'Non renseigné';

    // Calculer les gains dynamiquement (15% du montant de la commande)
    const earnings = Math.round(order.montantTotal * 0.15);

    return {
      order,
      livraisonId: assignedDelivery?.id,
      id: `ORD-${order.id}`,
      clientName,
      clientPhone,
      deliveryAddress: order.adresseLivraison,
      pharmacy: {
        name: pharmacy?.raisonSociale || order.pharmacie?.raisonSociale || 'Pharmacie',
        address: pharmacy?.adresse || order.pharmacie?.adresse || 'Adresse non renseignée',
        phone: pharmacy?.telephone || order.pharmacie?.telephone || 'Non renseigné',
      },
      items: [{ name: `Commande #${order.id}`, quantity: 1, price: order.montantTotal }],
      total: order.montantTotal,
      earnings,
      estimatedTime: order.statut === 'picked_up' || order.statut === 'delivering' ? 'En cours' : 'A retirer',
      status: order.statut,
    };
  }, [orderId, orders, pharmacies]);

  const closePopup = () => setPopup((current) => ({ ...current, visible: false }));

  const updateDeliveryFlow = async (nextStatus: 'picked_up' | 'delivering' | 'delivered') => {
    if (!delivery?.livraisonId || !user?.id) return;

    try {
      setSubmitting(true);
      await api.livraisons.update(delivery.livraisonId, { statut: nextStatus });
      await api.commandes.updateStatus(delivery.order.id, nextStatus);
      await Promise.all([fetchOrders(), fetchDeliveries(user.id)]);
      setPopup({
        visible: true,
        title: 'Mise à jour réussie',
        message: nextStatus === 'delivered' ? 'La livraison est terminée.' : 'Le statut de la livraison a été mis à jour.',
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      setPopup({ visible: true, title: 'Action impossible', message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStates.order && !delivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!delivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.cardName}>Commande introuvable</Text>
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
        <Text style={styles.title}>Détails de la commande</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapPreview}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={colors.primary} />
            <Text style={styles.mapText}>Carte interactive</Text>
            <Text style={styles.mapSubtext}>Pharmacie puis client</Text>
          </View>
          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.routeLabel}>Pharmacie</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>{delivery.pharmacy.name}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.info }]} />
              <Text style={styles.routeLabel}>Client</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>{delivery.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>{delivery.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.ready + '20' }]}>
              <Text style={[styles.statusText, { color: colors.ready }]}>{delivery.status}</Text>
            </View>
          </View>
          <Text style={styles.earnings}>Gain: {formatPrice(delivery.earnings)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="medical" size={20} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Pharmacie</Text>
          </View>
          <Text style={styles.cardName}>{delivery.pharmacy.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{delivery.pharmacy.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{delivery.pharmacy.phone}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="person" size={20} color={colors.info} />
            </View>
            <Text style={styles.cardTitle}>Client</Text>
          </View>
          <Text style={styles.cardName}>{delivery.clientName}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{delivery.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="cube" size={20} color={colors.warning} />
            </View>
            <Text style={styles.cardTitle}>Commande</Text>
          </View>
          {delivery.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(delivery.total)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {delivery.status === 'ready' || delivery.status === 'assigned' ? (
            <TouchableOpacity style={[styles.confirmButton, submitting && { opacity: 0.6 }]} disabled={submitting} onPress={() => updateDeliveryFlow('picked_up')}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirmer la collecte</Text>
            </TouchableOpacity>
          ) : delivery.status === 'picked_up' ? (
            <TouchableOpacity style={[styles.confirmButton, submitting && { opacity: 0.6 }]} disabled={submitting} onPress={() => updateDeliveryFlow('delivering')}>
              <Ionicons name="navigate" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Démarrer la livraison</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.confirmButton, submitting && { opacity: 0.6 }]} disabled={submitting} onPress={() => updateDeliveryFlow('delivered')}>
              <Ionicons name="checkmark-done" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirmer la livraison</Text>
            </TouchableOpacity>
          )}

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(`tel:${delivery.pharmacy.phone}`).catch(() => null)}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Appeler pharmacie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(rider)/route')}>
              <Ionicons name="navigate" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Naviguer</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  title: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text },
  mapPreview: { margin: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  mapPlaceholder: { height: 150, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  mapText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  mapSubtext: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  routeInfo: { padding: spacing.md },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  routeLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, width: 70 },
  routeAddress: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  routeLine: { width: 2, height: 20, backgroundColor: colors.border, marginLeft: 5, marginVertical: 4 },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.text },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md },
  statusText: { fontSize: fontSize.sm, fontWeight: '600' },
  earnings: { fontSize: fontSize.lg, color: colors.success, fontWeight: '600', marginTop: 4 },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  iconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  infoText: { flex: 1, marginLeft: spacing.sm, color: colors.textSecondary },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  itemInfo: { flex: 1 },
  itemName: { color: colors.text, fontWeight: '600' },
  itemQty: { color: colors.textSecondary, marginTop: 2 },
  itemPrice: { color: colors.text, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { color: colors.textSecondary },
  totalValue: { color: colors.primary, fontWeight: '700', fontSize: fontSize.lg },
  actions: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  confirmButton: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: '700', marginLeft: spacing.sm },
  secondaryActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, flexDirection: 'row' },
  actionButtonText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '600' },
});
