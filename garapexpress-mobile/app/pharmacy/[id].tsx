import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { api } from '../../src/services/api';

interface CatalogItem {
  id: number;
  prix: number;
  quantiteStock: number;
  disponibilite: boolean;
  dateMAJ: string;
  pharmacieId: number;
  medicamentId: number;
  medicament: {
    id: number;
    nom: string;
    DCI: string;
    categorie: string;
    surOrdonnance: boolean;
    stock: number;
    prix: number;
  };
  pharmacie: {
    id: number;
    raisonSociale: string;
    adresse: string;
    numeroAgrement: string;
    estDeGarde: boolean;
    horaires: string;
    latitude: number;
    longitude: number;
    telephone?: string;
    email?: string;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
};

export default function PharmacyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToCart = useAppStore((s) => s.addToCart);
  
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [catalogue, setCatalogue] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const pharmacyId = parseInt(id as string, 10);
      
      // Récupérer la pharmacie
      const pharmacyData = await api.pharmacies.getById(pharmacyId);
      setPharmacy(pharmacyData);
      
      // Récupérer le catalogue
      const catalogueData = await api.pharmacies.getCatalogue(pharmacyId);
      setCatalogue(catalogueData);
    } catch (err: any) {
      console.error('Error loading pharmacy:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Chargement...</Text>
        </View>
      ) : error || !pharmacy ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={{ marginTop: spacing.md, color: colors.text, fontSize: fontSize.md, fontWeight: '600', textAlign: 'center' }}>
            {error || 'Pharmacie non trouvée'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pharmacy Header */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          {/* Image placeholder */}
          <View style={{ width: '100%', height: 150, borderRadius: borderRadius.xl, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
          </View>
          
          <View style={{ marginTop: spacing.md }}>
            <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>{pharmacy.raisonSociale}</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 }}>{pharmacy.adresse}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={{ marginLeft: 4, fontSize: fontSize.sm, color: colors.textSecondary }}>
                  {`(${pharmacy.latitude}, ${pharmacy.longitude})`}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pharmacy.estDeGarde ? colors.success : colors.error }} />
              <Text style={{ marginLeft: spacing.sm, fontSize: fontSize.sm, color: pharmacy.estDeGarde ? colors.success : colors.error, fontWeight: '600' }}>
                {pharmacy.estDeGarde ? 'De garde' : 'Nicht de garde'}
              </Text>
            </View>

            {/* Contact */}
            {pharmacy.telephone && (
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, backgroundColor: colors.primary + '15', padding: spacing.sm, borderRadius: borderRadius.lg }}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
                <Text style={{ marginLeft: spacing.sm, color: colors.primary, fontWeight: '600' }}>{pharmacy.telephone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Medicines */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>
            Médicaments disponibles ({catalogue.length})
          </Text>
          
          {catalogue.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Ionicons name="beaker-outline" size={48} color={colors.textMuted} />
              <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Aucun médicament disponible</Text>
            </View>
          ) : (
            <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
              {catalogue.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => router.push(`/medicine/${item.medicamentId}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, opacity: item.disponibilite ? 1 : 0.6 }}
                >
                  {/* Medicine image placeholder */}
                  <View style={{ width: 50, height: 50, borderRadius: borderRadius.md, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  </View>
                  
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text }}>{item.medicament.nom}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{item.medicament.categorie}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>Stock: {item.quantiteStock}</Text>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: 'bold', color: colors.primary, marginTop: 4 }}>{formatPrice(item.prix)}</Text>
                  </View>
                  
                  {item.disponibilite ? (
                    <TouchableOpacity 
                      onPress={() => addToCart({
                        id: item.medicamentId,
                        catalogueId: item.id,
                        nom: item.medicament.nom,
                        DCI: item.medicament.DCI,
                        categorie: item.medicament.categorie,
                        surOrdonnance: item.medicament.surOrdonnance,
                        stock: item.quantiteStock,
                        pharmacieId: item.pharmacieId,
                        pharmacieName: pharmacy.raisonSociale,
                        prix: item.prix,
                        disponibilite: item.disponibilite,
                      })}
                      style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.error + '40', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="close" size={20} color={colors.error} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
