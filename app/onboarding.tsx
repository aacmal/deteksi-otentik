import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Image, View } from 'react-native';

export default function OnboardingScreen() {
  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-2 text-center text-muted-foreground">Selamat Datang di</Text>
      <Text className="mb-8 text-center text-4xl font-bold text-foreground">Deteksi Otentik</Text>
      <View className="mb-8 h-64 w-full items-center justify-center rounded-3xl bg-secondary">
        <Image
          source={require('../assets/images/ai.png')}
          className="h-full w-full rounded-2xl"
          resizeMode="cover"
        />
      </View>
      <Text className="mb-8 text-center text-base text-muted-foreground">
        Aplikasi untuk mendeteksi apakah gambar dibuat oleh AI atau asli
      </Text>
      <Button onPress={handleComplete} className="w-full">
        <Text>Mulai</Text>
      </Button>
    </View>
  );
}
