import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { api } from '../../src/services/api';
import AppPopup from '../../src/components/ui/AppPopup';

type PharmacyFilter = 'all' | 'garde' | 'standard';
type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};
type PopupConfig = Omit<PopupState, 'visible'>;

export default function PharmaciesManagement() {
  const [activeFilter, setActiveFilter] = useState<PharmacyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showPopup = (next: PopupConfig) => {
    setPopup({ ...next, visible: true });
  };

  const loadPharmacies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPharmacies(await api.pharmacies.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des pharmacies');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPharmacies();
    }, [loadPharmacies])
  );

  useEffect(() => {
    if (error) {
      showPopup({
        title: 'Erreur pharmacies',
        message: error,
        variant: 'error',
      });
    }
  }, [error]);

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((pharmacy) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'garde' && pharmacy.estDeGarde) ||
        (activeFilter === 'standard' && !pharmacy.estDeGarde);

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        (pharmacy.raisonSociale ?? '').toLowerCase().includes(query) ||
        (pharmacy.adresse ?? '').toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, pharmacies, searchQuery]);

  const handleToggleGarde = async (pharmacy: any) => {
    try {
      await api.pharmacies.updateGarde(pharmacy.id, !pharmacy.estDeGarde);
      await loadPharmacies();
      showPopup({
        title: 'Statut mis à jour',
        message: `${pharmacy.raisonSociale} a été mis à jour.`,
        variant: 'success',
      });
    } catch (err) {
      showPopup({
        title: 'Mise à jour impossible',
        message: err instanceof Error ? err.message : 'Erreur serveur',
        variant: 'error',
      });
    }
  };

  const handleDelete = (pharmacy: any) => {
    showPopup({
      title: 'Supprimer cette pharmacie',
      message: pharmacy.raisonSociale ?? 'Pharmacie',
      variant: 'error',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      onConfirm: async () => {
        try {
          await api.pharmacies.delete(pharmacy.id);
          await loadPharmacies();
          showPopup({
            title: 'Suppression réussie',
            message: 'La pharmacie a été supprimée.',
            variant: 'success',
          });
        } catch (err) {
          showPopup({
            title: 'Suppression impossible',
            message: err instanceof Error ? err.message : 'Erreur serveur',
            variant: 'error',
          });
        }
      },
    });
  };

  if (loading && pharmacies.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && pharmacies.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        buttonLabel={popup.confirmLabel ?? 'OK'}
        secondaryButtonLabel={popup.cancelLabel}
        onPrimaryAction={() => {
          const action = popup.onConfirm;
          setPopup((current) => ({ ...current, visible: false, onConfirm: undefined, cancelLabel: undefined, confirmLabel: undefined }));
          action?.();
        }}
        onSecondaryAction={() => setPopup((current) => ({ ...current, visible: false, onConfirm: undefined, cancelLabel: undefined, confirmLabel: undefined }))}
        onClose={() => setPopup((current) => ({ ...current, visible: false, onConfirm: undefined, cancelLabel: undefined, confirmLabel: undefined }))}
      />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une pharmacie"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={loadPharmacies}>
            <Ionicons name="refresh" size={18} color={colors.success} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'garde', label: 'De garde' },
          { key: 'standard', label: 'Standards' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.tab, activeFilter === filter.key && styles.activeTab]}
            onPress={() => setActiveFilter(filter.key as PharmacyFilter)}
          >
            <Text style={[styles.tabText, activeFilter === filter.key && styles.activeTabText]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPharmacies}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="medical" size={22} color={item.estDeGarde ? colors.success : colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.raisonSociale}</Text>
              <Text style={styles.meta}>{item.adresse}</Text>
              <Text style={styles.meta}>{item.horaires || 'Horaires non renseignés'}</Text>
              <Text style={styles.meta}>ID: {item.id} • Agrément: {item.numeroAgrement || '-'}</Text>
              <View style={styles.row}>
                <View style={[styles.badge, { backgroundColor: (item.estDeGarde ? colors.success : colors.info) + '20' }]}>
                  <Text style={[styles.badgeText, { color: item.estDeGarde ? colors.success : colors.info }]}>
                    {item.estDeGarde ? 'De garde' : 'Active'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleGarde(item)}>
                  <Text style={styles.actionText}>{item.estDeGarde ? 'Retirer garde' : 'Mettre de garde'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                  <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucune pharmacie trouvée.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { color: colors.error, textAlign: 'center' },
  emptyText: { color: colors.textSecondary },
  searchContainer: { padding: spacing.md, backgroundColor: colors.card },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.text },
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  activeTab: { backgroundColor: colors.success },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  badge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontWeight: '700', fontSize: fontSize.xs },
  actionButton: { backgroundColor: colors.background, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  actionText: { color: colors.text, fontWeight: '600', fontSize: fontSize.xs },
  deleteButton: { backgroundColor: colors.error + '12' },
  deleteText: { color: colors.error },
});
