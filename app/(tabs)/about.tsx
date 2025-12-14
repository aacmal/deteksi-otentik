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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cara Kerja Aplikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="mb-3">
            Aplikasi ini menggunakan teknologi TensorFlow Lite (TF Lite), sebuah framework machine
            learning yang dioptimalkan untuk perangkat mobile. Berikut adalah cara kerjanya:
          </Text>
          <View className="gap-3">
            <View className="flex-row">
              <Text className="font-bold text-primary">1. </Text>
              <Text className="flex-1">
                <Text className="font-semibold">Input Gambar: </Text>
                Pengguna mengunggah gambar melalui galeri atau link URL.
              </Text>
            </View>
            <View className="flex-row">
              <Text className="font-bold text-primary">2. </Text>
              <Text className="flex-1">
                <Text className="font-semibold">Preprocessing: </Text>
                Gambar diproses dan disesuaikan dengan format yang dibutuhkan model TF Lite.
              </Text>
            </View>
            <View className="flex-row">
              <Text className="font-bold text-primary">3. </Text>
              <Text className="flex-1">
                <Text className="font-semibold">Inferensi Model: </Text>
                Model TF Lite menganalisis pola dan karakteristik gambar untuk mendeteksi apakah
                gambar dibuat oleh AI atau asli.
              </Text>
            </View>
            <View className="flex-row">
              <Text className="font-bold text-primary">4. </Text>
              <Text className="flex-1">
                <Text className="font-semibold">Hasil Analisis: </Text>
                Aplikasi memberikan hasil berupa label "Real" atau "AI Generated" beserta tingkat
                kepercayaan (confidence score).
              </Text>
            </View>
          </View>
          <Text className="mt-3 text-sm text-muted-foreground">
            Semua proses dilakukan secara lokal di perangkat Anda, sehingga privasi dan keamanan
            data terjaga.
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
