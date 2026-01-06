import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAIDetector } from '@/hooks/useAIDetector';
import { cn } from '@/lib/utils';
import { preprocessImage } from '@/utils/imageUtils';
import { analyzeExif, combineDetectionResults, type ExifAnalysisResult } from '@/utils/exifAnalyzer';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import {
  ArrowRight,
  Camera,
  CloudUpload,
  FileImage,
  Image as ImageIcon,
  X,
} from 'lucide-react-native';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Deteksi',
};

type AnalysisEntry = {
  id: number;
  uri: string;
  name: string;
  isAI: boolean | null;
  confidence: number | null;
  time: string; // ISO
  thumbnailUri?: string;
};

const HISTORY_KEY = '@analysis_history';

export default function ScanScreen() {
  const { isLoading: modelLoading, detectAI } = useAIDetector();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedImageExif, setSelectedImageExif] = React.useState<Record<string, any> | null>(null);
  const [imageUrl, setImageUrl] = React.useState('');
  const [result, setResult] = React.useState<any>(null);
  const [detecting, setDetecting] = React.useState(false);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Maaf, kami memerlukan izin akses galeri untuk memilih gambar.');
        return;
      }

      // Launch image picker without manual cropping for consistent results
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // No manual crop - preprocessing will handle it
        quality: 1,
        allowsMultipleSelection: false,
        exif: true
      });

      console.log('ImagePicker result exif:', result.assets?.[0].exif);

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setSelectedImageExif(result.assets?.[0].exif || null);
        setResult(null); // Reset result
      }
    } catch (error) {
      console.error('Image picker error:', error);
      alert('Gagal membuka galeri. Coba restart aplikasi.');
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) return;

    try {
      setDetecting(true);

      // Step 1: Analyze EXIF data first
      const exifAnalysis = analyzeExif(selectedImageExif);
      console.log('EXIF Analysis:', exifAnalysis);

      // Step 2: Preprocess image
      const imageData = await preprocessImage(selectedImage);

      // Step 3: Run AI model detection
      const modelDetection = await detectAI(imageData);
      console.log('Model Detection:', modelDetection);

      // Step 4: Override strategy when EXIF is very strong
      // If EXIF score >= 70 AND strongly real, trust EXIF over model (common case: model false positive)
      if (exifAnalysis.isStronglyReal && exifAnalysis.score >= 70) {
        console.log('🛡️ Strong EXIF override - trusting camera metadata over model');
        
        // Calculate confidence with multiple factors for variance
        const indicatorCount = Object.values(exifAnalysis.indicators).filter(v => v === true).length;
        const baseConfidence = exifAnalysis.score;
        
        // Factor 1: Indicator boost
        const indicatorBoost = Math.min(indicatorCount * 3, 15);
        
        // Factor 2: Model disagreement penalty (if model strongly says AI, slightly reduce confidence)
        const modelSaysAI = modelDetection.isAI && modelDetection.confidence > 70;
        const disagreementPenalty = modelSaysAI ? Math.min((modelDetection.confidence - 70) * 0.2, 8) : 0;
        
        // Factor 3: Score-based variance to avoid fixed numbers
        const scoreVariance = (exifAnalysis.score % 5); // 0-4% variance
        
        const finalConfidence = Math.min(
          Math.max(baseConfidence + indicatorBoost - disagreementPenalty + scoreVariance, 65),
          95
        );
        
        const overrideResult = {
          isAI: false,
          isUncertain: false,
          confidence: finalConfidence,
          exifScore: exifAnalysis.score,
          modelScore: modelDetection.isAI ? modelDetection.confidence : (100 - modelDetection.confidence),
          finalScore: 100 - exifAnalysis.score,
          reasoning: [
            ...exifAnalysis.reasoning,
            `🤖 Model AI: ${modelDetection.isAI ? 'AI Generated' : 'Real'} (${modelDetection.confidence.toFixed(1)}%)`,
            `🛡️ EXIF metadata sangat kuat - foto dari kamera asli`,
          ],
        };

        setResult(overrideResult);

        // Persist to history
        const entry: AnalysisEntry = {
          id: Date.now(),
          uri: selectedImage,
          name: selectedImage.split('/').pop() || 'image',
          isAI: false,
          confidence: overrideResult.confidence,
          time: new Date().toISOString(),
        };

        try {
          const thumb = await ImageManipulator.manipulateAsync(
            entry.uri,
            [{ resize: { width: 360 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          entry.thumbnailUri = thumb.uri;
        } catch (e) {
          console.warn('Thumbnail creation failed', e);
          entry.thumbnailUri = entry.uri;
        }

        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const prev: AnalysisEntry[] = raw ? JSON.parse(raw) : [];
        const next = [entry, ...prev].slice(0, 20);

        const keptIds = new Set(next.map((i) => i.id));
        const removed = prev.filter((p) => !keptIds.has(p.id));
        for (const r of removed) {
          try {
            if (r.thumbnailUri) {
              const cacheDir = (FileSystem as any).cacheDirectory || '';
              if (cacheDir && r.thumbnailUri.startsWith(cacheDir)) {
                await FileSystem.deleteAsync(r.thumbnailUri, { idempotent: true });
              }
            }
          } catch (e) {
            console.warn('Failed to delete old thumbnail', e);
          }
        }

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        
        setDetecting(false);
        return; // Override complete
      }

      // Step 5: Normal weighted approach when EXIF is not decisive
      const weights = exifAnalysis.isStronglyReal 
        ? { exifWeight: 0.65, modelWeight: 0.35 }  // Strong EXIF: 65% EXIF, 35% Model
        : { exifWeight: 0.25, modelWeight: 0.75 }; // Weak EXIF: 25% EXIF, 75% Model

      console.log('Using weights:', weights, 'EXIF strong:', exifAnalysis.isStronglyReal);

      // Step 6: Combine both results with adaptive weighted approach
      const combinedResult = combineDetectionResults(exifAnalysis, modelDetection, {
        ...weights,
        uncertaintyThreshold: 60,
      });

      console.log('Combined Result:', combinedResult);

      // Store combined result with reasoning
      setResult({
        ...combinedResult,
        exifAnalysis, // Keep original exif analysis for detail view
      });

      // 7. Only persist entry when confident and not uncertain
      const confidence = combinedResult.confidence;
      if (!combinedResult.isUncertain && confidence >= 70) {
        try {
          const entry: AnalysisEntry = {
            id: Date.now(),
            uri: selectedImage,
            name: selectedImage.split('/').pop() || 'image',
            isAI: combinedResult.isAI,
            confidence: combinedResult.confidence,
            time: new Date().toISOString(),
          };

          // Create a small cached thumbnail and persist entry to AsyncStorage (no redirect)
          try {
            // create thumbnail (resized image) - returns a cached file uri
            try {
              const thumb = await ImageManipulator.manipulateAsync(
                entry.uri,
                [{ resize: { width: 360 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
              );
              entry.thumbnailUri = thumb.uri;
            } catch (e) {
              console.warn('Thumbnail creation failed, will fallback to original uri', e);
              entry.thumbnailUri = entry.uri;
            }

            const raw = await AsyncStorage.getItem(HISTORY_KEY);
            const prev: AnalysisEntry[] = raw ? JSON.parse(raw) : [];
            const next = [entry, ...prev].slice(0, 20);

            // Determine removed items (present in prev but not in next) and clean their thumbnails
            const keptIds = new Set(next.map((i) => i.id));
            const removed = prev.filter((p) => !keptIds.has(p.id));
            for (const r of removed) {
              try {
                if (r.thumbnailUri) {
                  const cacheDir = (FileSystem as any).cacheDirectory || '';
                  if (cacheDir && r.thumbnailUri.startsWith(cacheDir)) {
                    await FileSystem.deleteAsync(r.thumbnailUri, { idempotent: true });
                  }
                }
              } catch (e) {
                console.warn('Failed to delete old thumbnail', e);
              }
            }

            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
          } catch (err) {
            console.warn('Failed to persist history from Scan', err);
          }
        } catch (err) {
          console.warn('Failed to build/persist history entry', err);
        }
      } else {
        // Do not persist uncertain/low-confidence results
        console.log('Result uncertain or below threshold — not saved to history');
      }
    } catch (error) {
      console.error('Detection failed:', error);
      alert('Deteksi gagal. Silakan coba lagi.');
    } finally {
      setDetecting(false);
    }
  };
  
  const handlePreviewFromUrl = () => {
    if (!imageUrl.trim()) {
      alert('Mohon masukkan URL gambar terlebih dahulu');
      return;
    }

    // Basic URL validation
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      alert('URL harus dimulai dengan http:// atau https://');
      return;
    }

    router.push({
      pathname: '/preview',
      params: { imageUrl },
    });
  };

  if (modelLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-foreground">Memuat Model AI...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView className="pt-safe flex-1 bg-background px-4">
        {/* Header */}
        <View className="mb-8 mt-4 items-center">
          <Text className="mb-2 text-4xl font-bold text-foreground">Pindai Gambar</Text>
          <Text className="text-center text-base text-muted-foreground">
            Pilih gambar dari galeri Anda atau paste link gambar untuk memulai analisis.
          </Text>
        </View>

        {/* Upload Area */}
        <Pressable onPress={pickImage}>
          <View
            className={cn(
              'mb-6 max-h-[300px] items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card',
              {
                'p-10': !selectedImage,
              }
            )}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="h-full w-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <>
                <View className="mb-4 rounded-full bg-secondary p-6">
                  <Icon as={FileImage} size={48} className="text-primary" />
                </View>
                <Text className="mb-2 text-xl font-semibold text-foreground">
                  Tap untuk memilih gambar
                </Text>
                <Text className="text-sm text-muted-foreground">Mendukung format JPG, PNG</Text>
              </>
            )}
          </View>
        </Pressable>

        <Button onPress={handleDetect} disabled={!selectedImage || detecting}>
          <Text>{detecting ? 'Menganalisis...' : 'Analisis Gambar'}</Text>
        </Button>

        {/* Result Display */}
        {result && (
          <View
            className={cn('my-6 rounded-2xl p-6 border', {
              'bg-yellow-600/20 border-yellow-500': result.isUncertain,
              'bg-purple-600/20 border-purple-500': !result.isUncertain && result.isAI,
              'bg-green-600/20 border-green-500': !result.isUncertain && !result.isAI,
            })}>
            {result.isUncertain ? (
              <>
                <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                  ⚠️ Tidak Diketahui
                </Text>
                <Text className="mb-3 text-center text-base text-muted-foreground">
                  Hasil analisis tidak cukup yakin
                </Text>
              </>
            ) : (
              <>
                <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                  {result.isAI ? '🤖 AI Generated' : '📷 Gambar Asli'}
                </Text>
                <Text className="mb-1 text-center text-base text-foreground">
                  Confidence: {result.confidence.toFixed(1)}%
                </Text>
              </>
            )}
          </View>
        )}

        <Separator className="my-4" />

        {/* By image link */}
        <Text className="my-4 text-center">Atau paste link gambar di sini</Text>
        <View className="flex flex-row gap-3 mb-24">
          <Input
            className="flex-1"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button size="icon" onPress={handlePreviewFromUrl}>
            <Icon as={ArrowRight} size={20} color="#000" />
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
