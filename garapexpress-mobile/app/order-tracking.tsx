import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import { formatPrice, orderStatusLabel } from '../src/utils/formatters';
import { useAppStore } from '../src/store/appStore';

const steps = [
  { status: 'confirmed', label: 'Commande confirmée', icon: 'checkmark-circle', completed: true },
  { status: 'preparing', label: 'En préparation', icon: 'medical', completed: true },
  { status: 'ready', label: 'Prête', icon: 'cube', completed: true },
  { status: 'picked_up', label: 'Récupérée par le livreur', icon: 'bicycle', completed: true },
  { status: 'delivering', label: 'En livraison', icon: 'location', completed: false },
  { status: 'delivered', label: 'Livrée', icon: 'checkmark-done', completed: false },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const order = useAppStore((state) =>
    state.orders.find((item) => ['confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(item.statut))
  );

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }} edges={['top']}>
        <Text style={{ color: colors.textSecondary }}>Aucune commande active à suivre.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginLeft: spacing.sm }}>Suivi de commande</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}>
        {/* Order ID */}
        <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Commande</Text>
          <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>ORD-{order.id}</Text>
          <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full, marginTop: spacing.sm }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{orderStatusLabel[order.statut] || order.statut}</Text>
          </View>
        </View>

        {/* Timer */}
        <View style={{ marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Temps estimé restant</Text>
          <Text style={{ fontSize: fontSize.xxxl, fontWeight: 'bold', color: colors.primary, marginTop: spacing.sm }}>15 min</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
            <Ionicons name="location" size={16} color={colors.textMuted} />
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: 4 }}>{order.adresseLivraison}</Text>
          </View>
        </View>

        {/* Rider */}
        {order.livraison?.livreur?.nom && (
          <View style={{ marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text }}>{order.livraison.livreur.nom}</Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{order.livraison.livreur.telephone || 'Votre livreur'}</Text>
            </View>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Steps */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>Statut de la commande</Text>
          
          {steps.map((step, index) => (
            <View key={step.status} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center', width: 40 }}>
                <View style={{ 
                  width: 32, height: 32, borderRadius: 16, 
                  backgroundColor: step.completed ? colors.success : colors.border,
                  justifyContent: 'center', alignItems: 'center'
                }}>
                  <Ionicons name={step.icon as any} size={16} color={step.completed ? '#fff' : colors.textMuted} />
                </View>
                {index < steps.length - 1 && (
                  <View style={{ width: 2, flex: 1, minHeight: 30, backgroundColor: step.completed ? colors.success : colors.border }} />
                )}
              </View>
              <View style={{ flex: 1, paddingLeft: spacing.sm, paddingBottom: spacing.md }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: step.completed ? colors.text : colors.textMuted }}>{step.label}</Text>
                {step.completed && (
                  <Text style={{ fontSize: fontSize.xs, color: colors.success, marginTop: 2 }}>Terminé</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>Détails de la commande</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.text }}>Commande #{order.id}</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{formatPrice(order.montantTotal)}</Text>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: fontSize.md, fontWeight: 'bold', color: colors.text }}>Total</Text>
            <Text style={{ fontSize: fontSize.md, fontWeight: 'bold', color: colors.primary }}>{formatPrice(order.montantTotal)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
