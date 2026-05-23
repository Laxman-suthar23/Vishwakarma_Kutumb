import { useState, useCallback } from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import { cloudinaryService, UploadResult } from '@services/cloudinary.service';
import * as ImagePicker from 'expo-image-picker';

// ─── useImagePicker Hook ──────────────────────────────────────────────────────

interface UseImagePickerOptions {
  folder?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseImagePickerReturn {
  imageUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  showPicker: () => void;
  clearImage: () => void;
}

export function useImagePicker(
  options: UseImagePickerOptions = {}
): UseImagePickerReturn {
  const { folder = 'gram-parivar', onSuccess, onError } = options;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      setIsUploading(true);
      setUploadProgress(10);

      try {
        setUploadProgress(30);
        const result = await cloudinaryService.uploadImage(asset, folder);
        setUploadProgress(100);
        setImageUrl(result.secureUrl);
        onSuccess?.(result);
      } catch (err: any) {
        const error = new Error(err?.message || 'Image upload failed');
        onError?.(error);
        Alert.alert('Upload Failed', error.message);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [folder, onSuccess, onError]
  );

  const pickImage = useCallback(async () => {
    try {
      const asset = await cloudinaryService.pickImage();
      if (asset) await handleAsset(asset);
    } catch (err: any) {
      Alert.alert('Permission Denied', err.message);
    }
  }, [handleAsset]);

  const takePhoto = useCallback(async () => {
    try {
      const asset = await cloudinaryService.takePhoto();
      if (asset) await handleAsset(asset);
    } catch (err: any) {
      Alert.alert('Permission Denied', err.message);
    }
  }, [handleAsset]);

  const showPicker = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) takePhoto();
          if (index === 2) pickImage();
        }
      );
    } else {
      // On Android, show alert dialog
      Alert.alert('Select Image', 'Choose how to add a photo', [
        { text: 'Cancel', style: 'cancel' },
        { text: '📷 Take Photo', onPress: takePhoto },
        { text: '🖼️ From Gallery', onPress: pickImage },
      ]);
    }
  }, [takePhoto, pickImage]);

  const clearImage = useCallback(() => {
    setImageUrl(null);
    setUploadProgress(0);
  }, []);

  return {
    imageUrl,
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    showPicker,
    clearImage,
  };
}

export default useImagePicker;
