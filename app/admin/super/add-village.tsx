import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useCreateVillage, useUpdateVillage } from '@hooks/useQueries';
import { cloudinaryService } from '@services/cloudinary.service';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { COLORS } from '@constants/colors';

export default function AddVillageScreen() {
  const { villageId, editMode } = useLocalSearchParams<{
    villageId?: string;
    editMode?: string;
  }>();

  const isEdit = editMode === 'true';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const createVillage = useCreateVillage();
  const updateVillage = useUpdateVillage();

  const handleImagePick = async () => {
    try {
      setIsUploading(true);
      const result = await cloudinaryService.pickAndUpload('gram-parivar/villages');
      if (result) setCoverImageUrl(result.secureUrl);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Village name is required.');
      return;
    }

    try {
      if (isEdit && villageId) {
        await updateVillage.mutateAsync({
          id: villageId,
          data: { name: name.trim(), description, coverImageUrl },
        });
        Alert.alert('✅ Village Updated!', `"${name}" has been updated.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createVillage.mutateAsync({
          name: name.trim(),
          description,
          coverImageUrl,
        });
        Alert.alert('✅ Village Added!', `"${name}" has been added to the directory.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save village.');
    }
  };

  const isSaving = createVillage.isPending || updateVillage.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEdit ? 'Edit Village' : 'Add New Village'}
            </Text>
            <View style={{ width: 70 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Village Cover Image */}
          <Text style={styles.label}>Village Cover Image</Text>
          <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker} disabled={isUploading}>
            {coverImageUrl ? (
              <Image source={{ uri: coverImageUrl }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <LinearGradient colors={['#8B1A1A', '#3D0C11']} style={styles.imagePlaceholder}>
                {isUploading ? (
                  <ActivityIndicator color={COLORS.gold[400]} />
                ) : (
                  <>
                    <Text style={{ fontSize: 32 }}>🏘️</Text>
                    <Text style={styles.imagePlaceholderText}>Tap to upload village cover</Text>
                  </>
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Input
            label="Village Name"
            placeholder="e.g., Rampur, Sonpur, Krishnapur"
            value={name}
            onChangeText={setName}
            required
          />
          <Input
            label="Description (Optional)"
            placeholder="Brief description about this village..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              After adding the village, you can assign a village admin to manage families and members within it.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title={isSaving ? 'Saving...' : isEdit ? '✅ Update Village' : '✅ Save Village'}
            onPress={handleSave}
            isLoading={isSaving}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: { color: COLORS.gold.light, fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FEFDF8' },
  form: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.maroon[800], marginBottom: 8 },
  imagePicker: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.gold[300],
    borderStyle: 'dashed',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: { color: 'rgba(245,208,110,0.7)', fontSize: 13 },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1565C0',
  },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: 13, color: '#0D47A1', flex: 1, lineHeight: 20 },
  bottomBar: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FEFDF8',
    borderTopWidth: 1,
    borderTopColor: COLORS.cream[200],
  },
});
