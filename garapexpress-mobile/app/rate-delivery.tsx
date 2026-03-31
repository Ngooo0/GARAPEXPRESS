import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '../src/constants/theme';

interface RatingProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  riderName: string;
  orderId: string;
}

export default function RateDeliveryModal({
  visible,
  onClose,
  onSubmit,
  riderName,
  orderId,
}: RatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'rapide', label: 'Livraison rapide', icon: 'flash' },
    { id: 'soigneux', label: 'Emballage soigné', icon: 'cube' },
    { id: 'poli', label: 'Livreur poli', icon: 'happy' },
    { id: 'recommande', label: 'Je recommande', icon: 'thumbs-up' },
  ];

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note');
      return;
    }
    onSubmit(rating, comment);
    // Reset
    setRating(0);
    setComment('');
    setSelectedCategory(null);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            onPressIn={() => setHoverRating(star)}
            onPressOut={() => setHoverRating(0)}
          >
            <Ionicons
              name={star <= (hoverRating || rating) ? 'star' : 'star-outline'}
              size={40}
              color={star <= (hoverRating || rating) ? '#FFD700' : '#ccc'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Très mécontent';
      case 2:
        return 'Mécontent';
      case 3:
        return 'Neutre';
      case 4:
        return 'Satisfait';
      case 5:
        return 'Très satisfait';
      default:
        return 'Tapotez pour noter';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Noter la livraison</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Rider Info */}
          <View style={styles.riderInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <Text style={styles.riderName}>{riderName}</Text>
            <Text style={styles.orderId}>Commande #{orderId}</Text>
          </View>

          {/* Stars */}
          <View style={styles.ratingSection}>
            {renderStars()}
            <Text style={styles.ratingText}>{getRatingText()}</Text>
          </View>

          {/* Quick Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Qu'avez-vous pensé ?</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={selectedCategory === cat.id ? '#fff' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Partagez votre expérience..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={styles.submitButtonText}>Envoyer la note</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Version autonome (page)
export function RateDeliveryPage() {
  const params = useLocalSearchParams<{ orderId?: string; riderName?: string }>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const orderId = params.orderId || 'CMD-001';
  const riderName = params.riderName || 'Mamadou';

  const categories = [
    { id: 'rapide', label: 'Livraison rapide', icon: 'flash' },
    { id: 'soigneux', label: 'Emballage soigné', icon: 'cube' },
    { id: 'poli', label: 'Livreur poli', icon: 'happy' },
    { id: 'recommande', label: 'Je recommande', icon: 'thumbs-up' },
  ];

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note');
      return;
    }
    
    // Envoyer la note au backend
    console.log('Note soumise:', { rating, comment, selectedCategory, orderId });
    
    setSubmitted(true);
    Alert.alert('Merci !', 'Votre note a été enregistrée', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            onPressIn={() => setHoverRating(star)}
            onPressOut={() => setHoverRating(0)}
          >
            <Ionicons
              name={star <= (hoverRating || rating) ? 'star' : 'star-outline'}
              size={40}
              color={star <= (hoverRating || rating) ? '#FFD700' : '#ccc'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Très mécontent';
      case 2:
        return 'Mécontent';
      case 3:
        return 'Neutre';
      case 4:
        return 'Satisfait';
      case 5:
        return 'Très satisfait';
      default:
        return 'Tapotez pour noter';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Noter la livraison</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Rider Info */}
        <View style={styles.riderInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <Text style={styles.riderName}>{riderName}</Text>
          <Text style={styles.orderId}>Commande #{orderId}</Text>
        </View>

        {/* Stars */}
        <View style={styles.ratingSection}>
          {renderStars()}
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Quick Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Qu'avez-vous pensé ?</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )
                }
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={selectedCategory === cat.id ? '#fff' : colors.primary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Partagez votre expérience..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitted}
        >
          <Text style={styles.submitButtonText}>
            {submitted ? 'Note enregistrée' : 'Envoyer la note'}
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  riderInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  riderName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  orderId: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  categoriesSection: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  categoryTextActive: {
    color: '#fff',
  },
  commentSection: {
    paddingVertical: spacing.md,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
