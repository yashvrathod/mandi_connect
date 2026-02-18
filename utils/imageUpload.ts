// ==================== Image Upload Utilities ====================

import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { farmerMarketplaceAPI } from '../services/api';
import logger from './logger';
import { handleApiError } from './errorHandler';

export interface ImageUploadResult {
  url: string;
  publicId: string;
}

/**
 * Request camera and media library permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and photo library permissions to upload images.'
        );
        return false;
      }
    }
    return true;
  } catch (error) {
    logger.error('Error requesting permissions', error);
    return false;
  }
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      logger.info('Image picked from gallery', { uri: result.assets[0].uri });
      return result.assets[0];
    }

    return null;
  } catch (error) {
    logger.error('Error picking image from gallery', error);
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
};

/**
 * Take photo with camera
 */
export const takePhotoWithCamera = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      logger.info('Photo taken with camera', { uri: result.assets[0].uri });
      return result.assets[0];
    }

    return null;
  } catch (error) {
    logger.error('Error taking photo with camera', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
};

/**
 * Show image source picker (camera or gallery)
 */
export const showImageSourcePicker = (): Promise<'camera' | 'gallery' | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Image Source',
      'Choose where you want to pick the image from',
      [
        {
          text: 'Camera',
          onPress: () => resolve('camera'),
        },
        {
          text: 'Gallery',
          onPress: () => resolve('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Pick image (shows source picker first)
 */
export const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const source = await showImageSourcePicker();
  
  if (!source) return null;
  
  if (source === 'camera') {
    return await takePhotoWithCamera();
  } else {
    return await pickImageFromGallery();
  }
};

/**
 * Upload image to server
 */
export const uploadImageToServer = async (
  imageAsset: ImagePicker.ImagePickerAsset
): Promise<ImageUploadResult | null> => {
  try {
    const formData = new FormData();
    
    // Get file extension
    const uriParts = imageAsset.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    // Create file object for FormData
    const file: any = {
      uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
      name: `crop_${Date.now()}.${fileType}`,
      type: `image/${fileType}`,
    };

    formData.append('image', file);

    logger.info('Uploading image to server', { 
      fileName: file.name,
      fileType: file.type 
    });

    const response = await farmerMarketplaceAPI.uploadImage(formData);
    const result = response.data?.data || response.data;

    if (!result?.url) {
      throw new Error('Server did not return image URL');
    }

    logger.info('Image uploaded successfully', { 
      url: result.url,
      publicId: result.publicId 
    });

    return {
      url: result.url,
      publicId: result.publicId || '',
    };
  } catch (error: any) {
    logger.error('Error uploading image', error);
    const errorMsg = handleApiError(error, 'Uploading image');
    Alert.alert('Upload Failed', errorMsg);
    return null;
  }
};

/**
 * Delete image from server
 */
export const deleteImageFromServer = async (publicId: string): Promise<boolean> => {
  try {
    logger.info('Deleting image from server', { publicId });
    await farmerMarketplaceAPI.deleteImage(publicId);
    logger.info('Image deleted successfully', { publicId });
    return true;
  } catch (error: any) {
    logger.error('Error deleting image', error);
    const errorMsg = handleApiError(error, 'Deleting image');
    Alert.alert('Delete Failed', errorMsg);
    return false;
  }
};

/**
 * Validate image file size (max 5MB)
 */
export const validateImageSize = (imageAsset: ImagePicker.ImagePickerAsset): boolean => {
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  
  if (imageAsset.fileSize && imageAsset.fileSize > maxSizeInBytes) {
    Alert.alert(
      'File Too Large',
      'Please select an image smaller than 5MB'
    );
    return false;
  }
  
  return true;
};

/**
 * Complete image upload flow (pick, validate, upload)
 */
export const pickAndUploadImage = async (): Promise<ImageUploadResult | null> => {
  // Pick image
  const imageAsset = await pickImage();
  if (!imageAsset) return null;

  // Validate size
  if (!validateImageSize(imageAsset)) return null;

  // Upload
  return await uploadImageToServer(imageAsset);
};
