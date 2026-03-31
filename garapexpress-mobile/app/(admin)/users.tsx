import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { api } from '../../src/services/api';
import { useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';

type UserTab = 'clients' | 'admins' | 'livreurs' | 'all';
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

function getUserRole(user: any): UserTab | 'other' {
  if (user.admin) return 'admins';
  if (user.client) return 'clients';
  if (user.livreur) return 'livreurs';
  return 'other';
}

export default function UsersManagement() {
  const { user: currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<UserTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showPopup = (next: PopupConfig) => {
    setPopup({ ...next, visible: true });
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsers(await api.utilisateurs.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  useEffect(() => {
    if (error) {
      showPopup({
        title: 'Erreur utilisateurs',
        message: error,
        variant: 'error',
      });
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const role = getUserRole(item);
      const matchesTab = activeTab === 'all' || role === activeTab;
      const fullName = `${item.prenom ?? ''} ${item.nom ?? ''}`.trim().toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        (item.email ?? '').toLowerCase().includes(query) ||
        (item.telephone ?? '').toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, users]);

  const handleDelete = (item: any) => {
    if (item.id === currentUser?.id) {
      showPopup({
        title: 'Action bloquée',
        message: 'Tu ne peux pas supprimer le compte admin actuellement connecté.',
        variant: 'error',
      });
      return;
    }

    showPopup({
      title: 'Supprimer cet utilisateur',
      message: `Confirmer la suppression de ${item.prenom ?? ''} ${item.nom ?? ''}`.trim(),
      variant: 'error',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      onConfirm: async () => {
        try {
          await api.utilisateurs.delete(item.id);
          await loadUsers();
          showPopup({
            title: 'Suppression réussie',
            message: 'L’utilisateur a été supprimé.',
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

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Nom, email ou téléphone"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity onPress={loadUsers}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'clients', label: 'Clients' },
          { key: 'livreurs', label: 'Livreurs' },
          { key: 'admins', label: 'Admins' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as UserTab)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const role = item.admin ? 'Admin' : item.client ? 'Client' : item.livreur ? 'Livreur' : 'Utilisateur';
          return (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.prenom?.[0] ?? item.nom?.[0] ?? 'U'}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.name}>{`${item.prenom ?? ''} ${item.nom ?? ''}`.trim()}</Text>
                <Text style={styles.meta}>{item.email}</Text>
                <Text style={styles.meta}>{item.telephone}</Text>
                <View style={styles.row}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{role}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      showPopup({
                        title: `${item.prenom ?? ''} ${item.nom ?? ''}`.trim() || 'Utilisateur',
                        message: `Role: ${role}\nEmail: ${item.email ?? '-'}\nTéléphone: ${item.telephone ?? '-'}`,
                        variant: 'info',
                      })
                    }
                  >
                    <Text style={styles.actionText}>Voir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                    <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
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
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, flexWrap: 'wrap' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  cardContent: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  meta: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  badge: { backgroundColor: colors.primary + '20', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { color: colors.primary, fontWeight: '600', fontSize: fontSize.xs },
  actionButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  actionText: { color: colors.text, fontWeight: '600', fontSize: fontSize.xs },
  deleteButton: { backgroundColor: colors.error + '12' },
  deleteText: { color: colors.error },
});
