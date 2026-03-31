import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: 'Comment passer une commande ?',
    answer: 'Pour passer une commande, recherchez le médicament souhaité, ajoutez-le au panier, puis suivez les étapes de paiement. Vous pouvez aussi upload votre ordonnance.',
  },
  {
    id: 2,
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les délais de livraison varient entre 30 minutes et 2 heures selon votre zone géographique et la disponibilité des médicaments.',
  },
  {
    id: 3,
    question: 'Comment payer mes commandes ?',
    answer: 'Vous pouvez payer via Mobile Money, Orange Money, ou espèces à la livraison. Tous les paiements sont sécurisés.',
  },
  {
    id: 4,
    question: 'Puis-je annuler ma commande ?',
    answer: 'Vous pouvez annuler votre commande si elle n\'a pas encore été préparée par la pharmacie. Contactez-nous rapidement.',
  },
  {
    id: 5,
    question: 'Commentupload mon ordonnance ?',
    answer: 'Lors de la commande, cliquez sur "Ajouter une ordonnance" et prenez une photo ou sélectionnez un fichier depuis votre galerie.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactOption = (option: 'chat' | 'call' | 'email') => {
    switch (option) {
      case 'chat':
        Alert.alert('Chat', 'Ouvrir le chat avec un agent...');
        break;
      case 'call':
        Linking.openURL('tel:+221771234567');
        break;
      case 'email':
        Linking.openURL('mailto:support@garapexpress.com');
        break;
    }
  };

  const handleSubmitContact = () => {
    if (!name || !email || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    Alert.alert('Succès', 'Votre message a été envoyé. Nous vous répondrons sous 24h.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous contacter</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={[styles.contactOption, { backgroundColor: '#22c55e20' }]}
              onPress={() => handleContactOption('chat')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#22c55e' }]}>
                <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.contactLabel}>Chat</Text>
              <Text style={styles.contactStatus}>Disponible</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactOption, { backgroundColor: '#3b82f620' }]}
              onPress={() => handleContactOption('call')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="call-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.contactLabel}>Appeler</Text>
              <Text style={styles.contactStatus}>24h/24</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactOption, { backgroundColor: '#ef444420' }]}
              onPress={() => handleContactOption('email')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#ef4444' }]}>
                <Ionicons name="mail-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactStatus}>Réponse 24h</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          <View style={styles.faqContainer}>
            {faqData.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons 
                    name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Envoyer un message</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez votre problème..."
                placeholderTextColor={colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmitContact}
            >
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Urgence médicale</Text>
          </View>
          <Text style={styles.emergencyText}>
            Pour toute urgence médicale, composez le 15 ou rendez-vous aux urgences les plus proches.
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:15')}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.emergencyButtonText}>Appeler le 15</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contactStatus: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  faqContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  faqAnswer: {
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  faqAnswerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  emergencySection: {
    backgroundColor: '#fef2f2',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: spacing.sm,
  },
  emergencyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  emergencyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
});
