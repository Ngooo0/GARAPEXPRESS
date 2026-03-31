import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';
import api from '../../src/services/api';
import AppPopup from '../../src/components/ui/AppPopup';

// Coordonnées par défaut pour le calcul de distance (Dakar, Sénégal)
const DEFAULT_LATITUDE = 14.7167;
const DEFAULT_LONGITUDE = -17.4677;

type FilterType = 'nearest' | 'highest' | 'fastest';
type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

export default function AvailableDeliveries() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('nearest');
  const [acceptingOrderId, setAcceptingOrderId] = React.useState<number | null>(null);
  const [popup, setPopup] = React.useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });
  const { orders, pharmacies, user, loadingStates, errors, fetchOrders, fetchPharmacies, fetchDeliveries } = useAppStore();

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      fetchPharmacies();
    }, [fetchOrders, fetchPharmacies])
  );

  const handleAcceptDelivery = useCallback(async (orderId: number) => {
    if (!user?.id) {
      showPopup('Connexion requise', 'Connectez-vous comme livreur pour accepter une livraison.', 'error');
      return;
    }

    try {
      setAcceptingOrderId(orderId);
      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        throw new Error('Commande introuvable');
      }

      await api.livraisons.create({
        heureDepart: new Date().toISOString(),
        statut: 'assigned',
        adresse: order.adresseLivraison,
        commandeId: order.id,
        livreurId: user.id,
      });
      await api.commandes.updateStatus(order.id, 'picked_up');
      await Promise.all([fetchOrders(), fetchDeliveries(user.id)]);
      showPopup('Livraison acceptée', `La commande ORD-${order.id} vous a été attribuée.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l’acceptation de la livraison';
      showPopup('Erreur', message, 'error');
    } finally {
      setAcceptingOrderId(null);
    }
  }, [fetchDeliveries, fetchOrders, orders, user?.id]);

  const availableDeliveries = useMemo(() => 
    orders
      .filter(order => !['delivered', 'cancelled'].includes(order.statut) && !order.livraison?.livreurId)
      .map(order => {
        const pharmacy = pharmacies.find(p => p.id === order.pharmacieId);
        const distanceValue =
          pharmacy?.latitude && pharmacy?.longitude
            ? Math.abs(pharmacy.latitude - DEFAULT_LATITUDE) + Math.abs(pharmacy.longitude - DEFAULT_LONGITUDE)
            : 1.5;
        const estimatedMinutes = Math.max(15, Math.round(distanceValue * 40));

        return {
          id: order.id.toString(),
          orderId: order.id,
          clientName: `Client ${order.clientId}`,
          pharmacyName: pharmacy?.raisonSociale || 'Pharmacie',
          pharmacyAddress: pharmacy?.adresse || 'Adresse inconnue',
          clientAddress: order.adresseLivraison,
          status: order.statut,
          distance: `${Math.max(0.8, Number(distanceValue.toFixed(1)))} km`,
          earnings: Math.round(order.montantTotal * 0.15), // 15% du montant
          estimatedTime: `${estimatedMinutes} min`,
          items: [`Commande ORD-${order.id}`],
        };
      }),
  [orders, pharmacies]);

  const filteredDeliveries = useMemo(() =>
    [...availableDeliveries].sort((a, b) => {
      if (activeFilter === 'nearest') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      if (activeFilter === 'highest') {
        return b.earnings - a.earnings;
      }
      return parseFloat(a.estimatedTime) - parseFloat(b.estimatedTime);
    }),
  [availableDeliveries, activeFilter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Livraisons disponibles</Text>
        <Text style={styles.subtitle}>{filteredDeliveries.length} commandes près de vous</Text>
      </View>

      {loadingStates.order && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {errors.order && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ color: colors.error, textAlign: 'center' }}>{errors.order}</Text>
        </View>
      )}

      {!loadingStates.order && filteredDeliveries.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Aucune livraison disponible</Text>
        </View>
      )}

      {!loadingStates.order && filteredDeliveries.length > 0 && (
        <>
          {/* Filters */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'nearest' as FilterType, label: 'Plus proche', icon: 'navigate' },
                { key: 'highest' as FilterType, label: 'Meilleur prix', icon: 'trending-up' },
                { key: 'fastest' as FilterType, label: 'Plus rapide', icon: 'flash' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={activeFilter === filter.key ? '#fff' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.key && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Deliveries List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {filteredDeliveries.map((delivery) => (
              <View key={delivery.id} style={styles.deliveryCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.deliveryId}>{delivery.id}</Text>
                    <Text style={styles.clientName}>{delivery.clientName}</Text>
                  </View>
                  <View style={styles.earningsBadge}>
                    <Text style={styles.earningsText}>+{formatPrice(delivery.earnings)}</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="medical" size={16} color={colors.primary} />
                    <Text style={styles.infoLabel}>{delivery.pharmacyName}</Text>
                  </View>
                  <Text style={styles.infoAddress}>{delivery.pharmacyAddress}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.info} />
                    <Text style={styles.infoLabel}>Client</Text>
                  </View>
                  <Text style={styles.infoAddress}>{delivery.clientAddress}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{delivery.distance}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{delivery.estimatedTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cube" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{delivery.items.length} articles</Text>
                  </View>
                </View>

                <View style={styles.itemsPreview}>
                  {delivery.items.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.itemText} numberOfLines={1}>
                      • {item}
                    </Text>
                  ))}
                  {delivery.items.length > 2 && (
                    <Text style={styles.moreItems}>+{delivery.items.length - 2} autres</Text>
                  )}
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => router.push({ pathname: '/(rider)/delivery/[id]' as any, params: { id: delivery.orderId } })}
                  >
                    <Text style={styles.detailsButtonText}>Détails</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.acceptButton, acceptingOrderId === delivery.orderId && { opacity: 0.7 }]}
                    disabled={acceptingOrderId === delivery.orderId}
                    onPress={() => handleAcceptDelivery(delivery.orderId)}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.acceptButtonText}>
                      {acceptingOrderId === delivery.orderId ? 'Traitement...' : 'Accepter'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}
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
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  deliveryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  deliveryId: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  clientName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  earningsBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  earningsText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.success,
  },
  infoSection: {
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  infoAddress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.md + spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  itemsPreview: {
    marginTop: spacing.sm,
    gap: 2,
  },
  itemText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  moreItems: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  acceptButtonText: {
    fontSize: fontSize.sm,
    color: '#fff',
    fontWeight: '600',
  },
});
