import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAIDetector } from '@/hooks/useAIDetector';
import { preprocessImage } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Paths, File } from 'expo-file-system';
import { ArrowLeft } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';

export default function PreviewScreen() {
  const { imageUrl } = useLocalSearchParams<{ imageUrl: string }>();
  const { isLoading: modelLoading, detectAI } = useAIDetector();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [detecting, setDetecting] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleDetect = async () => {
    if (!imageUrl) return;

    try {
      setDetecting(true);
      setResult(null);

      // 1. Download gambar ke cache directory
      console.log('📥 Downloading image from URL...');
      const tempFile = new File(Paths.cache, 'temp_image.jpg');

      // Download file
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      // Convert to bytes and write to file
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create file and write content
      tempFile.create({ overwrite: true });
      tempFile.write(bytes);

      console.log('✅ Image downloaded:', tempFile.uri);

      // 2. Preprocess image
      const imageData = await preprocessImage(tempFile.uri);

      // 3. Run detection
      const detectionResult = await detectAI(imageData);
      setResult(detectionResult);

      // 4. Cleanup temp file
      await tempFile.delete();
    } catch (err) {
      console.error('Detection failed:', err);
      alert('Gagal menganalisis gambar. Pastikan URL valid.');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Preview Gambar',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="pl-10 text-foreground" />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="flex-1 p-6">
          {/* Preview Area */}
          <View className="mb-6 aspect-[5/6] w-full items-center justify-center overflow-hidden rounded-3xl">
            {loading && !error && (
              <View className="absolute z-10">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            {error ? (
              <View className="items-center p-8">
                <Text className="mb-2 text-center text-xl font-semibold text-foreground">
                  Gagal memuat gambar
                </Text>
                <Text className="text-center text-sm text-muted-foreground">
                  Pastikan URL gambar valid dan dapat diakses
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: imageUrl }}
                className="h-full w-full"
                resizeMode="cover"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            )}
          </View>

          {/* Image URL */}
          <View className="mb-6 rounded-2xl bg-secondary p-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">URL Gambar:</Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={2}>
              {imageUrl}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Button onPress={handleDetect} disabled={detecting || modelLoading || error}>
              <Text>
                {detecting
                  ? 'Menganalisis...'
                  : modelLoading
                    ? 'Memuat Model...'
                    : 'Analisis Gambar Ini'}
              </Text>
            </Button>

            {/* Result Display */}
            {result && (
              <View
                className={cn('rounded-2xl p-6', {
                  'bg-yellow-600/20': result.isUncertain,
                  'bg-purple-600/20': !result.isUncertain && result.isAI,
                  'bg-green-600/20': !result.isUncertain && !result.isAI,
                })}>
                {result.isUncertain ? (
                  <>
                    <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                      ⚠️ Tidak Diketahui
                    </Text>
                    <Text className="mb-3 text-center text-base text-muted-foreground">
                      Model tidak yakin dengan hasil analisis
                    </Text>
                    <Text className="mb-1 text-center text-sm text-foreground">
                      Confidence: {result.confidence.toFixed(1)}%
                    </Text>
                    <Text className="text-center text-xs text-muted-foreground">
                      (Threshold minimum: 60%)
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                      {result.isAI ? '🤖 AI Generated' : '🎨 Gambar Asli'}
                    </Text>
                    <Text className="mb-1 text-center text-base text-foreground">
                      Confidence: {result.confidence.toFixed(1)}%
                    </Text>
                  </>
                )}
              </View>
            )}

            <Button variant="outline" onPress={() => router.back()}>
              <Text>Kembali</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
