import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';

export default function DeliveryFollow() {
  const { user, orders, loadingStates, errors, fetchOrders } = useAppStore();
  const [popup, setPopup] = useState<{ visible: boolean; title: string; message: string; variant: 'success' | 'error' | 'info' }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const activeDeliveries = useMemo(
    () => orders.filter((order) => order.pharmacieId === user?.id && ['ready', 'picked_up', 'delivering'].includes(order.statut)),
    [orders, user?.id]
  );

  const handleCallRider = (phone?: string) => {
    if (!phone) {
      setPopup({ visible: true, title: 'Information', message: 'Aucun numéro de livreur disponible.', variant: 'info' });
      return;
    }

    Linking.openURL(`tel:${phone}`).catch(() => {
      setPopup({ visible: true, title: 'Erreur', message: "Impossible de passer l'appel.", variant: 'error' });
    });
  };

  if (loadingStates.order && activeDeliveries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.order && activeDeliveries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{errors.order}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi des livraisons</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="bicycle" size={20} color={colors.delivering} />
          <Text style={styles.statValue}>{activeDeliveries.filter((order) => ['picked_up', 'delivering'].includes(order.statut)).length}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={20} color={colors.warning} />
          <Text style={styles.statValue}>{activeDeliveries.filter((order) => order.statut === 'ready').length}</Text>
          <Text style={styles.statLabel}>À retirer</Text>
        </View>
      </View>

      <FlatList
        data={activeDeliveries}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>ORD-{item.id}</Text>
              <Text style={styles.status}>{item.statut === 'ready' ? 'En attente livreur' : 'En livraison'}</Text>
            </View>
            <Text style={styles.address}>{item.adresseLivraison}</Text>
            <Text style={styles.price}>{formatPrice(item.montantTotal)}</Text>
            {item.livraison?.livreur && (
              <View style={styles.riderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.riderName}>{item.livraison.livreur.nom}</Text>
                  <Text style={styles.riderPhone}>{item.livraison.livreur.telephone || 'Téléphone indisponible'}</Text>
                </View>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleCallRider(item.livraison?.livreur?.telephone)}>
                  <Ionicons name="call-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>Aucune livraison active pour le moment.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  statsContainer: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: '700', color: colors.text, fontSize: fontSize.md },
  status: { color: colors.primary, fontWeight: '600', fontSize: fontSize.xs },
  address: { color: colors.textSecondary, marginTop: spacing.sm },
  price: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
  riderRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  riderName: { color: colors.text, fontWeight: '600' },
  riderPhone: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  actionButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
});
