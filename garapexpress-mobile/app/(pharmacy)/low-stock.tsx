import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';
import api from '../../src/services/api';

type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

export default function LowStock() {
  const { user, medicines, loadingStates, errors, fetchMedicines } = useAppStore();
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState>({ visible: false, title: '', message: '', variant: 'info' });

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, [fetchMedicines])
  );

  const items = useMemo(
    () => medicines.filter((medicine) => medicine.pharmacieId === user?.id && medicine.stock < 20),
    [medicines, user?.id]
  );

  const criticalCount = items.filter((item) => item.stock <= 5).length;

  const handleRestock = async (catalogueId: number, currentStock: number, nom: string) => {
    try {
      setSubmittingId(catalogueId);
      await api.catalogues.update(catalogueId, {
        quantiteStock: currentStock + 25,
        disponibilite: true,
      });
      await fetchMedicines();
      setPopup({
        visible: true,
        title: 'Stock mis à jour',
        message: `${nom} a été réapprovisionné.`,
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du réapprovisionnement';
      setPopup({ visible: true, title: 'Action impossible', message, variant: 'error' });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loadingStates.medicine && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.medicine && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{errors.medicine}</Text>
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
        <Text style={styles.headerTitle}>Stock faible</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.alertSummary}>
        <Ionicons name="warning" size={28} color={colors.warning} />
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>{items.length} produit(s) à surveiller</Text>
          <Text style={styles.alertDescription}>{criticalCount} en niveau critique</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.catalogueId}-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.nom}</Text>
              <Text style={{ color: item.stock <= 5 ? colors.error : colors.warning, fontWeight: '700' }}>
                {item.stock} unités
              </Text>
            </View>
            <Text style={styles.meta}>{item.categorie}</Text>
            <Text style={styles.meta}>DCI: {item.DCI}</Text>
            <Text style={styles.meta}>Disponibilité: {item.disponibilite ? 'Disponible' : 'Rupture'}</Text>
            <TouchableOpacity
              style={[styles.button, submittingId === item.catalogueId && { opacity: 0.6 }]}
              onPress={() => handleRestock(item.catalogueId, item.stock, item.nom)}
              disabled={submittingId === item.catalogueId}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.buttonText}>
                {submittingId === item.catalogueId ? 'Mise à jour...' : 'Réapprovisionner (+25)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>Aucun produit en stock faible.</Text>
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
  alertSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '15', margin: spacing.md, padding: spacing.md, borderRadius: borderRadius.md, gap: spacing.md },
  alertTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.warning },
  alertDescription: { color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontWeight: '700', fontSize: fontSize.md },
  meta: { color: colors.textSecondary, marginTop: spacing.xs },
  button: { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.xs },
  buttonText: { color: '#fff', fontWeight: '700' },
});
