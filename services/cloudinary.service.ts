import * as ImagePicker from 'expo-image-picker';
import { CLOUDINARY_CONFIG, IMAGE_CONFIG } from '@constants/config';

// ─── Cloudinary Upload Service ────────────────────────────────────────────────

export interface UploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
}

export const cloudinaryService = {
  /**
   * Pick an image from the device gallery
   */
  async pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Permission to access photo library was denied.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: IMAGE_CONFIG.allowsEditing,
      aspect: IMAGE_CONFIG.aspect,
      quality: IMAGE_CONFIG.quality,
      base64: false,
    });

    if (result.canceled || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  },

  /**
   * Take a photo with the camera
   */
  async takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Permission to use camera was denied.');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: IMAGE_CONFIG.allowsEditing,
      aspect: IMAGE_CONFIG.aspect,
      quality: IMAGE_CONFIG.quality,
    });

    if (result.canceled || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  },

  /**
   * Upload image to Cloudinary using unsigned upload preset
   */
  async uploadImage(
    asset: ImagePicker.ImagePickerAsset,
    folder = 'gram-parivar'
  ): Promise<UploadResult> {
    const formData = new FormData();

    // Append image file
    const filename = asset.uri.split('/').pop() || 'photo.jpg';
    const type = asset.mimeType || 'image/jpeg';

    formData.append('file', {
      uri: asset.uri,
      type,
      name: filename,
    } as any);

    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Image upload failed.');
    }

    const data = await response.json();

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  },

  /**
   * Pick and upload image in one step
   */
  async pickAndUpload(
    folder = 'gram-parivar',
    onProgress?: (progress: number) => void
  ): Promise<UploadResult | null> {
    const asset = await this.pickImage();
    if (!asset) return null;

    onProgress?.(50);
    const result = await this.uploadImage(asset, folder);
    onProgress?.(100);

    return result;
  },

  /**
   * Get optimized Cloudinary URL with transformations
   */
  getOptimizedUrl(
    secureUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg';
    } = {}
  ): string {
    const { width = 400, height = 400, quality = 'auto', format = 'auto' } = options;
    const transformations = `w_${width},h_${height},c_fill,q_${quality},f_${format}`;

    // Insert transformation after /upload/
    return secureUrl.replace('/upload/', `/upload/${transformations}/`);
  },
};
