import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { api } from '../../src/services/api';
import AppPopup from '../../src/components/ui/AppPopup';

type RiderFilter = 'all' | 'available' | 'busy';
type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

export default function RidersManagement() {
  const [activeFilter, setActiveFilter] = useState<RiderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riders, setRiders] = useState<any[]>([]);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  const loadRiders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRiders(await api.stats.getLivreurs());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des livreurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRiders();
    }, [loadRiders])
  );

  useEffect(() => {
    if (error) {
      showPopup('Erreur livreurs', error, 'error');
    }
  }, [error]);

  const filteredRiders = useMemo(() => {
    return riders.filter((rider) => {
      const availability = rider.disponibilite ? 'available' : 'busy';
      const matchesFilter = activeFilter === 'all' || availability === activeFilter;
      const fullName = `${rider.prenom ?? ''} ${rider.nom ?? ''}`.trim().toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || fullName.includes(query) || (rider.vehicule ?? '').toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, riders, searchQuery]);

  const handleToggleAvailability = async (rider: any) => {
    try {
      await api.utilisateurs.updateLivreurDisponibilite(rider.id, !rider.disponibilite);
      await loadRiders();
      showPopup(
        'Disponibilité mise à jour',
        `${rider.prenom ?? 'Le livreur'} est maintenant ${rider.disponibilite ? 'occupé' : 'disponible'}.`,
        'success'
      );
    } catch (err) {
      showPopup('Mise à jour impossible', err instanceof Error ? err.message : 'Erreur serveur', 'error');
    }
  };

  if (loading && riders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && riders.length === 0) {
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
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un livreur"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={loadRiders}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'available', label: 'Disponibles' },
          { key: 'busy', label: 'Occupés' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.tab, activeFilter === filter.key && styles.activeTab]}
            onPress={() => setActiveFilter(filter.key as RiderFilter)}
          >
            <Text style={[styles.tabText, activeFilter === filter.key && styles.activeTabText]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRiders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Ionicons name="bicycle" size={20} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{`${item.prenom ?? ''} ${item.nom ?? ''}`.trim()}</Text>
              <Text style={styles.meta}>{item.vehicule || 'Véhicule non renseigné'}</Text>
              <Text style={styles.meta}>{item.totalLivraisons} livraisons • note {item.noteMoyenne ?? 0}</Text>
              <View style={styles.row}>
                <View style={[styles.badge, { backgroundColor: (item.disponibilite ? colors.success : colors.warning) + '20' }]}>
                  <Text style={[styles.badgeText, { color: item.disponibilite ? colors.success : colors.warning }]}>
                    {item.disponibilite ? 'Disponible' : 'Occupé'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleAvailability(item)}>
                  <Text style={styles.actionText}>{item.disponibilite ? 'Mettre occupé' : 'Rendre disponible'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    showPopup(
                      `${item.prenom ?? ''} ${item.nom ?? ''}`.trim() || 'Livreur',
                      `Véhicule: ${item.vehicule ?? '-'}\nLivraisons: ${item.totalLivraisons}\nNote: ${item.noteMoyenne ?? 0}`,
                      'info'
                    )
                  }
                >
                  <Text style={styles.actionText}>Détails</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucun livreur trouvé.</Text>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.text },
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  activeTab: { backgroundColor: '#8B5CF6' },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  badge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontWeight: '700', fontSize: fontSize.xs },
  actionButton: { backgroundColor: colors.background, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  actionText: { color: colors.text, fontWeight: '600', fontSize: fontSize.xs },
});
