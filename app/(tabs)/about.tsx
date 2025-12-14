import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { type ImageStyle, View } from 'react-native';

const LOGO = require('@/assets/images/react-native-reusables-dark.png');

const SCREEN_OPTIONS = {
  title: 'Tentang',
  headerTransparent: true,
};

const devs = ['Aca', 'Raffi', 'Rizky'];
export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerImage={
        <View>
          <View className="pt-safe h-full items-center justify-center bg-background">
            <Text className="text-center text-3xl font-medium">Tentang</Text>
            <Text className="pt-2 text-center text-2xl">Deteksi Otentik</Text>
          </View>
        </View>
      }>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Penjelasan Singkat</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>
            Deteksi Otentik adalah aplikasi yang dirancang untuk membantu pengguna memverifikasi
            keaslian sebuah gambar apakah asli (real) atau dibuat oleh kecerdasan buatan
            (AI-generated). Dengan menggunakan teknologi canggih dalam analisis gambar, aplikasi ini
            memberikan kemudahan bagi pengguna untuk memastikan keaslian konten visual yang mereka
            temui sehari-hari.
          </Text>
        </CardContent>
      </Card>
      <Text className="text-center">
        Dikembangkan oleh: {'\n'}
        {devs.join(' | ')}
      </Text>
    </ParallaxScrollView>
  );
}
