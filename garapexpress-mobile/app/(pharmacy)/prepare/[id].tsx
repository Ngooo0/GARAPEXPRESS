import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../../src/constants/theme';
import { formatPrice } from '../../../src/utils/formatters';
import { useAppStore } from '../../../src/store/appStore';
import AppPopup from '../../../src/components/ui/AppPopup';
import api from '../../../src/services/api';

type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

export default function PrepareOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ visible: false, title: '', message: '', variant: 'info' });
  const { orders, loadingStates, fetchOrders } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const order = useMemo(() => orders.find((item) => item.id === orderId), [orders, orderId]);

  const checklist = useMemo(() => {
    if (!order) return [];
    return [
      { key: 'stock', label: 'Vérifier la disponibilité du stock', hint: 'Confirmer que les produits sont prêts.' },
      { key: 'prescription', label: 'Contrôler les exigences d’ordonnance', hint: order.ordonnance ? 'Une ordonnance est jointe à la commande.' : 'Aucune ordonnance jointe.' },
      { key: 'packing', label: 'Emballer la commande', hint: `Montant total: ${formatPrice(order.montantTotal)}` },
    ];
  }, [order]);

  const allItemsChecked = checklist.every((item) => checkedItems[item.key]);

  const toggleItem = (key: string) => {
    setCheckedItems((current) => ({ ...current, [key]: !current[key] }));
  };

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  const handleMarkReady = async () => {
    if (!order) return;
    if (!allItemsChecked) {
      showPopup('Checklist incomplète', 'Veuillez confirmer chaque étape avant de marquer la commande prête.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.commandes.updateStatus(order.id, 'ready');
      await fetchOrders();
      showPopup('Commande prête', 'La commande est maintenant prête pour le retrait du livreur.', 'success');
      setTimeout(() => {
        router.replace({ pathname: '/(pharmacy)/order/[id]' as any, params: { id: order.id.toString() } });
      }, 600);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showPopup('Erreur', message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStates.order && !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Commande non trouvée</Text>
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
        <Text style={styles.headerTitle}>Préparer ORD-{order.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Commande ORD-{order.id}</Text>
          <Text style={styles.deliveryAddress}>{order.adresseLivraison}</Text>
          <Text style={styles.deliveryMeta}>Client ID: {order.clientId}</Text>
        </View>

        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.info} />
          <View style={{ flex: 1 }}>
            <Text style={styles.instructionsTitle}>Avant de valider</Text>
            <Text style={styles.instructionsText}>
              Vérifie la conformité de l’ordonnance, la disponibilité réelle et la préparation du colis avant de le passer à l’état prête.
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Checklist de préparation</Text>
          {checklist.map((item) => (
            <TouchableOpacity key={item.key} style={styles.itemRow} onPress={() => toggleItem(item.key)}>
              <View style={[styles.checkbox, checkedItems[item.key] && styles.checkboxChecked]}>
                {checkedItems[item.key] ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.label}</Text>
                <Text style={styles.itemMeta}>{item.hint}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.readyButton, (!allItemsChecked || submitting) && styles.readyButtonDisabled]}
          onPress={handleMarkReady}
          disabled={!allItemsChecked || submitting}
        >
          <Text style={styles.readyButtonText}>{submitting ? 'Validation...' : 'Marquer comme prête'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  orderInfo: { padding: spacing.md },
  orderId: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  deliveryAddress: { marginTop: spacing.sm, color: colors.textSecondary },
  deliveryMeta: { marginTop: 4, color: colors.textMuted },
  progressSection: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.md },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary },
  itemName: { fontWeight: '700', color: colors.text },
  itemMeta: { color: colors.textSecondary, marginTop: 4 },
  instructionsCard: { margin: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md },
  instructionsTitle: { fontWeight: '700', color: colors.text },
  instructionsText: { color: colors.textSecondary, marginTop: 4 },
  bottomAction: { padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  readyButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  readyButtonDisabled: { opacity: 0.5 },
  readyButtonText: { color: '#fff', fontWeight: '700' },
  errorText: { color: colors.text },
});
