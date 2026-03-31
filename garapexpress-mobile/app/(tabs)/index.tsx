import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/theme';
import { useAppStore, type MedicineWithPrice, type Pharmacy } from '../../src/store/appStore';
import { formatPrice } from '../../src/utils/formatters';
import { Loading } from '../../src/components/ui/Loading';
import { PharmacyCard, MedicineCard } from '../../src/components/ui/Card';

const categories = [
  { label: 'Analgésiques', emoji: '💊' },
  { label: 'Antibiotiques', emoji: '🔬' },
  { label: 'Vitamines', emoji: '🌿' },
  { label: 'Anti-inflam.', emoji: '🩺' },
  { label: 'Cardio', emoji: '❤️' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { 
    user, 
    pharmacies, 
    medicines, 
    orders, 
    isAuthLoading,
    initialize,
    addToCart 
  } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      initialize();
    }, [initialize])
  );

  const activeOrder = orders?.find(o => 
    ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(o.statut)
  );

  const pharmaciesGarde = pharmacies?.filter(p => p.estDeGarde) || [];
  const featuredMedicines = medicines?.slice(0, 4) || [];

  const isLoading = isAuthLoading && medicines.length === 0;

  if (isLoading) {
    return <Loading fullScreen message="Chargement..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.location}>📍 Dakar, Sénégal</Text>
            <Text style={styles.greeting}>Bonjour, {user?.prenom || user?.nom || 'Client'} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.avatarButton}
            >
              <Text style={styles.avatarText}>
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          onPress={() => router.push('/search')}
          style={styles.searchBar}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Rechercher un médicament...</Text>
        </TouchableOpacity>

        {/* Promo Banner */}
        <TouchableOpacity style={styles.promoBanner}>
          <Text style={styles.promoEmoji}>💊 Nos pharmacies</Text>
          <Text style={styles.promoTitle}>
            {pharmacies.length} pharmacies{'\n'}à votre service
          </Text>
          <Text style={styles.promoSubtitle}>
            {pharmaciesGarde.length} de garde ce weekend
          </Text>
        </TouchableOpacity>

        {/* Active Order Banner */}
        {activeOrder && (
          <TouchableOpacity 
            onPress={() => router.push('/order-tracking')}
            style={styles.orderBanner}
          >
            <View style={styles.orderIconContainer}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Commande en cours</Text>
              <Text style={styles.orderSubtitle}>
                #{activeOrder.id} · Statut: {activeOrder.statut}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {categories.map((cat, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.categoryCard}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Nearby Pharmacies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pharmacies proches</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pharmacyGrid}>
            {pharmacies.slice(0, 2).map((pharmacy: Pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                name={pharmacy.raisonSociale}
                address={pharmacy.adresse}
                isOnDuty={pharmacy.estDeGarde}
                onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
              />
            ))}
          </View>
        </View>

        {/* Popular Medicines */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💊 Populaires</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.medicineList}>
            {featuredMedicines.map((medicine: MedicineWithPrice) => (
              <MedicineCard
                key={medicine.id}
                name={medicine.nom}
                category={medicine.DCI}
                price={medicine.prix}
                inStock={true}
                requiresPrescription={medicine.surOrdonnance}
                onPress={() => router.push(`/medicine/${medicine.id}`)}
              />
            ))}
          </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  location: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  greeting: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  avatarText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  searchPlaceholder: {
    marginLeft: spacing.sm,
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  promoBanner: {
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  promoEmoji: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  promoTitle: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  orderBanner: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning,
    ...shadows.md,
  },
  orderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orderTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  orderSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  lastSection: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryCard: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
  },
  pharmacyGrid: {
    gap: spacing.md,
  },
  medicineList: {
    gap: spacing.sm,
  },
});
