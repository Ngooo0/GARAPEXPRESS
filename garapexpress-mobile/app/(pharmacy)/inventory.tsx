import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { formatPrice } from '../../src/utils/formatters';
import { MedicineWithPrice, useAppStore } from '../../src/store/appStore';
import AppPopup from '../../src/components/ui/AppPopup';
import api from '../../src/services/api';

type FormState = {
  nom: string;
  DCI: string;
  categories: string[];
  stock: string;
  prix: string;
  surOrdonnance: boolean;
  disponibilite: boolean;
};

type PopupState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  buttonLabel?: string;
  secondaryButtonLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

const emptyForm: FormState = {
  nom: '',
  DCI: '',
  categories: [],
  stock: '',
  prix: '',
  surOrdonnance: false,
  disponibilite: true,
};

// Catégories disponibles pour les médicaments
const AVAILABLE_CATEGORIES = [
  'Analgésiques',
  'Antibiotiques',
  'Anti-inflammatoires',
  'Vitamines & Compléments',
  'Cardiovasculaires',
  'Dermatologie',
  'Matériel médical',
  'Hygiène & Soins',
  'Bébé & Maternité',
  'Diabète',
  'Respiratoire',
  'Neurologie',
  'Gastro-entérologie',
  'Urologie',
  'Ophtalmologie',
  'ORL',
];

