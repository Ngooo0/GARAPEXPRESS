import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

interface PharmacyCardProps {
  name: string;
  address: string;
  isOnDuty?: boolean;
  distance?: string;
  rating?: number;
  imageUrl?: string;
  onPress?: () => void;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  name,
  address,
  isOnDuty = false,
  distance,
  rating,
  imageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.pharmacyCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.pharmacyImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.pharmacyImage} />
        ) : (
          <View style={styles.pharmacyImagePlaceholder}>
            <Text style={styles.pharmacyImagePlaceholderText}>🏪</Text>
          </View>
        )}
        {isOnDuty && (
          <View style={styles.onDutyBadge}>
            <Text style={styles.onDutyText}>Garde</Text>
          </View>
        )}
      </View>
      <View style={styles.pharmacyInfo}>
        <Text style={styles.pharmacyName} numberOfLines={1}>{name}</Text>
        <Text style={styles.pharmacyAddress} numberOfLines={2}>{address}</Text>
        <View style={styles.pharmacyMeta}>
          {distance && (
            <Text style={styles.pharmacyDistance}>📍 {distance}</Text>
          )}
          {rating && (
            <Text style={styles.pharmacyRating}>⭐ {rating.toFixed(1)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface MedicineCardProps {
  name: string;
  category: string;
  price: number;
  inStock?: boolean;
  requiresPrescription?: boolean;
  onPress?: () => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  name,
  category,
  price,
  inStock = true,
  requiresPrescription = false,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.medicineCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName} numberOfLines={2}>{name}</Text>
        <Text style={styles.medicineCategory}>{category}</Text>
        <View style={styles.medicineMeta}>
          {requiresPrescription && (
            <View style={styles.prescriptionBadge}>
              <Text style={styles.prescriptionText}>Ordonnance</Text>
            </View>
          )}
          <View style={[styles.stockBadge, inStock ? styles.inStock : styles.outOfStock]}>
            <Text style={[styles.stockText, inStock ? styles.inStockText : styles.outOfStockText]}>
              {inStock ? 'En stock' : 'Rupture'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price.toFixed(0)} CFA</Text>
      </View>
    </TouchableOpacity>
  );
};

interface OrderCardProps {
  id: string;
  status: string;
  date: string;
  total: number;
  pharmacyName?: string;
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  id,
  status,
  date,
  total,
  pharmacyName,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'en_attente':
        return colors.pending;
      case 'confirme':
        return colors.confirmed;
      case 'en_preparation':
        return colors.preparing;
      case 'pret':
        return colors.ready;
      case 'en_livraison':
        return colors.delivering;
      case 'livre':
        return colors.delivered;
      case 'annule':
        return colors.cancelled;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Commande #{id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      {pharmacyName && (
        <Text style={styles.orderPharmacy}>{pharmacyName}</Text>
      )}
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>{date}</Text>
        <Text style={styles.orderTotal}>{total.toFixed(0)} CFA</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card base
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  elevated: {
    ...shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.none,
  },

  // Pharmacy Card
  pharmacyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.md,
  },
  pharmacyImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  pharmacyImage: {
    width: '100%',
    height: '100%',
  },
  pharmacyImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyImagePlaceholderText: {
    fontSize: 40,
  },
  onDutyBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  onDutyText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  pharmacyInfo: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  pharmacyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  pharmacyAddress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pharmacyMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pharmacyDistance: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  pharmacyRating: {
    fontSize: fontSize.xs,
    color: colors.warning,
    fontWeight: fontWeight.medium,
  },

  // Medicine Card
  medicineCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    padding: spacing.md,
    ...shadows.md,
    marginBottom: spacing.sm,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  medicineCategory: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  medicineMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  prescriptionBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  prescriptionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.warning,
  },
  stockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  inStock: {
    backgroundColor: colors.successLight,
  },
  outOfStock: {
    backgroundColor: colors.errorLight,
  },
  stockText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  inStockText: {
    color: colors.success,
  },
  outOfStockText: {
    color: colors.error,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: spacing.md,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  // Order Card
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
    marginBottom: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  orderPharmacy: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  orderTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});