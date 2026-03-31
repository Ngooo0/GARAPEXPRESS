import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import { getRouteForRole } from '../src/utils/auth';
import AppPopup from '../src/components/ui/AppPopup';

type SignupRole = 'client' | 'pharmacy' | 'livreur' | 'admin';
type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

type FieldErrors = {
  [key: string]: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const register = useAppStore((state) => state.register);
  const [role, setRole] = useState<SignupRole>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    motDePasse: '',
    adresse: '',
    vehicule: '',
    immatriculation: '',
    raisonSociale: '',
    numeroAgrement: '',
    horaires: '24h/24',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    // Clear error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  const payload = useMemo(() => {
    if (role === 'pharmacy') {
      return {
        role,
        raisonSociale: form.raisonSociale,
        adresse: form.adresse,
        numeroAgrement: form.numeroAgrement,
        telephone: form.telephone,
        email: form.email.trim().toLowerCase(), // Email insensible à la casse
        motDePasse: form.motDePasse,
        horaires: form.horaires,
      };
    }

    if (role === 'livreur') {
      return {
        role,
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        email: form.email.trim().toLowerCase(),
        motDePasse: form.motDePasse,
        vehicule: form.vehicule || 'Moto',
        immatriculation: form.immatriculation || 'SN-0000-AA',
      };
    }

    if (role === 'admin') {
      return {
        role,
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        email: form.email.trim().toLowerCase(),
        motDePasse: form.motDePasse,
      };
    }

    return {
      role,
      nom: form.nom,
      prenom: form.prenom,
      telephone: form.telephone,
      email: form.email.trim().toLowerCase(),
      motDePasse: form.motDePasse,
      adresse: form.adresse,
    };
  }, [form, role]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // Validation conditions
    if (!acceptedTerms) {
      showPopup('Inscription incomplète', 'Veuillez accepter les conditions d’utilisation.', 'error');
      return false;
    }

    // Validation selon le rôle
    if (role === 'pharmacy') {
      if (!form.raisonSociale.trim()) {
        errors.raisonSociale = 'La raison sociale est obligatoire';
      }
      if (!form.adresse.trim()) {
        errors.adresse = 'L\'adresse est obligatoire';
      }
      if (!form.numeroAgrement.trim()) {
        errors.numeroAgrement = 'Le numéro d\'agrément est obligatoire';
      }
    } else {
      if (!form.nom.trim()) {
        errors.nom = 'Le nom est obligatoire';
      }
      if (!form.prenom.trim()) {
        errors.prenom = 'Le prénom est obligatoire';
      }
    }

    // Téléphone
    if (!form.telephone.trim()) {
      errors.telephone = 'Le numéro de téléphone est obligatoire';
    } else if (form.telephone.trim().length < 8) {
      errors.telephone = 'Numéro de téléphone invalide';
    }

    // Email
    if (!form.email.trim()) {
      errors.email = 'L\'email est obligatoire';
    } else if (!form.email.includes('@') || !form.email.includes('.')) {
      errors.email = 'Adresse email invalide';
    }

    // Mot de passe
    if (!form.motDePasse.trim()) {
      errors.motDePasse = 'Le mot de passe est obligatoire';
    } else if (form.motDePasse.trim().length < 6) {
      errors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Adresse pour client
    if (role === 'client' && !form.adresse.trim()) {
      errors.adresse = 'L\'adresse est obligatoire';
    }

    // Véhicule pour livreur
    if (role === 'livreur' && !form.vehicule.trim()) {
      errors.vehicule = 'Le véhicule est obligatoire';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const normalizedPayload = {
        ...payload,
        email: form.email.trim().toLowerCase(),
        telephone: form.telephone.trim(),
        motDePasse: form.motDePasse.trim(),
      };
      await register(normalizedPayload);
      showPopup('Compte créé', 'Votre inscription a été enregistrée avec succès.', 'success');
      setTimeout(() => {
        router.replace(getRouteForRole(useAppStore.getState().user?.role));
      }, 700);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
      showPopup('Inscription impossible', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    key: keyof typeof form,
    options?: { 
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric'; 
      secure?: boolean;
      multiline?: boolean;
    }
  ) => {
    const hasError = fieldErrors[key];
    const isPassword = options?.secure;
    
    return (
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>
          {label}<Text style={{ color: colors.error }}> *</Text>
        </Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: hasError ? colors.error : colors.border,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              paddingRight: isPassword ? 50 : spacing.md,
              color: colors.text,
              fontSize: fontSize.md,
              minHeight: options?.multiline ? 80 : 50,
              textAlignVertical: options?.multiline ? 'top' : 'center',
            }}
            value={form[key]}
            onChangeText={(value) => updateField(key, value)}
            keyboardType={options?.keyboardType}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize={key === 'email' ? 'none' : 'sentences'}
            editable={!isLoading}
            multiline={options?.multiline}
            placeholderTextColor={colors.textMuted}
          />
          {isPassword && (
            <TouchableOpacity
              style={{ position: 'absolute', right: 15, top: 15 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          )}
        </View>
        {hasError && (
          <Text style={{ fontSize: fontSize.xs, color: colors.error, marginTop: spacing.xs }}>
            {fieldErrors[key]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: fontSize.xxl, fontWeight: '700', color: colors.text }}>Créer un compte</Text>
            <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.sm }}>
              Choisissez votre profil puis renseignez les informations nécessaires.
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.lg }}>
            {[
              { key: 'client', label: 'Client' },
              { key: 'pharmacy', label: 'Pharmacie' },
              { key: 'livreur', label: 'Livreur' },
              { key: 'admin', label: 'Admin' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setRole(item.key as SignupRole)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.full,
                  backgroundColor: role === item.key ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: role === item.key ? colors.primary : colors.border,
                }}
              >
                <Text style={{ color: role === item.key ? '#fff' : colors.text, fontWeight: '600' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {role === 'pharmacy' ? (
            <>
              {renderInput('Raison sociale', 'raisonSociale')}
              {renderInput('Adresse', 'adresse')}
              {renderInput("Numéro d'agrément", 'numeroAgrement')}
              {renderInput('Téléphone', 'telephone', { keyboardType: 'phone-pad' })}
              {renderInput('Email', 'email', { keyboardType: 'email-address' })}
              {renderInput('Horaires', 'horaires')}
              {renderInput('Mot de passe', 'motDePasse', { secure: true })}
            </>
          ) : (
            <>
              {renderInput('Nom', 'nom')}
              {renderInput('Prénom', 'prenom')}
              {renderInput('Téléphone', 'telephone', { keyboardType: 'phone-pad' })}
              {renderInput('Email', 'email', { keyboardType: 'email-address' })}
              {role === 'client' && renderInput('Adresse', 'adresse')}
              {role === 'livreur' && renderInput('Véhicule', 'vehicule')}
              {role === 'livreur' && renderInput('Immatriculation', 'immatriculation')}
              {renderInput('Mot de passe', 'motDePasse', { secure: true })}
            </>
          )}

          {/* Conditions d'utilisation - Version cliquable */}
          <TouchableOpacity 
            onPress={() => setAcceptedTerms((value) => !value)} 
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: acceptedTerms ? colors.success : colors.primary,
                backgroundColor: acceptedTerms ? colors.success : 'transparent',
                marginRight: spacing.sm,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {acceptedTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={{ flex: 1, color: colors.textSecondary }}>
              J'accepte les{' '}
              <Text 
                style={{ color: colors.primary, textDecorationLine: 'underline' }}
                onPress={() => router.push('/support')}
              >
                conditions d'utilisation
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              borderRadius: borderRadius.lg,
              paddingVertical: spacing.md,
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.md }}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>Déjà inscrit ? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
