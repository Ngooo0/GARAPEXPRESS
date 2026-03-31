import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/theme';
import { formatPrice } from '../../src/utils/formatters';
import { useAppStore } from '../../src/store/appStore';
import { Button } from '../../src/components/ui/Button';

export default function CartScreen() {
  const router = useRouter();
  const cartItems = useAppStore((s) => s.cartItems);
  const cartTotalValue = useAppStore((s) => s.cartTotal());
  const cartCountValue = useAppStore((s) => s.cartCount());
  const updateQuantity = useAppStore((s) => s.updateQuantity);
  const removeFromCart = useAppStore((s) => s.removeFromCart);

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des médicaments pour{'\n'}commencer vos achats
          </Text>
          <Button
            title="Commencer mes achats"
            onPress={() => router.push('/')}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panier</Text>
        <Text style={styles.headerSubtitle}>
          {cartCountValue} article{cartCountValue !== 1 ? 's' : ''} dans votre panier
        </Text>
      </View>

      {/* Cart Items */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cartItems.map((item) => (
          <View key={item.medicine.id} style={styles.cartItem}>
            <View style={styles.itemImageContainer}>
              {item.medicine.image ? (
                <Image source={{ uri: item.medicine.image }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="medical" size={24} color={colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.medicine.nom}</Text>
              <Text style={styles.itemPharmacy}>{item.medicine.pharmacieName}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.medicine.prix)}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity 
                onPress={() => removeFromCart(item.medicine.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  onPress={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                  style={styles.quantityButton}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity 
                  onPress={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                  style={[styles.quantityButton, styles.quantityButtonActive]}
                >
                  <Ionicons name="add" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(cartTotalValue)}</Text>
        </View>
        <Button
          title="Passer à la caisse"
          onPress={() => router.push('/checkout')}
          fullWidth
          size="lg"
        />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  itemPharmacy: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonActive: {
    backgroundColor: colors.primary,
  },
  quantityText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    minWidth: 28,
    textAlign: 'center',
    color: colors.text,
  },
  footer: {
    backgroundColor: colors.card,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
});
