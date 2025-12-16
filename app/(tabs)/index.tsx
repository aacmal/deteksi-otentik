import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router, Stack } from 'expo-router';
import { ArrowRight, Scan } from 'lucide-react-native';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image, Pressable, ScrollView, View } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Beranda',
};

const HISTORY_KEY = '@analysis_history';

type AnalysisEntry = {
  id: number;
  uri: string;
  name: string;
  isAI: boolean | null;
  confidence: number | null;
  time: string; // ISO
  thumbnailUri?: string;
};

export default function HomeScreen() {
  const [history, setHistory] = React.useState<AnalysisEntry[]>([]);

  const loadHistory = React.useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
      else setHistory([]);
    } catch (err) {
      console.warn('Failed to load history', err);
    }
  }, []);

  // Load on mount
  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Reload when screen gains focus so newly-saved entries (from Scan) appear immediately
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const totalAnalysis = history.length;
  const realImages = history.filter((item) => item.isAI === false).length;
  const aiImages = history.filter((item) => item.isAI === true).length;

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

          <View className="mb-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Riwayat Analisis</Text>
            </View>

            {history.slice(0, 20).map((item) => (
              <Pressable key={item.id}>
                <View className="mb-3 flex-row items-center rounded-2xl border border-secondary bg-card p-4">
                  <Image
                    source={{ uri: item.thumbnailUri ?? item.uri }}
                    className="mr-4 h-16 w-16 rounded-xl"
                    resizeMode="cover"
                    onError={() => {
                      // If thumbnail can't be loaded, no runtime crash — image will show blank.
                    }}
                  />
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold text-foreground">
                      {item.name}
                    </Text>
                    <Text className="mb-1 text-sm text-muted-foreground">{new Date(item.time).toLocaleString()}</Text>
                    <Text className="text-xs text-muted-foreground">
                      Confidence: {item.confidence != null ? `${item.confidence.toFixed(1)}%` : '-'}
                    </Text>
                  </View>
                  <View
                    className={`rounded-lg px-3 py-1 ${
                      item.isAI === null ? 'bg-yellow-600' : item.isAI ? 'bg-purple-600' : 'bg-green-600'
                    }`}>
                    <Text className="text-xs font-bold text-white">{item.isAI === null ? 'TIDAK PASTI' : item.isAI ? 'AI GEN' : 'REAL'}</Text>
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
