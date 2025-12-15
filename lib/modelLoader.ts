import { Platform } from 'react-native';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TensorflowModel } from 'react-native-fast-tflite';

let cachedModel: TensorflowModel | null = null;

/**
 * Preload TFLite model - untuk dipanggil saat splash screen
 */
export async function preloadModel(): Promise<TensorflowModel> {
  if (cachedModel) {
    console.log('📦 Using cached model');
    return cachedModel;
  }

  try {
    console.log('🚀 Preloading AI model...');
    const platform = Platform.OS === 'android' ? ('default' as const) : ('default' as const);

    const loadedModel = await loadTensorflowModel(
      require('../assets/models/model_ai_vs_real_detector.tflite'),
      platform
    );

    console.log('✅ Model preloaded successfully!');
    console.log('📋 Model Info:');
    console.log('   Delegate:', loadedModel.delegate);
    console.log('   Input tensors:', JSON.stringify(loadedModel.inputs, null, 2));
    console.log('   Output tensors:', JSON.stringify(loadedModel.outputs, null, 2));

    cachedModel = loadedModel;
    return loadedModel;
  } catch (err) {
    console.error('❌ Failed to preload model:', err);
    throw err;
  }
}

/**
 * Get cached model instance
 */
export function getCachedModel(): TensorflowModel | null {
  return cachedModel;
}
