import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAIDetector } from '@/hooks/useAIDetector';
import { cn } from '@/lib/utils';
import { preprocessImage } from '@/utils/imageUtils';
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
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Deteksi',
};

const recentAnalysis = [
  {
    id: 1,
    name: 'Portrait_004.jpg',
    status: 'REAL',
    time: 'Scanned 2 hours ago',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
  {
    id: 2,
    name: 'Gen_Art_v2.png',
    status: 'AI GEN',
    time: 'Scanned yesterday',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
];

export default function ScanScreen() {
  const { isLoading: modelLoading, detectAI } = useAIDetector();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
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

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
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

      // 1. Preprocess image
      const imageData = await preprocessImage(selectedImage);

      // 2. Run detection
      const detection = await detectAI(imageData);

      setResult(detection);
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
            className={cn('my-6 rounded-2xl p-6', {
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

        <Separator className="my-4" />

        {/* By image link */}
        <Text className="my-4 text-center">Atau paste link gambar di sini</Text>
        <View className="flex flex-row gap-3">
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
