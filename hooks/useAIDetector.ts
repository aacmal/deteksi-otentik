import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TensorflowModel } from 'react-native-fast-tflite';
import { getCachedModel, preloadModel } from '@/lib/modelLoader';

export type AIDetectorResult = {
  isAI: boolean;
  confidence: number;
  rawScore: number;
  isUncertain: boolean; // true jika confidence < 60%
};

export const useAIDetector = () => {
  const [model, setModel] = useState<TensorflowModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);

      // Try to get cached model first (preloaded during splash)
      let loadedModel = getCachedModel();

      if (!loadedModel) {
        // Fallback: load model if not preloaded
        console.log('⚠️ Model not preloaded, loading now...');
        loadedModel = await preloadModel();
      } else {
        console.log('✅ Using preloaded model');
      }

      setModel(loadedModel);
      setError(null);
    } catch (err) {
      console.error('Failed to load TFLite model:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAI = async (imageData: Float32Array): Promise<AIDetectorResult> => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('\n🤖 Running model inference...');
      console.log('   Input length:', imageData.length);

      // Calculate min/max manually to avoid stack overflow
      let min = 255.0,
        max = 0.0;
      for (let i = 0; i < imageData.length; i++) {
        if (imageData[i] < min) min = imageData[i];
        if (imageData[i] > max) max = imageData[i];
      }
      console.log('   Input range:', min.toFixed(1), '-', max.toFixed(1));
      console.log(
        '   First 10 values:',
        Array.from(imageData.slice(0, 10)).map((v) => v.toFixed(3))
      );

      // Run inference
      const outputs = await model.run([imageData]);
      const rawScore = Number(outputs[0][0]);

      console.log('📊 Raw score:', rawScore.toFixed(4));

      // CRITICAL: Interpretasi hasil model
      // Model output: probability untuk class 1 (Real Art)
      // - rawScore <= 0.5 → AI-Generated (Class 0)
      // - rawScore > 0.5 → Real Art (Class 1)
      const isAI = rawScore <= 0.5;
      const confidence = isAI ? 1 - rawScore : rawScore;
      const confidencePercent = confidence * 100;

      // Threshold: jika confidence < 60%, tandai sebagai uncertain
      const UNCERTAINTY_THRESHOLD = 60;
      const isUncertain = confidencePercent < UNCERTAINTY_THRESHOLD;

      const result = {
        isAI,
        confidence: confidencePercent,
        rawScore,
        isUncertain,
      };

      console.log('✅ Detection complete:');
      console.log(`   Label: ${isUncertain ? 'Uncertain' : isAI ? 'AI-Generated' : 'Real Art'}`);
      console.log(`   Confidence: ${confidencePercent.toFixed(1)}%`);
      console.log(`   Raw Score: ${rawScore.toFixed(4)}`);

      return result;
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
