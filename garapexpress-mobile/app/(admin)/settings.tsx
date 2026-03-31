import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const SettingItem = ({ icon, iconColor, title, subtitle, onPress, showArrow = true, rightElement }: SettingItemProps) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
    </View>
    {rightElement || (showArrow ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null)}
  </TouchableOpacity>
);

export default function Settings() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const profileName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim() || user?.nom || 'Admin';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const showPlaceholder = (title: string) => {
    Alert.alert(title, 'Cette action UI est prête, mais la fonctionnalité détaillée n’est pas encore branchée au backend.');
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>{profileName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email indisponible'}</Text>
            <Text style={styles.profilePhone}>{user?.telephone || 'téléphone indisponible'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(admin)/users' as any)}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <SettingSection title="Paramètres de l'Application">
          <SettingItem
            icon="notifications"
            iconColor={colors.primary}
            title="Notifications Push"
            subtitle="Recevoir des alertes admin en temps réel"
            onPress={() => setNotifications((value) => !value)}
            showArrow={false}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={notifications ? colors.primary : colors.textMuted}
              />
            }
          />
          <SettingItem
            icon="mail"
            iconColor={colors.info}
            title="Notifications Email"
            subtitle="Recevoir les rapports par email"
            onPress={() => setEmailNotifications((value) => !value)}
            showArrow={false}
            rightElement={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.border, true: colors.info + '60' }}
                thumbColor={emailNotifications ? colors.info : colors.textMuted}
              />
            }
          />
          <SettingItem
            icon="volume-high"
            iconColor={colors.warning}
            title="Son"
            subtitle="Activer les sons pour les incidents urgents"
            onPress={() => setSoundEnabled((value) => !value)}
            showArrow={false}
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: colors.warning + '60' }}
                thumbColor={soundEnabled ? colors.warning : colors.textMuted}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Gestion Admin">
          <SettingItem
            icon="people"
            iconColor={colors.primary}
            title="Gestion des Utilisateurs"
            subtitle="Clients, admins et livreurs"
            onPress={() => router.push('/(admin)/users' as any)}
          />
          <SettingItem
            icon="medical"
            iconColor={colors.success}
            title="Gestion des Pharmacies"
            subtitle="Modifier, activer la garde et supprimer"
            onPress={() => router.push('/(admin)/pharmacies' as any)}
          />
          <SettingItem
            icon="bicycle"
            iconColor="#8B5CF6"
            title="Gestion des Livreurs"
            subtitle="Disponibilité et suivi"
            onPress={() => router.push('/(admin)/riders' as any)}
          />
          <SettingItem
            icon="receipt"
            iconColor={colors.info}
            title="Commandes"
            subtitle="Suivre les commandes en cours et terminées"
            onPress={() => router.push('/(admin)/orders' as any)}
          />
          <SettingItem
            icon="warning"
            iconColor={colors.error}
            title="Incidents et alertes"
            subtitle="Notifications urgentes et signalements"
            onPress={() => router.push('/(admin)/complaints' as any)}
          />
          <SettingItem
            icon="stats-chart"
            iconColor={colors.warning}
            title="Statistiques"
            subtitle="Commandes, performances et revenus"
            onPress={() => router.push('/(admin)/analytics' as any)}
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingItem
            icon="document-text"
            iconColor={colors.warning}
            title="Rapports"
            subtitle="Exporter ou consulter les rapports"
            onPress={() => showPlaceholder('Rapports')}
          />
          <SettingItem
            icon="chatbubbles"
            iconColor={colors.success}
            title="Support"
            subtitle="Contacter l’équipe technique"
            onPress={() => showPlaceholder('Support')}
          />
          <SettingItem
            icon="information-circle"
            iconColor={colors.primary}
            title="À propos"
            subtitle="Version 1.0.0"
            onPress={() => showPlaceholder('À propos')}
          />
        </SettingSection>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
