import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'jpeg-js';

const MODEL_INPUT_SIZE = 224;

/**
 * Preprocess gambar ke format yang dibutuhkan model
 *
 * CRITICAL NOTES:
 * - Input model: float32 dengan shape [1, 224, 224, 3]
 * - Model SUDAH include preprocessing layer (MobileNet with preprocessing)
 * - Output: Float32Array[150528] dengan nilai 0-255 (TIDAK dinormalize!)
 */
export async function preprocessImage(imageUri: string): Promise<Float32Array> {
  try {
    console.log('📐 Preprocessing image:', imageUri);

    // Step 1: Resize ke 224x224 dan langsung dapatkan base64
    console.log('📐 Resizing to 224x224...');
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 1, // No compression untuk kualitas maksimal
        base64: true, // Langsung dapatkan base64
      }
    );

    if (!resized.base64) {
      throw new Error('Failed to get base64 from resized image');
    }

    // Step 2: Decode JPEG to raw RGB pixels
    console.log('📖 Decoding image data...');
    const imageData = await decodeJPEGToRGB(resized.base64);

    // Step 3: Validate output
    const expectedSize = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
    if (imageData.length !== expectedSize) {
      throw new Error(`Invalid output size: ${imageData.length}, expected ${expectedSize}`);
    }

    console.log('✅ Preprocessing complete');
    console.log(`   Size: ${imageData.length} bytes`);

    return imageData;
  } catch (error) {
    console.error('❌ Image preprocessing failed:', error);
    throw error;
  }
}

/**
 * Decode JPEG base64 to RGB pixel array and convert to Float32
 * Converts: JPEG bytes → RGBA pixels → RGB pixels → Float32 (normalized)
 */
async function decodeJPEGToRGB(base64: string): Promise<Float32Array> {
  // 1. Convert base64 to Uint8Array
  console.log('🔍 Decoding JPEG...');
  const imageBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  console.log(`   JPEG buffer size: ${imageBuffer.length} bytes`);

  // 2. Decode JPEG to raw RGBA pixels
  const rawImageData = decode(imageBuffer, { useTArray: true });
  console.log(`   Decoded dimensions: ${rawImageData.width}x${rawImageData.height}`);
  console.log(`   RGBA data length: ${rawImageData.data.length}`);

  // 3. Convert RGBA to RGB (remove alpha channel)
  console.log('🎨 Extracting RGB channels...');
  const rgbData = new Uint8Array(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3);
  const pixels = rawImageData.data; // RGBA format

  for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
    const srcIdx = i * 4; // RGBA source
    const dstIdx = i * 3; // RGB destination

    rgbData[dstIdx] = pixels[srcIdx]; // R
    rgbData[dstIdx + 1] = pixels[srcIdx + 1]; // G
    rgbData[dstIdx + 2] = pixels[srcIdx + 2]; // B
    // Skip alpha channel
  }

  // 4. Convert uint8 to float32 WITHOUT normalization (model expects 0-255)
  console.log('🔢 Converting to Float32 (keeping 0-255 range)...');
  const float32Data = new Float32Array(rgbData.length);

  for (let i = 0; i < rgbData.length; i++) {
    float32Data[i] = rgbData[i]; // Keep original 0-255 range
  }

  // Calculate statistics untuk debugging
  let sum = 0,
    min = 255.0,
    max = 0.0;
  for (let i = 0; i < float32Data.length; i++) {
    sum += float32Data[i];
    if (float32Data[i] < min) min = float32Data[i];
    if (float32Data[i] > max) max = float32Data[i];
  }
  const mean = sum / float32Data.length;

  console.log('📊 Float32 Statistics:');
  console.log(`   Length: ${float32Data.length}`);
  console.log(`   Range: ${min.toFixed(1)} - ${max.toFixed(1)}`);
  console.log(`   Mean: ${mean.toFixed(1)}`);
  console.log(
    `   First 10: [${Array.from(float32Data.slice(0, 10))
      .map((v) => v.toFixed(1))
      .join(', ')}]`
  );

  return float32Data;
}
