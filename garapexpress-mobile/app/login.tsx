import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppStore } from '../src/store/appStore';
import { getRouteForRole } from '../src/utils/auth';
import AppPopup from '../src/components/ui/AppPopup';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/theme';
import { API_BASE_URL } from '../src/services/apiConfig';

type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

type LoginRole = 'client' | 'pharmacy' | 'livreur' | 'admin';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });
  const login = useAppStore((s) => s.login);

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      showPopup('Champs requis', 'Veuillez entrer votre email et votre mot de passe.', 'error');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      showPopup('Email invalide', 'Veuillez saisir une adresse email valide.', 'error');
      return;
    }
    
    setIsLoading(true);
    console.log('Attempting login to:', API_BASE_URL, 'with role:', selectedRole);
    try {
      await login(normalizedEmail, normalizedPassword, selectedRole);
      const role = useAppStore.getState().user?.role;
      showPopup('Connexion réussie', 'Vous allez être redirigé vers votre espace.', 'success');
      setTimeout(() => {
        router.replace(getRouteForRole(role));
      }, 700);
    } catch (error: any) {
      // Afficher le vrai message d'erreur pour le debug
      let errorMessage = 'Erreur inconnue';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Login error (Error instance):', {
          message: error.message,
          cause: (error as any).cause,
          stack: error.stack,
        });
      } else if (typeof error === 'string') {
        errorMessage = error;
        console.error('Login error (string):', error);
      } else if (error && typeof error === 'object') {
        errorMessage = error.message || error.error || JSON.stringify(error);
        console.error('Login error (object):', error);
      } else {
        console.error('Login error (unknown):', error);
      }
      
      showPopup('Connexion impossible', errorMessage || 'Email ou mot de passe incorrect. Vérifiez que le serveur backend est actif.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { key: 'client', label: 'Client', icon: '' },
    { key: 'pharmacy', label: 'Pharmacie', icon: '' },
    { key: 'livreur', label: 'Livreur', icon: '' },
    { key: 'admin', label: 'Admin', icon: '' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Garap<Text style={styles.logoAccent}>Express</Text></Text>
            </View>
            <Text style={styles.subtitle}>Votre pharmacie à domicile</Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Je me connecte en tant que</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.roleScroll}
            >
              {roleOptions.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setSelectedRole(item.key as LoginRole)}
                  disabled={isLoading}
                  style={[
                    styles.roleButton,
                    selectedRole === item.key && styles.roleButtonActive,
                  ]}
                >
                  <Text style={styles.roleIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.roleText,
                    selectedRole === item.key && styles.roleTextActive,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Entrez votre email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Input
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              secureTextEntry
              showPasswordToggle
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          {/* Login Button */}
          <View style={styles.actions}>
            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupText}>
                Pas encore de compte? <Text style={styles.signupHighlight}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>Mot de passe oublié?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  logoAccent: {
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleSection: {
    marginBottom: spacing.xl,
  },
  roleLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  roleScroll: {
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.sm,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleIcon: {
    fontSize: fontSize.lg,
  },
  roleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  roleTextActive: {
    color: colors.white,
  },
  form: {
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signupText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  signupHighlight: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  forgotLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
