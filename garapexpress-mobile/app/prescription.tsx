import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import api from '../src/services/api';

export default function PrescriptionScreen() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPrescriptions(await api.ordonnances.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des ordonnances');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrescriptions();
    }, [loadPrescriptions])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginLeft: spacing.sm }}>Mes ordonnances</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.push('/prescription-scan')}
          style={{ marginTop: spacing.md, backgroundColor: colors.primary + '15', borderRadius: borderRadius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' }}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
          <Text style={{ marginLeft: spacing.sm, color: colors.primary, fontWeight: '600', fontSize: fontSize.md }}>Ajouter une ordonnance</Text>
        </TouchableOpacity>

        {loading && (
          <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {error && !loading && (
          <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        )}

        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {prescriptions.map((prescription) => (
            <View
              key={prescription.id}
              style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.info + '20', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="document-text" size={24} color={colors.info} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text }}>Ordonnance #{prescription.id}</Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                    Émise le {new Date(prescription.dateEmission).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.warning }}>{prescription.statut}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.primary + '15', paddingVertical: spacing.sm, borderRadius: borderRadius.lg, alignItems: 'center' }}
                  onPress={() => router.push('/prescription-scan')}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>Commander</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.border, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, alignItems: 'center' }}>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: fontSize.sm }}>Voir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
