import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';

const menuItems = [
  { icon: 'person-outline', label: 'Informations personnelles', route: '' },
  { icon: 'location-outline', label: 'Adresses enregistrées', route: '' },
  { icon: 'card-outline', label: 'Moyens de paiement', route: '' },
  { icon: 'document-text-outline', label: 'Ordonnances', route: '/prescription' },
  { icon: 'heart-outline', label: 'Favoris', route: '' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
  { icon: 'shield-checkmark-outline', label: 'Confidentialité', route: '' },
  { icon: 'help-circle-outline', label: 'Aide & Support', route: '/support' },
];

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

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) => state.user);
  const orders = useAppStore((state) => state.orders);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const clientOrders = useMemo(
    () => orders.filter((order) => order.clientId === user?.id),
    [orders, user?.id]
  );

  const initials = useMemo(() => {
    const first = user?.prenom?.trim()?.[0] || user?.nom?.trim()?.[0] || 'U';
    const second = user?.nom?.trim()?.[0] || user?.prenom?.trim()?.[0] || '';
    return `${first}${second}`.toUpperCase();
  }, [user?.nom, user?.prenom]);

  const displayName = useMemo(() => {
    const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim();
    return fullName || 'Utilisateur';
  }, [user?.nom, user?.prenom]);

  const deliveredOrders = clientOrders.filter((order) => order.statut === 'delivered').length;
  const activeOrders = clientOrders.filter((order) => !['delivered', 'cancelled'].includes(order.statut)).length;
  const totalSpent = clientOrders.reduce((sum, order) => sum + order.montantTotal, 0);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
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
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>Profil</Text>
        </View>

        <TouchableOpacity
          onPress={() => {}}
          style={{
            margin: spacing.md,
            backgroundColor: colors.card,
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: 'bold' }}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text }}>{displayName}</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
              {user?.telephone || 'Téléphone indisponible'}
            </Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.primary, marginTop: 2 }}>
              {user?.email || 'Email indisponible'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ paddingHorizontal: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: borderRadius.xl,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.primary }}>{clientOrders.length}</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Commandes</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: borderRadius.xl,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.primary }}>{activeOrders}</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>En cours</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: borderRadius.xl,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.primary }}>{deliveredOrders}</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Livrées</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginHorizontal: spacing.md,
            marginTop: spacing.md,
            backgroundColor: colors.card,
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Total dépensé</Text>
          <Text style={{ marginTop: 4, fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(totalSpent)}
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg, gap: spacing.sm }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => item.route && router.push(item.route as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, marginLeft: spacing.md, fontSize: fontSize.md, color: colors.text }}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            margin: spacing.md,
            backgroundColor: colors.card,
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="notifications" size={20} color={colors.primary} />
            </View>
            <Text style={{ marginLeft: spacing.md, fontSize: fontSize.md, color: colors.text }}>Notifications push</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            margin: spacing.md,
            marginTop: 0,
            backgroundColor: colors.error + '15',
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={{ marginLeft: spacing.sm, fontSize: fontSize.md, color: colors.error, fontWeight: '600' }}>Déconnexion</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
