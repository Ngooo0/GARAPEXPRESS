import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Inscription Simple',
    description: 'Créez votre compte en quelques secondes. Ajoutez vos ordonnances etapez directement depuis chez vous.',
    icon: 'person-add-outline',
    iconColor: '#22c55e',
  },
  {
    id: 2,
    title: 'Livraison Rapide',
    description: 'Recevez vos médicaments chez vous dans les meilleurs délais. Suivez votre livraison en temps réel.',
    icon: 'car-outline',
    iconColor: '#3b82f6',
  },
  {
    id: 3,
    title: 'Paiement Sécurisé',
    description: 'Payez en toute sécurité avec Mobile Money, Orange Money ou espèces à la livraison.',
    icon: 'wallet-outline',
    iconColor: '#22c55e',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    router.replace('/role-selection');
  };

  const handleGetStarted = () => {
    router.replace('/role-selection');
  };

  const renderSlide = (slide: OnboardingSlide) => (
    <View key={slide.id} style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: `${slide.iconColor}20` }]}>
        <Ionicons name={slide.icon} size={80} color={slide.iconColor} />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>GARAP<Text style={styles.logoAccent}>EXPRESS</Text></Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <View style={styles.slidesContainer}>
        {slides.map(renderSlide)}
      </View>

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentSlide && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {currentSlide === slides.length - 1 ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
            >
              <Ionicons 
                name="arrow-back" 
                size={20} 
                color={currentSlide === 0 ? colors.textMuted : colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentSlide + 1} sur {slides.length}
        </Text>
      </View>
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
    paddingTop: spacing.md,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 1,
  },
  logoAccent: {
    color: '#127b05',
  },
  skipButton: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  slide: {
    width: width - spacing.lg * 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  paginationDotActive: {
    backgroundColor: '#22c55e',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  getStartedButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.lg,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  progressContainer: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
