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
import { useLanguageStore } from '@store/language.store';
import { useToast } from '@store/toast.store';
import { Ionicons } from '@expo/vector-icons';

export default function AddVillageScreen() {
  const { villageId, editMode } = useLocalSearchParams<{
    villageId?: string;
    editMode?: string;
  }>();

  const isEdit = editMode === 'true';
  const locale = useLanguageStore((s) => s.locale); // dynamic language listener
  const { showToast } = useToast();

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
      showToast({
        type: 'error',
        title: locale === 'en' ? 'Upload Failed' : 'अपलोड विफल',
        message: err.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
        message: locale === 'en' ? 'Village name is required.' : 'गाँव का नाम आवश्यक है।',
      });
      return;
    }

    try {
      if (isEdit && villageId) {
        await updateVillage.mutateAsync({
          id: villageId,
          data: { name: name.trim(), description, coverImageUrl },
        });
        showToast({
          type: 'success',
          title: locale === 'en' ? 'Village Updated' : 'गाँव अपडेट हो गया',
          message: locale === 'en' ? `"${name}" has been updated.` : `"${name}" अपडेट कर दिया गया है।`,
        });
        router.back();
      } else {
        await createVillage.mutateAsync({
          name: name.trim(),
          description,
          coverImageUrl,
        });
        showToast({
          type: 'success',
          title: locale === 'en' ? 'Village Added' : 'गाँव जुड़ गया',
          message: locale === 'en' ? `"${name}" has been added to the directory.` : `"${name}" को निर्देशिका में जोड़ दिया गया है।`,
        });
        router.back();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: locale === 'en' ? 'Error' : 'त्रुटि',
        message: err.message || (locale === 'en' ? 'Failed to save village.' : 'गाँव सहेजने में विफल।'),
      });
    }
  };

  const isSaving = createVillage.isPending || updateVillage.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.gold.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEdit 
                ? (locale === 'en' ? 'Edit Village' : 'गाँव संपादित करें') 
                : (locale === 'en' ? 'Add New Village' : 'नया गाँव जोड़ें')
              }
            </Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Village Cover Image */}
          <Text style={styles.label}>
            {locale === 'en' ? 'Village Cover Image' : 'गाँव की कवर इमेज'}
          </Text>
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
                    <Text style={styles.imagePlaceholderText}>
                      {locale === 'en' ? 'Tap to upload village cover' : 'गाँव की कवर इमेज अपलोड करने के लिए टैप करें'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Input
            label={locale === 'en' ? 'Village Name' : 'गाँव का नाम'}
            placeholder={locale === 'en' ? 'e.g., Rampur, Sonpur, Krishnapur' : 'उदा. रामपुर, सोनपुर, कृष्णपुर'}
            value={name}
            onChangeText={setName}
            required
          />
          <Input
            label={locale === 'en' ? 'Description (Optional)' : 'विवरण (वैकल्पिक)'}
            placeholder={locale === 'en' ? 'Brief description about this village...' : 'इस गाँव के बारे में संक्षिप्त विवरण...'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              {locale === 'en' 
                ? 'After adding the village, you can assign a village admin to manage families and members within it.'
                : 'गाँव जोड़ने के बाद, आप इसके भीतर परिवारों और सदस्यों को प्रबंधित करने के लिए एक गाँव एडमिन नियुक्त कर सकते हैं।'
              }
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title={
              isSaving 
                ? (locale === 'en' ? 'Saving...' : 'सहेज रहा है...') 
                : isEdit 
                  ? (locale === 'en' ? '✅ Update Village' : '✅ गाँव अपडेट करें') 
                  : (locale === 'en' ? '✅ Save Village' : '✅ गाँव सहेजें')
            }
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
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
