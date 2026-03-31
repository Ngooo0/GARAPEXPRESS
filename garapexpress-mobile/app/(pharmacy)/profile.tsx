import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { formatPrice } from '../../src/utils/formatters';
import AppPopup from '../../src/components/ui/AppPopup';
import api from '../../src/services/api';

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

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIcon}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
    </View>
    {showArrow ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}
  </TouchableOpacity>
);

export default function PharmacyProfile() {
  const { user, pharmacies, medicines, orders, notifications, logout, fetchPharmacies } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoursDraft, setHoursDraft] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ visible: false, title: '', message: '', variant: 'info' });

  const pharmacy = useMemo(() => pharmacies.find((item) => item.id === user?.id) || null, [pharmacies, user?.id]);
  const pharmacyOrders = useMemo(() => orders.filter((order) => order.pharmacieId === user?.id), [orders, user?.id]);
  const pharmacyMedicines = useMemo(() => medicines.filter((medicine) => medicine.pharmacieId === user?.id), [medicines, user?.id]);
  const activeOrders = pharmacyOrders.filter((order) => !['delivered', 'cancelled'].includes(order.statut)).length;
  const totalRevenue = pharmacyOrders.reduce((sum, order) => sum + order.montantTotal, 0);
  const urgentNotifications = notifications.filter((notification) => !notification.lu).length;

  const showPopup = (config: Omit<PopupState, 'visible'>) => {
    setPopup({ visible: true, ...config });
  };

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

  const handleToggleGarde = async (value: boolean) => {
    if (!user?.id) return;

    try {
      setSaving(true);
      await api.pharmacies.updateGarde(user.id, value);
      await fetchPharmacies();
      showPopup({
        title: 'Statut de garde mis à jour',
        message: value ? 'La pharmacie est maintenant de garde.' : 'La pharmacie est retirée du mode garde.',
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showPopup({ title: 'Action impossible', message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenHoursEditor = () => {
    setHoursDraft(pharmacy?.horaires || '');
    setEditorVisible(true);
  };

  const handleSaveHours = async () => {
    if (!user?.id || !hoursDraft.trim()) {
      showPopup({ title: 'Horaires invalides', message: 'Veuillez saisir des horaires valides.', variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      await api.pharmacies.updateHoraires(user.id, hoursDraft.trim());
      await fetchPharmacies();
      setEditorVisible(false);
      showPopup({ title: 'Horaires mis à jour', message: 'Les horaires de la pharmacie ont été enregistrés.', variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showPopup({ title: 'Mise à jour impossible', message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    showPopup({
      title: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      variant: 'info',
      buttonLabel: 'Déconnexion',
      secondaryButtonLabel: 'Annuler',
      onPrimaryAction: async () => {
        closePopup();
        await logout();
        router.replace('/login' as any);
      },
      onSecondaryAction: closePopup,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
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

      <Modal visible={editorVisible} transparent animationType="fade" onRequestClose={() => setEditorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mettre à jour les horaires</Text>
            <TextInput
              style={styles.modalInput}
              value={hoursDraft}
              onChangeText={setHoursDraft}
              placeholder="Ex: 08:00 - 21:00"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setEditorVisible(false)}>
                <Text style={styles.modalSecondaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleSaveHours} disabled={saving}>
                <Text style={styles.modalPrimaryText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plus</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="medical" size={32} color={colors.card} />
            </View>
            <View style={styles.openBadge}>
              <View style={[styles.statusDot, { backgroundColor: pharmacy?.estDeGarde ? colors.warning : colors.success }]} />
              <Text style={styles.openText}>{pharmacy?.estDeGarde ? 'De garde' : 'Ouverte'}</Text>
            </View>
          </View>
          <Text style={styles.pharmacyName}>{pharmacy?.raisonSociale || user?.nom || 'Pharmacie'}</Text>
          <Text style={styles.memberSince}>{pharmacy?.adresse || 'Adresse indisponible'}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{pharmacyMedicines.length} produits</Text>
            <Text style={styles.statText}>• {pharmacyOrders.length} commandes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilotage</Text>
          <View style={styles.infoCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Commandes en attente</Text>
              <Text style={styles.summaryValue}>{activeOrders}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Revenus cumulés</Text>
              <Text style={styles.summaryValue}>{formatPrice(totalRevenue)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Notifications non lues</Text>
              <Text style={styles.summaryValue}>{urgentNotifications}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{pharmacy?.adresse || 'Adresse indisponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user?.email || pharmacy?.email || 'Email indisponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user?.telephone || pharmacy?.telephone || 'Téléphone indisponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{pharmacy?.horaires || 'Horaires indisponibles'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réglages pharmacie</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="moon-outline" size={20} color={colors.warning} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Pharmacie de garde</Text>
                <Text style={styles.menuSubtitle}>Activer le mode garde pour apparaître dans les recherches dédiées</Text>
              </View>
              <Switch value={!!pharmacy?.estDeGarde} onValueChange={handleToggleGarde} disabled={saving} />
            </View>
            <MenuItem icon="time-outline" title="Modifier les horaires" subtitle={pharmacy?.horaires || 'Définir les horaires'} onPress={handleOpenHoursEditor} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="cube-outline" title="Gérer le catalogue" subtitle="Ajouter, modifier ou supprimer les produits" onPress={() => router.push('/(pharmacy)/inventory' as any)} />
            <MenuItem icon="receipt-outline" title="Commandes et ordonnances" subtitle="Voir les commandes en attente" onPress={() => router.push('/(pharmacy)/orders' as any)} />
            <MenuItem icon="bicycle-outline" title="Suivi des livraisons" subtitle="Vérifier les livraisons associées" onPress={() => router.push('/(pharmacy)/delivery-follow' as any)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>Recevoir les alertes de commandes et livraisons</Text>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIcon, { backgroundColor: colors.error + '12' }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.error }]}>Déconnexion</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  profileCard: { backgroundColor: colors.card, alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md },
  avatarContainer: { alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.full, marginTop: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  openText: { color: colors.text, fontWeight: '700' },
  pharmacyName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  memberSince: { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statText: { color: colors.textSecondary, fontWeight: '600' },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  infoCard: { backgroundColor: colors.card, marginHorizontal: spacing.md, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: { flex: 1, color: colors.textSecondary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: colors.textSecondary },
  summaryValue: { color: colors.text, fontWeight: '700' },
  menuCard: { backgroundColor: colors.card, marginHorizontal: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1, marginLeft: spacing.md },
  menuTitle: { color: colors.text, fontWeight: '700' },
  menuSubtitle: { color: colors.textSecondary, marginTop: 2, fontSize: fontSize.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, backgroundColor: colors.background },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalPrimaryButton: { flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center' },
  modalPrimaryText: { color: '#fff', fontWeight: '700' },
  modalSecondaryButton: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  modalSecondaryText: { color: colors.text, fontWeight: '700' },
});
