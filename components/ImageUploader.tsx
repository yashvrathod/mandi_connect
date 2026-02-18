// ==================== Reusable Image Uploader Component ====================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickAndUploadImage, deleteImageFromServer, type ImageUploadResult } from '../utils/imageUpload';

interface ImageUploaderProps {
  images: ImageUploadResult[];
  onImagesChange: (images: ImageUploadResult[]) => void;
  maxImages?: number;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  label = 'Upload Images',
}) => {
  const [uploading, setUploading] = useState(false);

  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can upload maximum ${maxImages} images`);
      return;
    }

    setUploading(true);
    try {
      const result = await pickAndUploadImage();
      if (result) {
        onImagesChange([...images, result]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // Delete from server if publicId exists
            if (imageToRemove.publicId) {
              await deleteImageFromServer(imageToRemove.publicId);
            }
            
            // Remove from local state
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  return (
    <View className="mb-4">
      <Text className="text-zinc-700 font-semibold mb-3">{label}</Text>
      
      {/* Image Grid */}
      <View className="flex-row flex-wrap gap-3 mb-3">
        {images.map((image, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri: image.url }}
              className="w-24 h-24 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full h-6 w-6 items-center justify-center"
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Add Image Button */}
        {images.length < maxImages && (
          <TouchableOpacity
            onPress={handleAddImage}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
            activeOpacity={0.7}
          >
            {uploading ? (
              <ActivityIndicator color="#059669" />
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs mt-1">Add</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <Text className="text-gray-500 text-xs">
        {images.length}/{maxImages} images uploaded
      </Text>
    </View>
  );
};
