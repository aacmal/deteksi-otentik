import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router, Stack } from 'expo-router';
import { ArrowRight, Scan } from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Beranda',
};

const analysisHistory = [
  {
    id: 1,
    name: 'Portrait_004.jpg',
    status: 'REAL',
    time: '2 jam lalu',
    confidence: '95%',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
  {
    id: 2,
    name: 'Gen_Art_v2.png',
    status: 'AI GEN',
    time: 'Kemarin',
    confidence: '87%',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
  {
    id: 3,
    name: 'Landscape_003.jpg',
    status: 'REAL',
    time: '2 hari lalu',
    confidence: '92%',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
  {
    id: 4,
    name: 'AI_Portrait.png',
    status: 'AI GEN',
    time: '3 hari lalu',
    confidence: '89%',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
  {
    id: 5,
    name: 'Photo_001.jpg',
    status: 'REAL',
    time: 'Minggu lalu',
    confidence: '98%',
    thumbnail: require('@/assets/images/react-native-reusables-dark.png'),
  },
];

export default function HomeScreen() {
  const totalAnalysis = analysisHistory.length;
  const realImages = analysisHistory.filter((item) => item.status === 'REAL').length;
  const aiImages = analysisHistory.filter((item) => item.status === 'AI GEN').length;

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView className="pt-safe flex-1 bg-background">
        <View className="p-6">
          {/* Welcome Section */}
          <View className="mb-6 mt-4">
            <Text className="mb-2 text-3xl font-bold text-foreground">Selamat Datang! 👋</Text>
            <Text className="text-base text-muted-foreground">
              Deteksi keaslian gambar Anda dengan teknologi AI terkini
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="mb-6 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-secondary p-4">
              <Text className="mb-1 text-2xl font-bold text-foreground">{totalAnalysis}</Text>
              <Text className="text-sm text-muted-foreground">Total Analisis</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-green-600/20 p-4">
              <Text className="mb-1 text-2xl font-bold text-green-500">{realImages}</Text>
              <Text className="text-sm text-muted-foreground">Gambar Asli</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-purple-600/20 p-4">
              <Text className="mb-1 text-2xl font-bold text-purple-500">{aiImages}</Text>
              <Text className="text-sm text-muted-foreground">AI Generated</Text>
            </View>
          </View>

          {/* CTA Button */}
          <Pressable onPress={() => router.push('/(tabs)/scan')}>
            <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-blue-500 bg-blue-700/30 p-4">
              <View className="flex-row items-center gap-3">
                <View className="rounded-full bg-primary-foreground/10 p-3">
                  <Icon as={Scan} size={24} color="white" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-foreground">Mulai Analisis</Text>
                  <Text className="text-sm text-foreground/80">Pindai gambar baru sekarang</Text>
                </View>
              </View>
              <Icon as={ArrowRight} size={24} className="text-foreground" />
            </View>
          </Pressable>

          {/* Recent Analysis */}
          <View className="mb-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Riwayat Analisis</Text>
            </View>

            {analysisHistory.slice(0, 5).map((item) => (
              <Pressable key={item.id}>
                <View className="mb-3 flex-row items-center rounded-2xl border border-secondary bg-card p-4">
                  <Image
                    source={item.thumbnail}
                    className="mr-4 h-16 w-16 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold text-foreground">
                      {item.name}
                    </Text>
                    <Text className="mb-1 text-sm text-muted-foreground">{item.time}</Text>
                    <Text className="text-xs text-muted-foreground">
                      Confidence: {item.confidence}
                    </Text>
                  </View>
                  <View
                    className={`rounded-lg px-3 py-1 ${
                      item.status === 'REAL' ? 'bg-green-600' : 'bg-purple-600'
                    }`}>
                    <Text className="text-xs font-bold text-white">{item.status}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
