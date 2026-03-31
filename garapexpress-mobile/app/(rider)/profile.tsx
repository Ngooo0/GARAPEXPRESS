import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';

type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  buttonLabel?: string;
  secondaryButtonLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

export default function RiderProfile() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) => state.user);
  const deliveries = useAppStore((state) => state.deliveries);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const initials = useMemo(() => {
    const first = user?.prenom?.trim()?.[0] || user?.nom?.trim()?.[0] || 'L';
    const second = user?.nom?.trim()?.[0] || '';
    return `${first}${second}`.toUpperCase();
  }, [user?.nom, user?.prenom]);

  const displayName = useMemo(() => {
    const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim();
    return fullName || 'Livreur';
  }, [user?.nom, user?.prenom]);

  const deliveredCount = deliveries.filter((delivery) => delivery.statut === 'delivered').length;
  const activeCount = deliveries.filter((delivery) => !['delivered', 'cancelled'].includes(delivery.statut)).length;
  const acceptanceRate = deliveries.length > 0 ? Math.round((deliveredCount / deliveries.length) * 100) : 0;
  const averageEarnings =
    deliveredCount > 0
      ? Math.round(
          deliveries
            .filter((delivery) => delivery.statut === 'delivered')
            .reduce((sum, delivery) => sum + ((delivery.commande?.montantTotal ?? 0) * 0.15), 0) / deliveredCount
        )
      : 0;

  const closePopup = () => {
    setPopup((current) => ({
      ...current,
      visible: false,
      onPrimaryAction: undefined,
      onSecondaryAction: undefined,
      buttonLabel: undefined,
      secondaryButtonLabel: undefined,
    }));
  };

  const handleLogout = () => {
    setPopup({
      visible: true,
      title: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      variant: 'info',
      buttonLabel: 'Déconnexion',
      secondaryButtonLabel: 'Annuler',
      onPrimaryAction: async () => {
        closePopup();
        await logout();
        router.replace('/login');
      },
      onSecondaryAction: closePopup,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        buttonLabel={popup.buttonLabel}
        secondaryButtonLabel={popup.secondaryButtonLabel}
        onPrimaryAction={popup.onPrimaryAction}
        onSecondaryAction={popup.onSecondaryAction}
        onClose={closePopup}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.rating}>{activeCount} active(s)</Text>
            <Text style={styles.deliveries}>• {deliveredCount} livraisons terminées</Text>
          </View>
          <Text style={styles.memberSince}>{user?.email || 'Email indisponible'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{deliveredCount}</Text>
            <Text style={styles.statLabel}>Livraisons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{acceptanceRate}%</Text>
            <Text style={styles.statLabel}>Taux de réussite</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{averageEarnings}</Text>
            <Text style={styles.statLabel}>Gain moyen</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user?.telephone || 'Téléphone indisponible'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user?.email || 'Email indisponible'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parcours livreur</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(rider)/available')}>
              <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuText}>Livraisons disponibles</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(rider)/history')}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuText}>Historique</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(rider)/earnings')}>
              <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuText}>Gains</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.border, true: colors.primary + '80' }} thumbColor={colors.primary} />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.settingText}>Suivi de position</Text>
              </View>
              <Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ false: colors.border, true: colors.primary + '80' }} thumbColor={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text },
  profileCard: { alignItems: 'center', paddingVertical: spacing.lg, backgroundColor: colors.card, marginHorizontal: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: fontSize.xxl, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  rating: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text, marginLeft: 4 },
  deliveries: { fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: 4 },
  memberSince: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  statsContainer: { flexDirection: 'row', backgroundColor: colors.card, marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  infoText: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.md, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  menuText: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.md, color: colors.text },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { marginLeft: spacing.md, fontSize: fontSize.md, color: colors.text },
  logoutSection: { paddingHorizontal: spacing.md, marginTop: spacing.xl },
  logoutButton: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.error + '20' },
  logoutText: { color: colors.error, fontSize: fontSize.md, fontWeight: '600', marginLeft: spacing.sm },
});
