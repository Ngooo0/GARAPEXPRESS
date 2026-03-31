import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import api from '../src/services/api';
import { useAppStore } from '../src/store/appStore';

interface DetectedMedicine {
  nom: string;
  dosage?: string;
  quantite?: number;
}

export default function PrescriptionScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectedMedicines, setDetectedMedicines] = useState<DetectedMedicine[]>([]);
  const [manualMode, setManualMode] = useState(false);
  const [manualMedicine, setManualMedicine] = useState('');
  const { medicines, fetchMedicines, addToCart } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, [fetchMedicines])
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setLoading(true);
    try {
      // Pour React Native, on doit lire le fichier correctement
      // Utiliser fetch pour convertir l'URI locale en blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = uri.split('/').pop() || 'ordonnance.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'pdf' ? 'application/pdf' : 'image/jpeg';
      
      // Créer un File-like object pour FormData
      const file = new File([blob], filename, { type: mimeType });
      
      const formData = new FormData();
      formData.append('fichier', file);
      
      // Log pour debug
      console.log('Uploading prescription, size:', blob.size, 'type:', mimeType);
      
      const upload = await api.ordonnances.upload(formData);
      console.log('Upload response:', upload);
      
      if (!upload?.data?.fichier && !upload?.fichier) {
        throw new Error('Aucun fichier uploaded');
      }
      
      const fichier = upload?.data?.fichier || upload?.fichier;
      const analysis = await api.ordonnances.analyze(fichier);
      const medicaments = analysis?.medicaments || [];

      setDetectedMedicines(
        medicaments.map((medicine: any) => ({
          nom: medicine.nom || medicine.DCI,
          dosage: medicine.dosage,
          quantite: 1,
        }))
      );
    } catch (error: any) {
      console.error('Erreur traitement:', error);
      Alert.alert('Erreur', error?.message || "Impossible de traiter l'ordonnance. Vérifiez que le serveur backend est démarré.");
    } finally {
      setLoading(false);
    }
  };

  const addManualMedicine = () => {
    if (manualMedicine.trim()) {
      setDetectedMedicines([...detectedMedicines, { nom: manualMedicine.trim(), quantite: 1 }]);
      setManualMedicine('');
    }
  };

  const removeMedicine = (index: number) => {
    setDetectedMedicines(detectedMedicines.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
    const matched = detectedMedicines
      .map((detected) =>
        medicines.find(
          (medicine) =>
            medicine.nom.toLowerCase().includes(detected.nom.toLowerCase()) ||
            detected.nom.toLowerCase().includes(medicine.nom.toLowerCase())
        )
      )
      .filter(Boolean);

    if (matched.length === 0) {
      Alert.alert('Aucun médicament trouvé', 'Aucun médicament détecté ne correspond au catalogue disponible.');
      return;
    }

    matched.forEach((medicine) => addToCart(medicine!));
    Alert.alert('Panier mis à jour', `${matched.length} médicament(s) ajouté(s) au panier.`, [
      { text: 'Continuer' },
      { text: 'Voir panier', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.text}>Nous avons besoin de l’accès à la caméra pour scanner les ordonnances</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser l’accès</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Scanner Ordonnance</Text>
          <View style={{ width: 24 }} />
        </View>

        <TouchableOpacity style={styles.toggleMode} onPress={() => setManualMode(!manualMode)}>
          <Text style={styles.toggleModeText}>{manualMode ? 'Passer au scanner' : 'Saisie manuelle'}</Text>
        </TouchableOpacity>

        {manualMode ? (
          <View style={styles.manualContainer}>
            <Text style={styles.label}>Nom du médicament</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={manualMedicine} onChangeText={setManualMedicine} placeholder="Ex: Doliprane 1000mg" placeholderTextColor="#999" />
              <TouchableOpacity style={styles.addButton} onPress={addManualMedicine}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.preview} />
                <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.retakeButton} onPress={() => { setImageUri(null); setDetectedMedicines([]); }}>
                    <Ionicons name="camera-reverse" size={20} color="#fff" />
                    <Text style={styles.retakeText}>Reprendre</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <CameraView style={styles.camera} facing="back" onBarcodeScanned={scanned ? undefined : () => setScanned(true)}>
                <View style={styles.overlay}>
                  <View style={styles.scanArea}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                  <Text style={styles.hint}>Placez l’ordonnance dans le cadre ou utilisez la galerie</Text>
                </View>
              </CameraView>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Analyse en cours...</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>Galerie</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {detectedMedicines.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Médicaments détectés</Text>
            {detectedMedicines.map((medicine, index) => (
              <View key={index} style={styles.medicineItem}>
                <View style={styles.medicineInfo}>
                  <Ionicons name="medical" size={20} color="#007AFF" />
                  <View>
                    <Text style={styles.medicineName}>{medicine.nom}</Text>
                    {medicine.dosage ? <Text style={styles.medicineQty}>{medicine.dosage}</Text> : null}
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeMedicine(index)}>
                  <Ionicons name="close-circle" size={24} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.validateButton} onPress={handleAddToCart}>
              <Text style={styles.validateButtonText}>Ajouter au panier</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  toggleMode: { alignSelf: 'center', padding: 12 },
  toggleModeText: { color: '#007AFF', fontSize: 14 },
  text: { fontSize: 16, textAlign: 'center', marginVertical: 20, color: '#666' },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cameraContainer: { flex: 1, minHeight: 400 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 280, height: 200, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#007AFF' },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: { color: '#fff', fontSize: 14, marginTop: 20, textAlign: 'center', paddingHorizontal: 20 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#000' },
  actionButton: { alignItems: 'center', padding: 10 },
  actionText: { color: '#fff', fontSize: 12, marginTop: 4 },
  previewContainer: { flex: 1 },
  preview: { flex: 1, resizeMode: 'contain' },
  previewActions: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  retakeButton: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  retakeText: { color: '#fff', marginLeft: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
  manualContainer: { padding: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#e5e5e5' },
  addButton: { backgroundColor: '#007AFF', width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  resultsContainer: { padding: 16, backgroundColor: '#fff', marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  medicineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  medicineInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  medicineName: { fontSize: 16, color: '#333', marginLeft: 12 },
  medicineQty: { fontSize: 14, color: '#666', marginLeft: 12 },
  validateButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  validateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
