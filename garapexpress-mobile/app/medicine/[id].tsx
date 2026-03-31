import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { formatPrice } from '../../src/utils/formatters';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';

export default function MedicineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medicines, addToCart, loadingStates } = useAppStore();
  
  const medicineId = parseInt(id || '0');
  const medicine = medicines.find(m => m.id === medicineId);

  const handleAddToCart = () => {
    // Si le médicament nécessite une ordonnance, avertir l'utilisateur
    if (medicine?.surOrdonnance) {
      Alert.alert(
        'Ordonnance requise',
        'Ce médicament nécessite une ordonnance médicale valide. Vous devrez la scanner lors du paiement.',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Ajouter quand même', 
            style: 'default',
            onPress: () => {
              addToCart(medicine as any); 
              router.push('/(tabs)/cart');
            }
          }
        ]
      );
      return;
    }
    
    addToCart(medicine as any); 
    router.push('/(tabs)/cart');
  };

  if (loadingStates.medicine && medicines.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!medicine) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
          <Text style={{ color: colors.text, marginTop: spacing.md }}>Médicament non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={{ alignItems: 'center', padding: spacing.lg }}>
          <Image source={{ uri: medicine.image || 'https://via.placeholder.com/200' }} style={{ width: 200, height: 200, borderRadius: borderRadius.xl }} />
          {medicine.surOrdonnance && (
            <View style={{ position: 'absolute', top: spacing.md, right: spacing.lg, backgroundColor: colors.info, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full }}>
              <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '600' }}>📄 Ordonnance requise</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>{medicine.nom}</Text>
          <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 }}>{medicine.DCI}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
            <View style={{ backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>{medicine.categorie}</Text>
            </View>
            <Text style={{ marginLeft: spacing.sm, color: colors.textMuted, fontSize: fontSize.sm }}>{medicine.pharmacieName}</Text>
          </View>

          <Text style={{ fontSize: fontSize.xxxl, fontWeight: 'bold', color: colors.primary, marginTop: spacing.lg }}>{formatPrice(medicine.prix)}</Text>

          {/* Stock */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
            <Ionicons name="cube-outline" size={16} color={medicine.stock > 10 ? colors.success : colors.warning} />
            <Text style={{ marginLeft: 4, color: medicine.stock > 10 ? colors.success : colors.warning, fontSize: fontSize.sm }}>
              {medicine.stock > 10 ? 'En stock' : `Stock faible (${medicine.stock})`}
            </Text>
          </View>

          {/* Description */}
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Information</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
              {medicine.DCI && `Dénomination commune internationale: ${medicine.DCI}`}
              {medicine.categorie && ` • Catégorie: ${medicine.categorie}`}
            </Text>
          </View>

          {/* Pharmacy Info */}
          <TouchableOpacity style={{ marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 50, height: 50, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="medical" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text }}>{medicine.pharmacieName}</Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Disponible</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity 
          onPress={handleAddToCart}
          style={{ backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Ajouter au panier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