export default function Inventory() {
  const { user, medicines, loadingStates, errors, fetchMedicines } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithPrice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, [fetchMedicines])
  );

  const pharmacyMedicines = useMemo(
    () => medicines.filter((item) => item.pharmacieId === user?.id),
    [medicines, user?.id]
  );

  const categories = useMemo(() => {
    const cats = new Set(pharmacyMedicines.map((medicine) => medicine.categorie).filter(Boolean));
    return ['Tous', ...Array.from(cats)];
  }, [pharmacyMedicines]);

  const filteredInventory = useMemo(() => {
    return pharmacyMedicines.filter((item) => {
      const matchesSearch =
        item.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.DCI.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || item.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [pharmacyMedicines, searchQuery, selectedCategory]);

  const lowStockCount = pharmacyMedicines.filter((item) => item.stock < 20).length;
  const outOfStockCount = pharmacyMedicines.filter((item) => item.stock === 0).length;
  const prescriptionCount = pharmacyMedicines.filter((item) => item.surOrdonnance).length;

  const updateFormField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const showPopup = (config: Omit<PopupState, 'visible'>) => {
    setPopup({ visible: true, ...config });
  };

  const closePopup = () => {
    setPopup((current) => ({
      ...current,
      visible: false,
      onPrimaryAction: undefined,
      onSecondaryAction: undefined,
      buttonLabel: undefined,
      secondaryButtonLabel: undefined,
    }));
  };

  const openCreateModal = () => {
    setSelectedMedicine(null);
    setForm(emptyForm);
    setIsEditorVisible(true);
  };

  const openEditModal = (medicine: MedicineWithPrice) => {
    setSelectedMedicine(medicine);
    setForm({
      nom: medicine.nom,
      DCI: medicine.DCI,
      categories: medicine.categorie ? [medicine.categorie] : [],
      stock: String(medicine.stock),
      prix: String(medicine.prix),
      surOrdonnance: medicine.surOrdonnance,
      disponibilite: medicine.disponibilite,
    });
    setIsEditorVisible(true);
  };

  const validateForm = () => {
    if (!form.nom.trim() || !form.DCI.trim() || form.categories.length === 0) {
      return 'Renseigne le nom, la DCI et au moins une catégorie.';
    }

    const stock = Number(form.stock);
    const prix = Number(form.prix);

    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(Number(form.stock))) {
      return 'Le stock doit être un nombre entier positif.';
    }

    if (Number.isNaN(prix) || prix < 0) {
      return 'Le prix doit être un nombre positif.';
    }

    return null;
  };

  const handleSaveMedicine = async () => {
    if (!user?.id) {
      showPopup({ title: 'Session invalide', message: 'Pharmacie non reconnue.', variant: 'error' });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      showPopup({ title: 'Données invalides', message: validationError, variant: 'error' });
      return;
    }

    const stock = Number(form.stock);
    const prix = Number(form.prix);

    try {
      setIsSubmitting(true);

      if (selectedMedicine) {
        await api.medicaments.update(selectedMedicine.id, {
          nom: form.nom.trim(),
          DCI: form.DCI.trim(),
          categorie: form.categories.join(', '),
          surOrdonnance: form.surOrdonnance,
          stock,
          prix,
        });

        if (selectedMedicine.catalogueId) {
          await api.catalogues.update(selectedMedicine.catalogueId, {
            prix,
            quantiteStock: stock,
            disponibilite: form.disponibilite && stock > 0,
          });
        }
      } else {
        const medicamentResponse = await api.medicaments.create({
          nom: form.nom.trim(),
          DCI: form.DCI.trim(),
          categorie: form.categories.join(', '),
          surOrdonnance: form.surOrdonnance,
          stock,
          prix,
        });

        const medicamentId = medicamentResponse?.data?.id ?? medicamentResponse?.id;
        if (!medicamentId) {
          throw new Error("Impossible d'identifier le médicament créé.");
        }

        await api.catalogues.create({
          prix,
          quantiteStock: stock,
          disponibilite: form.disponibilite && stock > 0,
          dateMAJ: new Date().toISOString(),
          pharmacieId: user.id,
          medicamentId,
        });
      }

      await fetchMedicines();
      setIsEditorVisible(false);
      setForm(emptyForm);
      setSelectedMedicine(null);
      showPopup({
        title: 'Catalogue mis à jour',
        message: selectedMedicine ? 'Le produit a été modifié.' : 'Le produit a été ajouté au catalogue.',
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      showPopup({ title: 'Action impossible', message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicine = (medicine: MedicineWithPrice) => {
    showPopup({
      title: 'Supprimer ce produit ?',
      message: `${medicine.nom} sera retiré du catalogue de la pharmacie.`,
      variant: 'info',
      buttonLabel: 'Supprimer',
      secondaryButtonLabel: 'Annuler',
      onPrimaryAction: async () => {
        closePopup();
        try {
          setIsSubmitting(true);
          if (medicine.catalogueId) {
            await api.catalogues.delete(medicine.catalogueId);
          }
          await fetchMedicines();
          showPopup({
            title: 'Produit supprimé',
            message: `${medicine.nom} a été retiré du catalogue.`,
            variant: 'success',
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
          showPopup({ title: 'Suppression impossible', message, variant: 'error' });
        } finally {
          setIsSubmitting(false);
        }
      },
      onSecondaryAction: closePopup,
    });
  };

  const handleQuickAvailability = async (medicine: MedicineWithPrice) => {
    if (!medicine.catalogueId) {
      showPopup({ title: 'Action impossible', message: 'Catalogue introuvable pour ce produit.', variant: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.catalogues.update(medicine.catalogueId, {
        disponibilite: !medicine.disponibilite,
        quantiteStock: medicine.stock,
        prix: medicine.prix,
      });
      await fetchMedicines();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      showPopup({ title: 'Disponibilité non mise à jour', message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (medicine: MedicineWithPrice) => {
    if (!medicine.disponibilite || medicine.stock === 0) return { color: colors.error, label: 'Rupture' };
    if (medicine.stock < 20) return { color: colors.warning, label: 'Stock faible' };
    return { color: colors.success, label: medicine.surOrdonnance ? 'Disponible sur ordonnance' : 'En stock' };
  };

  const renderItem = ({ item }: { item: MedicineWithPrice }) => {
    const stockStatus = getStockStatus(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.nom}</Text>
            <Text style={styles.itemMeta}>DCI: {item.DCI}</Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color + '18' }]}>
            <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>{stockStatus.label}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Prix</Text>
            <Text style={styles.metricValue}>{formatPrice(item.prix)}</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Stock</Text>
            <Text style={styles.metricValue}>{item.stock} unités</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Type</Text>
            <Text style={styles.metricValue}>{item.surOrdonnance ? 'Ordonnance' : 'Libre'}</Text>
          </View>
        </View>

        <Text style={styles.categoryText}>{item.categorie}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cardAction} onPress={() => openEditModal(item)}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.cardActionText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardAction} onPress={() => handleQuickAvailability(item)}>
            <Ionicons
              name={item.disponibilite ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={16}
              color={item.disponibilite ? colors.warning : colors.success}
            />
            <Text style={styles.cardActionText}>{item.disponibilite ? 'Mettre en rupture' : 'Rendre dispo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardAction, styles.deleteAction]} onPress={() => handleDeleteMedicine(item)}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.cardActionText, { color: colors.error }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loadingStates.medicine && pharmacyMedicines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errors.medicine && pharmacyMedicines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.error, textAlign: 'center' }}>{errors.medicine}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <AppPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        buttonLabel={popup.buttonLabel}
        secondaryButtonLabel={popup.secondaryButtonLabel}
        onPrimaryAction={popup.onPrimaryAction}
        onSecondaryAction={popup.onSecondaryAction}
        onClose={closePopup}
      />

      <Modal visible={isEditorVisible} transparent animationType="slide" onRequestClose={() => setIsEditorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMedicine ? 'Modifier le produit' : 'Ajouter un produit'}</Text>
              <TouchableOpacity onPress={() => setIsEditorVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput style={styles.input} value={form.nom} onChangeText={(value) => updateFormField('nom', value)} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>DCI</Text>
              <TextInput style={styles.input} value={form.DCI} onChangeText={(value) => updateFormField('DCI', value)} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Catégories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: borderRadius.full,
                      borderWidth: 1,
                      borderColor: form.categories.includes(cat) ? colors.primary : colors.border,
                      backgroundColor: form.categories.includes(cat) ? colors.primary + '20' : 'transparent',
                    }}
                    onPress={() => {
                      const newCategories = form.categories.includes(cat)
                        ? form.categories.filter((c) => c !== cat)
                        : [...form.categories, cat];
                      updateFormField('categories', newCategories);
                    }}
                  >
                    <Text style={{ 
                      color: form.categories.includes(cat) ? colors.primary : colors.text,
                      fontSize: fontSize.sm,
                    }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Stock</Text>
                <TextInput
                  style={styles.input}
                  value={form.stock}
                  onChangeText={(value) => updateFormField('stock', value)}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Prix</Text>
                <TextInput
                  style={styles.input}
                  value={form.prix}
                  onChangeText={(value) => updateFormField('prix', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Prescription requise</Text>
              <Switch value={form.surOrdonnance} onValueChange={(value) => updateFormField('surOrdonnance', value)} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Disponible</Text>
              <Switch value={form.disponibilite} onValueChange={(value) => updateFormField('disponibilite', value)} />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSaveMedicine}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Catalogue pharmacie</Text>
          <Text style={styles.headerSubtitle}>Ajoute, modifie et gère le stock en temps réel.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={colors.card} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nom, DCI, catégorie..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryTextChip, selectedCategory === item && styles.categoryTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pharmacyMedicines.length}</Text>
          <Text style={styles.statLabel}>Produits</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.warning + '15' }]}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Stock faible</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.error + '15' }]}>
          <Text style={[styles.statValue, { color: colors.error }]}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Rupture</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.info + '15' }]}>
          <Text style={[styles.statValue, { color: colors.info }]}>{prescriptionCount}</Text>
          <Text style={styles.statLabel}>Ordonnance</Text>
        </View>
      </View>

      <FlatList
        data={filteredInventory}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.catalogueId}-${item.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aucun produit trouvé dans ce catalogue.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  headerSubtitle: { marginTop: 4, color: colors.textSecondary, maxWidth: 260 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, color: colors.text },
  categoriesContainer: { backgroundColor: colors.card, paddingBottom: spacing.md },
  categories: { paddingHorizontal: spacing.md, gap: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryTextChip: { color: colors.textSecondary, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md },
  statItem: {
    flexBasis: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  statLabel: { marginTop: 4, color: colors.textSecondary, fontSize: fontSize.sm },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  itemCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.md },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  itemName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  itemMeta: { marginTop: 4, color: colors.textSecondary },
  stockBadge: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.full },
  stockBadgeText: { fontWeight: '700', fontSize: fontSize.xs },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  metricBlock: { flex: 1, backgroundColor: colors.background, padding: spacing.sm, borderRadius: borderRadius.md },
  metricLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  metricValue: { color: colors.text, fontWeight: '700', marginTop: 4, fontSize: fontSize.sm },
  categoryText: { color: colors.textSecondary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  deleteAction: { backgroundColor: colors.error + '10' },
  cardActionText: { color: colors.text, fontWeight: '600', fontSize: fontSize.sm },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  emptyText: { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, gap: spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  formGroup: { gap: spacing.xs },
  formRow: { flexDirection: 'row', gap: spacing.md },
  inputLabel: { color: colors.textSecondary, fontSize: fontSize.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { color: colors.text, fontWeight: '600' },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
