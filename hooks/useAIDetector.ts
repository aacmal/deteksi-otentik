import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TensorflowModel } from 'react-native-fast-tflite';

export type AIDetectorResult = {
  isAI: boolean;
  confidence: number;
  rawScore: number;
};

export const useAIDetector = () => {
  const [model, setModel] = useState<TensorflowModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const platform = Platform.OS == 'android' ? ('android-gpu' as const) : ('core-ml' as const);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);

      // Load model dari assets
      const loadedModel = await loadTensorflowModel(
        require('../assets/models/model_ai_vs_real_detector.tflite'),
        platform
      );

      setModel(loadedModel);
      setError(null);
    } catch (err) {
      console.error('Failed to load TFLite model:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAI = async (imageData: Uint8Array): Promise<AIDetectorResult> => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      // Run inference
      const outputs = await model.run([imageData]);
      const rawScore = Number(outputs[0][0]); // Output adalah [0-1]

      // Interpret hasil
      const isAI = rawScore > 0.5;
      const confidence = isAI ? rawScore : 1 - rawScore;

      return {
        isAI,
        confidence: confidence * 100,
        rawScore,
      };
    } catch (err) {
      console.error('Detection error:', err);
      throw err;
    }
  };

  return {
    model,
    isLoading,
    error,
    detectAI,
  };
};
