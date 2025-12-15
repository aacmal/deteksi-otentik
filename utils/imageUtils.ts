import * as ImageManipulator from 'expo-image-manipulator';

const MODEL_INPUT_SIZE = 224; // Sesuaikan dengan input model Anda

export async function preprocessImage(imageUri: string): Promise<Uint8Array> {
  try {
    // 1. Resize image ke ukuran yang dibutuhkan model
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
      { format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipResult.base64) {
      throw new Error('Failed to get base64 from image');
    }

    // 2. Convert base64 ke Uint8Array untuk TFLite
    const imageData = base64ToUint8Array(manipResult.base64);

    return imageData;
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    throw error;
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}
