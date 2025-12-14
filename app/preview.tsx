import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';

export default function PreviewScreen() {
  const { imageUrl } = useLocalSearchParams<{ imageUrl: string }>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Preview Gambar',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Icon as={ArrowLeft} size={24} className="text-foreground" />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="flex-1 p-6">
          {/* Preview Area */}
          <View className="mb-6 aspect-[5/6] w-full items-center justify-center overflow-hidden rounded-3xl bg-secondary">
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
            <Button onPress={() => console.log('Analyze image:', imageUrl)}>
              <Text>Analisis Gambar Ini</Text>
            </Button>
            <Button variant="outline" onPress={() => router.back()}>
              <Text>Kembali</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
