import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

type TabType = 'medicaments' | 'pharmacies' | 'garde';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
};

// Fonction de debounce pour éviter trop d'appels API
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('medicaments');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const router = useRouter();
  const addToCart = useAppStore((s) => s.addToCart);
  const medicines = useAppStore((s) => s.medicines);
  const pharmacies = useAppStore((s) => s.pharmacies);

  // Debounce de 500ms pour la recherche
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Recherche en temps réel avec debounce
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await api.medicaments.search(debouncedSearch);
        setSearchResults(results || []);
      } catch (error: any) {
        console.error('Erreur de recherche:', error);
        setSearchError(error.message || 'Erreur lors de la recherche');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Pharmacies de garde
  const pharmaciesGarde = pharmacies.filter(p => p.estDeGarde);

  // Toutes les pharmacies
  const filteredPharmacies = pharmacies.filter(p =>
    p.raisonSociale.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Si on a des résultats de recherche API, on les utilise, sinon on filtre localement
  const displayedMedicines = searchResults.length > 0 
    ? searchResults 
    : medicines.filter(med => 
        med.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.DCI?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>Rechercher</Text>
        
        {/* Search Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={{ flex: 1, marginLeft: spacing.sm, fontSize: fontSize.md, color: colors.text }}
            placeholder="Nom du médicament..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginTop: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 4 }}>
          <TouchableOpacity 
            onPress={() => setActiveTab('medicaments')}
            style={{ flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: activeTab === 'medicaments' ? colors.primary : 'transparent' }}
          >
            <Text style={{ textAlign: 'center', fontSize: fontSize.sm, fontWeight: '600', color: activeTab === 'medicaments' ? '#fff' : colors.text }}>
              Médicaments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('pharmacies')}
            style={{ flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: activeTab === 'pharmacies' ? colors.primary : 'transparent' }}
          >
            <Text style={{ textAlign: 'center', fontSize: fontSize.sm, fontWeight: '600', color: activeTab === 'pharmacies' ? '#fff' : colors.text }}>
              Pharmacies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('garde')}
            style={{ flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: activeTab === 'garde' ? colors.success : 'transparent' }}
          >
            <Text style={{ textAlign: 'center', fontSize: fontSize.sm, fontWeight: '600', color: activeTab === 'garde' ? '#fff' : colors.text }}>
              🔔 Garde
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.md, marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {activeTab === 'medicaments' && (
          <>
            {isSearching ? (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Recherche en cours...</Text>
              </View>
            ) : searchError ? (
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text style={{ marginTop: spacing.md, color: colors.error, textAlign: 'center' }}>{searchError}</Text>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md }}>
                  {displayedMedicines.length} résultat{displayedMedicines.length !== 1 ? 's' : ''}
                </Text>
                
                {displayedMedicines.length === 0 && searchQuery.length >= 2 ? (
                  <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <Ionicons name="search" size={48} color={colors.textMuted} />
                    <Text style={{ marginTop: spacing.md, color: colors.textSecondary, textAlign: 'center' }}>
                      Aucun médicament trouvé pour "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
                    {displayedMedicines.map((medicine: any) => (
                      <TouchableOpacity 
                        key={medicine.id}
                        onPress={() => router.push(`/medicine/${medicine.id}`)}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}
                      >
                        <View style={{ width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="medical" size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text }}>{medicine.nom}</Text>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{medicine.DCI}</Text>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>{medicine.pharmacieName}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Text style={{ fontSize: fontSize.md, fontWeight: 'bold', color: colors.primary }}>{formatPrice(medicine.prix)}</Text>
                            {medicine.surOrdonnance && (
                              <View style={{ marginLeft: spacing.sm, backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                                <Text style={{ fontSize: 9, color: colors.info }}>📄 Ordonnance</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => addToCart(medicine)}
                          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
                        >
                          <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'pharmacies' && (
          <>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md }}>
              {filteredPharmacies.length} pharmacy{filteredPharmacies.length !== 1 ? 's' : ''}
            </Text>
            
            <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
              {filteredPharmacies.map((pharmacy) => (
                <TouchableOpacity 
                  key={pharmacy.id}
                  onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}
                >
                  <View style={{ width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text }}>{pharmacy.raisonSociale}</Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{pharmacy.adresse}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: pharmacy.estDeGarde ? colors.success : colors.error }} />
                      <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginLeft: 4 }}>
                        {pharmacy.estDeGarde ? 'De garde' : 'Fermé'} · {pharmacy.horaires}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeTab === 'garde' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Ionicons name="notifications" size={20} color={colors.success} />
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: spacing.xs }}>
                {pharmaciesGarde.length} pharmacy{pharmaciesGarde.length !== 1 ? 's' : ''} de garde
              </Text>
            </View>
            
            <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
              {pharmaciesGarde.map((pharmacy) => (
                <TouchableOpacity 
                  key={pharmacy.id}
                  onPress={() => router.push(`/pharmacy/${pharmacy.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.success }}
                >
                  <View style={{ width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.success + '20', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="medical" size={28} color={colors.success} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text }}>{pharmacy.raisonSociale}</Text>
                      <View style={{ marginLeft: spacing.sm, backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>GARDE</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{pharmacy.adresse}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="time" size={14} color={colors.success} />
                      <Text style={{ fontSize: fontSize.xs, color: colors.success, marginLeft: 4 }}>{pharmacy.horaires}</Text>
                    </View>
                  </View>
                  {pharmacy.telephone && (
                    <TouchableOpacity 
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Ionicons name="call" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
