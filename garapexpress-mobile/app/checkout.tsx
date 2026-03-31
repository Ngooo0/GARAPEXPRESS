import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import { api } from '../src/services/api';
import AppPopup from '../src/components/ui/AppPopup';

type PaymentMethod = 'mobile' | 'card' | 'cash';
type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
};

export default function CheckoutScreen() {
  const router = useRouter();
  const cartItems = useAppStore((s) => s.cartItems);
  const cartTotalValue = useAppStore((s) => s.cartTotal());
  const createOrder = useAppStore((s) => s.createOrder);
  const selectedPharmacy = useAppStore((s) => s.selectedPharmacy);
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  const totalBeforePromo = cartTotalValue + deliveryFee;
  const total = totalBeforePromo - promoDiscount;
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showPopup = (title: string, message: string, variant: PopupState['variant']) => {
    setPopup({ visible: true, title, message, variant });
  };

  useEffect(() => {
    if (!selectedPharmacy || cartItems.length === 0) {
      showPopup('Panier vide', 'Panier vide ou pharmacie non sélectionnée.', 'error');
      router.replace('/(tabs)');
    }
  }, [cartItems.length, router, selectedPharmacy]);

  // Calculer les frais de livraison dynamiquement selon l'adresse
  useEffect(() => {
    if (address.trim()) {
      // Simulation de calcul de frais selon la distance
      // Dans une vraie application, utiliser une API de géolocalisation
      const baseFee = 1500;
      const addressLength = address.length;
      // Plus l'adresse est longue, plus on considère qu'elle est lointaine
      const distanceMultiplier = Math.min(2, 1 + (addressLength / 50));
      const calculatedFee = Math.round(baseFee * distanceMultiplier);
      setDeliveryFee(calculatedFee);
    } else {
      setDeliveryFee(0);
    }
  }, [address]);

  // Appliquer un code promo
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      // Simulation de vérification de code promo
      // Dans une vraie application, appeler une API
      const upperCode = promoCode.toUpperCase().trim();
      
      // Codes promo simulés
      const validCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
        'WELCOME10': { discount: 10, type: 'percentage' },
        'BIENVENUE': { discount: 15, type: 'percentage' },
        'REDUCTION5': { discount: 500, type: 'fixed' },
        'PROMO20': { discount: 20, type: 'percentage' },
      };

      const promo = validCodes[upperCode];
      
      if (!promo) {
        setPromoError('Code promo invalide ou expiré');
        setPromoDiscount(0);
        return;
      }

      if (promo.type === 'percentage') {
        const discount = Math.round(cartTotalValue * (promo.discount / 100));
        setPromoDiscount(discount);
      } else {
        setPromoDiscount(Math.min(promo.discount, cartTotalValue));
      }

      showPopup('Code appliqué', 'Votre réduction a été appliquée !', 'success');
    } catch (err) {
      setPromoError('Erreur lors de l\'application du code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const paymentMethods = [
    { 
      id: 'mobile', 
      label: 'Paiement mobile', 
      sublabel: 'Orange Money / Moov Money',
      icon: 'phone-portrait',
      color: '#FF8200'
    },
    { 
      id: 'card', 
      label: 'Carte bancaire', 
      sublabel: 'Visa / Mastercard',
      icon: 'card',
      color: '#1A73E8'
    },
    { 
      id: 'cash', 
      label: 'Espèces', 
      sublabel: 'Payer à la livraison',
      icon: 'cash',
      color: '#34C759'
    },
  ];

  const handlePayment = async () => {
    if (selectedPayment === 'mobile' && phoneNumber.length < 8) {
      showPopup('Numéro invalide', 'Veuillez entrer un numéro de téléphone valide.', 'error');
      return;
    }

    if (!address.trim()) {
      showPopup('Adresse requise', 'Veuillez entrer une adresse de livraison.', 'error');
      return;
    }

    setProcessingPayment(true);
    setError(null);
    
    try {
      // Créer la commande
      const order = await createOrder(address);
      
      // Créer le paiement
      await api.paiements.create({
        montant: total,
        modePaiement: selectedPayment,
        statut: 'pending',
        dateTransaction: new Date().toISOString(),
        commandeId: order.id,
      });
      
      setPaymentSuccess(true);
      
      setTimeout(() => {
        router.replace('/(tabs)/orders');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
      showPopup('Paiement échoué', err.message || 'Le paiement a échoué. Veuillez réessayer.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginLeft: spacing.sm }}>Paiement</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Adresse de livraison</Text>
          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <TextInput
              style={{ fontSize: fontSize.sm, color: colors.text, padding: spacing.sm }}
              placeholder="Entrez votre adresse"
              placeholderTextColor={colors.textMuted}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Order Summary */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Résumé de la commande</Text>
          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            {cartItems.map((item) => (
              <View key={item.medicine.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{item.medicine.nom} × {item.quantity}</Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{formatPrice(item.medicine.prix * item.quantity)}</Text>
              </View>
            ))}
            
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Sous-total</Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.text }}>{formatPrice(cartTotalValue)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Frais de livraison</Text>
                <Text style={{ fontSize: fontSize.sm, color: deliveryFee > 0 ? colors.text : colors.textMuted }}>
                  {deliveryFee > 0 ? formatPrice(deliveryFee) : address.trim() ? formatPrice(deliveryFee) : 'Entrez une adresse pour calculer'}
                </Text>
              </View>
              {promoDiscount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                  <Text style={{ fontSize: fontSize.sm, color: colors.success }}>Réduction promo</Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.success }}>-{formatPrice(promoDiscount)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: fontSize.md, fontWeight: 'bold', color: colors.text }}>Total</Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: 'bold', color: colors.primary }}>{formatPrice(total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Moyen de paiement</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity 
              key={method.id}
              onPress={() => setSelectedPayment(method.id as PaymentMethod)}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: selectedPayment === method.id ? method.color + '15' : colors.card, 
                borderRadius: borderRadius.xl, 
                padding: spacing.md, 
                borderWidth: 2, 
                borderColor: selectedPayment === method.id ? method.color : colors.border,
                marginBottom: spacing.sm 
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: method.color + '20', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name={method.icon as any} size={20} color={method.color} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text }}>{method.label}</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{method.sublabel}</Text>
              </View>
              {selectedPayment === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={method.color} />
              )}
            </TouchableOpacity>
          ))}

          {/* Phone number input for mobile payment */}
          {selectedPayment === 'mobile' && (
            <View style={{ marginTop: spacing.sm }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>Numéro de téléphone</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ paddingLeft: spacing.md, fontSize: fontSize.md, color: colors.textMuted }}>+221 </Text>
                <TextInput
                  style={{ flex: 1, padding: spacing.md, fontSize: fontSize.md, color: colors.text }}
                  placeholder="77 123 45 67"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>
          )}
        </View>

        {/* Promo Code */}
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Code promo</Text>
          <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border }}>
            <TextInput
              style={{ flex: 1, padding: spacing.md, fontSize: fontSize.sm, color: colors.text }}
              placeholder="Entrez votre code"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, justifyContent: 'center', borderTopRightRadius: borderRadius.xl, borderBottomRightRadius: borderRadius.xl }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={{ backgroundColor: colors.card, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity 
          onPress={handlePayment}
          disabled={processingPayment}
          style={{ 
            backgroundColor: processingPayment ? colors.border : colors.primary, 
            paddingVertical: spacing.md, 
            borderRadius: borderRadius.lg, 
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          {processingPayment ? (
            <>
              <Ionicons name="hourglass" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Traitement en cours...</Text>
            </>
          ) : (
            <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' }}>Payer {formatPrice(total)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={paymentSuccess} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', margin: spacing.lg }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success + '20', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg }}>
              <Ionicons name="checkmark" size={40} color={colors.success} />
            </View>
            <Text style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text }}>Paiement réussi !</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }}>Votre commande a été confirmée</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs }}>Redirection vers vos commandes...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
