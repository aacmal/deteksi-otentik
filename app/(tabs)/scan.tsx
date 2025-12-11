import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import {
  ArrowRight,
  Camera,
  CloudUpload,
  FileImage,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

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
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView className="pt-safe flex-1 bg-background">
        <View className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8 mt-4 items-center">
            <Text className="mb-2 text-4xl font-bold text-foreground">Pindai Gambar</Text>
            <Text className="text-center text-base text-muted-foreground">
              Pilih gambar dari galeri Anda atau paste link gambar untuk memulai analisis.
            </Text>
          </View>

          {/* Upload Area */}
          <Pressable>
            <View className="mb-6 min-h-[300px] items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card p-12">
              <View className="mb-4 rounded-full bg-secondary p-6">
                <Icon as={FileImage} size={48} className="text-primary" />
              </View>
              <Text className="mb-2 text-xl font-semibold text-foreground">
                Tap untuk memilih gambar
              </Text>
              <Text className="text-sm text-muted-foreground">Mendukung format JPG, PNG</Text>
            </View>
          </Pressable>

          <Button>
            <Text>Analisis Gambar</Text>
          </Button>

          <Separator className="my-4" />

          {/* By image link */}
          <Text className="my-4 text-center">Atau paste link gambar di sini</Text>
          <View className="flex flex-row gap-3">
            <Input className="flex-1" placeholder="https://example.com/image.jpg" />
            <Button size="icon">
              <Icon as={ArrowRight} size={20} color="#000" />
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
