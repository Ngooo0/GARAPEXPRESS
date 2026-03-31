import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { api } from '../../src/services/api';

type ComplaintTab = 'all' | 'open' | 'resolved';

export default function Complaints() {
  const [activeTab, setActiveTab] = useState<ComplaintTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications, loadingStates, errors, fetchNotifications } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const incidents = useMemo(() => {
    return notifications
      .filter((notification) => ['alert', 'system', 'order'].includes(notification.type))
      .map((notification) => ({
        id: notification.id.toString(),
        title: notification.type === 'alert' ? 'Alerte' : notification.type === 'system' ? 'Incident système' : 'Incident commande',
        message: notification.message,
        status: notification.lu ? 'resolved' : 'open',
        date: new Date(notification.dateEnvoi).toLocaleString('fr-FR'),
      }));
  }, [notifications]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesTab = activeTab === 'all' || incident.status === activeTab;
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || incident.title.toLowerCase().includes(query) || incident.message.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, incidents, searchQuery]);

  const openCount = incidents.filter((incident) => incident.status === 'open').length;
  const resolvedCount = incidents.filter((incident) => incident.status === 'resolved').length;

  const handleResolve = async (id: string) => {
    try {
      await api.notifications.markAsRead(Number(id));
      await fetchNotifications();
      Alert.alert('Incident mis à jour', 'Le signalement a été marqué comme résolu.');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de mettre à jour l’incident.');
    }
  };

  if (loadingStates.notification && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.notification && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error }}>{errors.notification}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: colors.error + '20' }]}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.statValue}>{openCount}</Text>
          <Text style={styles.statLabel}>Ouverts</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.statValue}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>Résolus</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un incident"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'open', label: 'Ouverts' },
          { key: 'resolved', label: 'Résolus' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as ComplaintTab)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={{ color: item.status === 'open' ? colors.error : colors.success, fontWeight: '700' }}>
                {item.status === 'open' ? 'Ouvert' : 'Résolu'}
              </Text>
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
            <View style={styles.actionsRow}>
              {item.status === 'open' && (
                <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(item.id)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                  <Text style={styles.resolveButtonText}>Marquer résolu</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>Aucun incident à afficher.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, backgroundColor: colors.card },
  statItem: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  searchContainer: { padding: spacing.md, backgroundColor: colors.card },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.sm, marginLeft: spacing.sm, color: colors.text },
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardMessage: { color: colors.textSecondary, marginTop: spacing.sm },
  cardDate: { color: colors.textMuted, marginTop: spacing.sm, fontSize: fontSize.xs },
  actionsRow: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'flex-end' },
  resolveButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resolveButtonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.xs },
});
