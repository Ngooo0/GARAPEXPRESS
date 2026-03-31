import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../../src/constants/theme';
import { formatPrice, orderStatusLabel, formatDate } from '../../../src/utils/formatters';
import { useAppStore } from '../../../src/store/appStore';
import AppPopup from '../../../src/components/ui/AppPopup';
import api from '../../../src/services/api';

type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ visible: false, title: '', message: '', variant: 'info' });
  const { orders, loadingStates, fetchOrders } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const order = useMemo(() => orders.find((item) => item.id === orderId), [orders, orderId]);

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  const updateStatus = async (status: string) => {
    if (!order) return;
    try {
      setSubmitting(true);
      await api.commandes.updateStatus(order.id, status);
      await fetchOrders();
      showPopup('Commande mise à jour', 'Le statut de la commande a été mis à jour.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showPopup('Erreur', message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openPrescription = async () => {
    if (!order?.ordonnance?.fichier) {
      showPopup('Ordonnance indisponible', 'Aucun fichier associé à cette commande.', 'info');
      return;
    }

    try {
      await Linking.openURL(order.ordonnance.fichier);
    } catch {
      showPopup('Ouverture impossible', "Le fichier d'ordonnance n'a pas pu être ouvert.", 'error');
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
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
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
        <Text style={styles.headerTitle}>Commande ORD-{order.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>{orderStatusLabel[order.statut] || order.statut}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.card}>
            <Text style={styles.infoText}>Adresse: {order.adresseLivraison}</Text>
            <Text style={styles.infoText}>Client ID: {order.clientId}</Text>
            <Text style={styles.infoText}>Date: {formatDate(order.dateCommande)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant et paiement</Text>
          <View style={styles.card}>
            <Text style={styles.totalValue}>{formatPrice(order.montantTotal)}</Text>
            <Text style={styles.infoText}>Paiement: {order.paiement?.statut || 'En attente'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordonnance</Text>
          <View style={styles.card}>
            {order.ordonnance ? (
              <>
                <Text style={styles.infoText}>Statut: {order.ordonnance.statut}</Text>
                <Text style={styles.infoText}>Date: {formatDate(order.ordonnance.dateEmission)}</Text>
                <TouchableOpacity style={styles.linkButton} onPress={openPrescription}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  <Text style={styles.linkButtonText}>Ouvrir l’ordonnance</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.infoText}>Aucune ordonnance jointe à cette commande.</Text>
            )}
          </View>
        </View>

        {order.livraison?.livreur && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Livreur</Text>
            <View style={styles.card}>
              <Text style={styles.infoText}>{order.livraison.livreur.nom}</Text>
              <Text style={styles.infoText}>{order.livraison.livreur.telephone || 'Téléphone indisponible'}</Text>
              <Text style={styles.infoText}>Statut livraison: {orderStatusLabel[order.livraison.statut] || order.livraison.statut}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          {order.statut === 'pending' && (
            <>
              <TouchableOpacity style={styles.primaryButton} disabled={submitting} onPress={() => updateStatus('preparing')}>
                <Text style={styles.primaryButtonText}>Commencer la préparation</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} disabled={submitting} onPress={() => updateStatus('cancelled')}>
                <Text style={styles.secondaryButtonText}>Annuler la commande</Text>
              </TouchableOpacity>
            </>
          )}
          {order.statut === 'preparing' && (
            <TouchableOpacity
              style={styles.primaryButton}
              disabled={submitting}
              onPress={() => router.push({ pathname: '/(pharmacy)/prepare/[id]' as any, params: { id: order.id.toString() } })}
            >
              <Text style={styles.primaryButtonText}>Continuer la préparation</Text>
            </TouchableOpacity>
          )}
          {order.statut === 'ready' && (
            <TouchableOpacity style={styles.primaryButton} disabled={submitting} onPress={() => updateStatus('picked_up')}>
              <Text style={styles.primaryButtonText}>Marquer comme collectée</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  statusBanner: { margin: spacing.md, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15' },
  statusBannerText: { color: colors.primary, fontWeight: '700', textAlign: 'center' },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.xs },
  infoText: { color: colors.textSecondary },
  totalValue: { color: colors.primary, fontWeight: '700', fontSize: fontSize.xl, marginBottom: spacing.xs },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  linkButtonText: { color: colors.primary, fontWeight: '700' },
  actionsSection: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: colors.error + '15', paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  secondaryButtonText: { color: colors.error, fontWeight: '700' },
  errorText: { color: colors.text, marginTop: spacing.md },
});
