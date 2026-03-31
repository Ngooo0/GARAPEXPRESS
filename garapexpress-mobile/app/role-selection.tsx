import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import type { Role } from '../src/types';

const roles = [
  { 
    id: 'client', 
    label: 'Client', 
    icon: 'person', 
    description: 'Commandez vos médicaments et faites-les livrer à domicile',
    color: colors.primary 
  },
  { 
    id: 'pharmacy', 
    label: 'Pharmacie', 
    icon: 'medical', 
    description: 'Gérez vos commandes et votre inventaire',
    color: '#8B5CF6' 
  },
  { 
    id: 'rider', 
    label: 'Livreur', 
    icon: 'bicycle', 
    description: 'Livrez les commandes et gagnez de l\'argent',
    color: colors.success 
  },
  { 
    id: 'admin', 
    label: 'Administrateur', 
    icon: 'shield-checkmark', 
    description: 'Gérez la plateforme et les utilisateurs',
    color: colors.text 
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();

  const setRole = useAppStore((state) => state.setRole);
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);

  const handleSelectRole = (roleId: Role) => {
    // Définir le rôle dans le store
    setRole(roleId);
    setAuthenticated(true);
    
    // Naviguer vers l'interface correspondante
    switch (roleId) {
      case 'client':
        router.replace('/(tabs)' as any);
        break;
      case 'rider':
        router.replace('/(rider)' as any);
        break;
      case 'pharmacy':
        router.replace('/(pharmacy)' as any);
        break;
      case 'admin':
        router.replace('/(admin)' as any);
        break;
      default:
        router.replace('/(tabs)' as any);
    }
  };

  const handleSkip = () => {
    // Par défaut, aller vers l'interface client
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flex: 1, padding: spacing.lg }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <Text style={{ fontSize: fontSize.xxxl }}>👋</Text>
          <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text, marginTop: spacing.md }}>
            Qui êtes-vous ?
          </Text>
          <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }}>
            Sélectionnez votre rôle pour continuer
          </Text>
        </View>

        {/* Roles */}
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {roles.map((role) => (
            <TouchableOpacity 
              key={role.id}
              onPress={() => handleSelectRole(role.id as Role)}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: colors.card, 
                borderRadius: borderRadius.xl, 
                padding: spacing.md, 
                borderWidth: 1, 
                borderColor: colors.border 
              }}
            >
              <View style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 28, 
                backgroundColor: role.color + '20', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Ionicons name={role.icon as any} size={28} color={role.color} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text }}>{role.label}</Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>{role.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Skip */}
        <TouchableOpacity 
          onPress={handleSkip}
          style={{ marginTop: spacing.xl, alignItems: 'center' }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Passer pour l'instant</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
