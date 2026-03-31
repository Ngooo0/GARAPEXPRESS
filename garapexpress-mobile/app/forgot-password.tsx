import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import api from '../src/services/api';

type ResetMethod = 'sms' | 'email';
type Step = 'method' | 'phone' | 'code' | 'email_input' | 'email_code' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<ResetMethod>('sms');
  const [step, setStep] = useState<Step>('method');
  
  // SMS fields
  const [telephone, setTelephone] = useState('');
  const [code, setCode] = useState('');
  
  // Email fields
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  
  // Password fields
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoBack = () => {
    if (step === 'method') {
      // For step 'method', try to go back using replace to login
      router.replace('/login');
    } else if (step === 'phone' || step === 'email_input') {
      setStep('method');
    } else if (step === 'code' || step === 'email_code') {
      setStep(method === 'sms' ? 'phone' : 'email_input');
    } else if (step === 'password') {
      setStep(method === 'sms' ? 'code' : 'email_code');
    }
  };

  const handleSendCode = async () => {
    if (method === 'sms') {
      if (!telephone.trim()) {
        Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
        return;
      }

      const phoneRegex = /^(?:\+221|221)?[78]\d{8}$/;
      const formattedPhone = telephone.replace(/\s/g, '');
      if (!phoneRegex.test(formattedPhone)) {
        Alert.alert('Erreur', 'Numéro de téléphone invalide');
        return;
      }

      try {
        setLoading(true);
        const result = await api.utilisateurs.forgotPassword(formattedPhone);
        
        if (result?.success) {
          Alert.alert(
            'Code envoyé',
            `Code de vérification: ${result.code || 'XXXXXX'}`,
            [{ text: 'OK', onPress: () => setStep('code') }]
          );
        } else {
          Alert.alert('Erreur', result?.message || 'Impossible d\'envoyer le code');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    } else {
      // Email method
      if (!email.trim()) {
        Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Erreur', 'Adresse email invalide');
        return;
      }

      try {
        setLoading(true);
        const result = await api.utilisateurs.forgotPasswordByEmail(email);
        
        if (result?.success) {
          Alert.alert(
            'Email envoyé',
            'Un code de vérification a été envoyé à votre adresse email.',
            [{ text: 'OK', onPress: () => setStep('email_code') }]
          );
        } else {
          Alert.alert('Erreur', result?.message || 'Impossible d\'envoyer l\'email');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      Alert.alert('Erreur', 'Le code doit contenir 6 chiffres');
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!nouveauMotDePasse) {
      Alert.alert('Erreur', 'Veuillez entrer un nouveau mot de passe');
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (nouveauMotDePasse !== confirmMotDePasse) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      
      let result;
      if (method === 'sms') {
        result = await api.utilisateurs.resetPassword(telephone, code, nouveauMotDePasse);
      } else {
        result = await api.utilisateurs.resetPasswordByEmail(email, nouveauMotDePasse);
      }
      
      if (result?.success) {
        Alert.alert(
          'Succès',
          'Votre mot de passe a été réinitialisé',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else {
        Alert.alert('Erreur', result?.message || 'Impossible de réinitialiser le mot de passe');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  };

  const getStepTitle = () => {
    switch (step) {
      case 'method': return 'Mot de passe oublié ?';
      case 'phone': return 'Vérification par SMS';
      case 'code': return 'Code de vérification';
      case 'email_input': return 'Vérification par email';
      case 'email_code': return 'Code de vérification';
      case 'password': return 'Nouveau mot de passe';
      default: return 'Réinitialisation';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'method': return 'Choisissez comment vous souhaitez réinitialiser votre mot de passe';
      case 'phone': return 'Entrez votre numéro de téléphone pour recevoir un code de vérification';
      case 'code': return 'Entrez le code de vérification envoyé à votre téléphone';
      case 'email_input': return 'Entrez votre adresse email pour recevoir un code de vérification';
      case 'email_code': return 'Entrez le code de vérification envoyé à votre email';
      case 'password': return 'Entrez votre nouveau mot de passe';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flex: 1, padding: spacing.lg }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={handleGoBack} style={{ marginBottom: spacing.lg }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg }}>
              <Ionicons name="lock-closed" size={40} color={colors.primary} />
            </View>
            <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>
              {getStepTitle()}
            </Text>
            <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }}>
              {getStepDescription()}
            </Text>
          </View>

          {/* Étape: Sélection de la méthode */}
          {step === 'method' && (
            <View style={{ gap: spacing.md }}>
              <TouchableOpacity 
                onPress={() => setMethod('sms')}
                style={[
                  styles.methodCard,
                  method === 'sms' && styles.methodCardSelected
                ]}
              >
                <View style={styles.methodIconContainer}>
                  <Ionicons name="chatbubble" size={24} color={method === 'sms' ? colors.primary : colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.methodTitle, method === 'sms' && styles.methodTitleSelected]}>
                    Par SMS
                  </Text>
                  <Text style={styles.methodDescription}>
                    Recevoir un code par message texte
                  </Text>
                </View>
                {method === 'sms' && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setMethod('email')}
                style={[
                  styles.methodCard,
                  method === 'email' && styles.methodCardSelected
                ]}
              >
                <View style={styles.methodIconContainer}>
                  <Ionicons name="mail" size={24} color={method === 'email' ? colors.primary : colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.methodTitle, method === 'email' && styles.methodTitleSelected]}>
                    Par Email
                  </Text>
                  <Text style={styles.methodDescription}>
                    Recevoir un lien de réinitialisation
                  </Text>
                </View>
                {method === 'email' && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setStep(method === 'sms' ? 'phone' : 'email_input')}
                style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.lg }}
              >
                <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Continuer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Étape: Téléphone (SMS) */}
          {step === 'phone' && (
            <>
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Numéro de téléphone</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
                  <Text style={{ fontSize: fontSize.md, color: colors.text }}>+221 </Text>
                  <TextInput
                    style={{ flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text }}
                    placeholder="77 123 45 67"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={telephone}
                    onChangeText={setTelephone}
                    maxLength={14}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSendCode}
                disabled={loading}
                style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Envoyer le code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('method')} style={{ alignItems: 'center', marginTop: spacing.md }}>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>Changer de méthode</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Étape: Code de vérification (SMS) */}
          {step === 'code' && (
            <>
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Code de vérification</Text>
                <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
                  <TextInput
                    style={{ paddingVertical: spacing.md, fontSize: fontSize.lg, color: colors.text, textAlign: 'center', letterSpacing: 8 }}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={code}
                    onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleVerifyCode}
                style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.md }}
              >
                <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Vérifier le code</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('phone')} style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>Renvoyer le code</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Étape: Email input */}
          {step === 'email_input' && (
            <>
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Adresse email</Text>
                <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
                  <TextInput
                    style={{ paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text }}
                    placeholder="exemple@email.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSendCode}
                disabled={loading}
                style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Envoyer le code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('method')} style={{ alignItems: 'center', marginTop: spacing.md }}>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>Changer de méthode</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Étape: Code de vérification (Email) */}
          {step === 'email_code' && (
            <>
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Code de vérification</Text>
                <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
                  <TextInput
                    style={{ paddingVertical: spacing.md, fontSize: fontSize.lg, color: colors.text, textAlign: 'center', letterSpacing: 8 }}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={emailCode}
                    onChangeText={(text) => setEmailCode(text.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  if (emailCode.length !== 6) {
                    Alert.alert('Erreur', 'Le code doit contenir 6 chiffres');
                    return;
                  }
                  setStep('password');
                }}
                style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.md }}
              >
                <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Vérifier le code</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('email_input')} style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>Renvoyer le code</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Étape: Nouveau mot de passe */}
          {step === 'password' && (
            <>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Nouveau mot de passe</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
                  <TextInput
                    style={{ flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text }}
                    placeholder="Nouveau mot de passe"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={nouveauMotDePasse}
                    onChangeText={setNouveauMotDePasse}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Confirmer le mot de passe</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
                  <TextInput
                    style={{ flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text }}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={confirmMotDePasse}
                    onChangeText={setConfirmMotDePasse}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleResetPassword}
                disabled={loading}
                style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Réinitialiser le mot de passe</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  methodTitleSelected: {
    color: colors.primary,
  },
  methodDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
