import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Preprocess image untuk TFLite model
 * Model expects: 224x224x3 RGB image (0-255 range)
 */
export const preprocessImage = async (imageUri: string): Promise<Uint8Array> => {
  // 1. Resize ke 224x224
  const resized = await manipulateAsync(imageUri, [{ resize: { width: 224, height: 224 } }], {
    format: SaveFormat.JPEG,
    compress: 1,
  });

  // 2. Convert ke raw RGB bytes
  const response = await fetch(resized.uri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  // 3. Extract RGB values (skip alpha channel jika ada)
  const imageData = new Uint8Array(arrayBuffer);

  // Jika image punya alpha channel (RGBA), convert ke RGB
  if (imageData.length === 224 * 224 * 4) {
    const rgbData = new Uint8Array(224 * 224 * 3);
    for (let i = 0, j = 0; i < imageData.length; i += 4, j += 3) {
      rgbData[j] = imageData[i]; // R
      rgbData[j + 1] = imageData[i + 1]; // G
      rgbData[j + 2] = imageData[i + 2]; // B
      // Skip alpha (i + 3)
    }
    return rgbData;
  }

  return imageData;
};
