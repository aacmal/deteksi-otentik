# Deteksi Otentik

**Aplikasi Mobile untuk Deteksi Gambar yang Dihasilkan oleh Kecerdasan Buatan (AI)**

Project ini merupakan tugas Ujian Akhir Semester yang bertujuan untuk mengembangkan aplikasi mobile berbasis [React Native](https://reactnative.dev/) dengan menggunakan framework [Expo](https://expo.dev/). Aplikasi ini dirancang untuk mendeteksi apakah suatu gambar dibuat oleh AI atau merupakan foto asli menggunakan model machine learning TensorFlow Lite.

## Deskripsi Project

Deteksi Otentik adalah aplikasi mobile yang memungkinkan pengguna untuk menganalisis gambar dan menentukan apakah gambar tersebut dibuat menggunakan teknologi kecerdasan buatan atau merupakan gambar asli. Aplikasi ini menggunakan model machine learning yang telah dilatih untuk membedakan antara gambar hasil AI dan gambar asli dengan tingkat akurasi yang tinggi.

### Fitur Utama

- 📸 **Pemindaian Gambar**: Ambil foto langsung dari kamera atau pilih dari galeri
- 🤖 **Deteksi AI**: Analisis gambar menggunakan model TensorFlow Lite untuk mendeteksi gambar hasil AI
- 📊 **Tingkat Kepercayaan**: Menampilkan skor confidence dan hasil deteksi yang jelas
- 🔍 **Analisis EXIF**: Memeriksa metadata gambar untuk informasi tambahan
- 📱 **Multi-Platform**: Berjalan di iOS, Android, dan Web
- 🎨 **Antarmuka Modern**: Desain yang responsif dan mudah digunakan

## Teknologi yang Digunakan

Project ini dibangun menggunakan teknologi modern dan berbagai library pendukung:

- **[Expo](https://expo.dev/)** - Framework untuk pengembangan React Native
- **[Expo Router](https://expo.dev/router)** - Navigasi berbasis file system
- **[React Native](https://reactnative.dev/)** - Framework cross-platform
- **[TensorFlow Lite](https://www.tensorflow.org/lite)** - Model machine learning untuk deteksi AI
- **[Nativewind](https://www.nativewind.dev/)** - Tailwind CSS untuk React Native
- **[React Native Reusables](https://reactnativereusables.com)** - Komponen UI yang dapat digunakan kembali
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety dan developer experience yang lebih baik

## Struktur Project

```
deteksi-otentik/
├── app/                    # Halaman aplikasi (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Halaman utama
│   │   ├── scan.tsx       # Halaman pemindaian
│   │   └── about.tsx      # Halaman tentang
│   ├── index.tsx          # Entry point
│   ├── onboarding.tsx     # Halaman onboarding
│   └── preview.tsx        # Preview hasil deteksi
├── components/            # Komponen UI reusable
├── hooks/                 # Custom React hooks
│   └── useAIDetector.ts   # Hook untuk deteksi AI
├── lib/                   # Utility libraries
│   └── modelLoader.ts     # Loader model TensorFlow Lite
├── utils/                 # Fungsi utilitas
│   ├── exifAnalyzer.ts    # Analisis metadata EXIF
│   └── imageUtils.ts      # Utilitas pengolahan gambar
└── assets/               # Aset aplikasi
    └── models/           # Model machine learning
        └── model_ai_vs_real_detector.tflite
```

## Instalasi dan Menjalankan Project

### Prasyarat

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Langkah-langkah Instalasi

1. Clone repository ini:
```bash
git clone https://github.com/aacmal/deteksi-otentik
cd deteksi-otentik
```

2. Install dependencies:
```bash
npm install
# atau
yarn install
```

3. Jalankan development server:
```bash
npm run dev
# atau
yarn dev
```

### Menjalankan di Platform Berbeda

Setelah development server berjalan, Anda dapat membuka aplikasi di:

- **Android**: Tekan tombol `a` untuk membuka di Android emulator
- **iOS**: Tekan tombol `i` untuk membuka di iOS simulator _(khusus Mac)_
- **Web**: Tekan tombol `w` untuk membuka di browser

Anda juga dapat memindai QR code menggunakan aplikasi [Expo Go](https://expo.dev/go) di perangkat fisik Anda untuk testing langsung.

## Cara Menggunakan Aplikasi

1. **Onboarding**: Saat pertama kali membuka aplikasi, Anda akan melihat halaman onboarding yang menjelaskan fitur aplikasi
2. **Memilih Gambar**: Pilih gambar dari galeri atau ambil foto baru menggunakan kamera
3. **Analisis**: Aplikasi akan secara otomatis menganalisis gambar menggunakan model AI
4. **Hasil**: Lihat hasil deteksi apakah gambar tersebut dibuat oleh AI atau asli, beserta tingkat kepercayaannya
5. **Informasi Tambahan**: Aplikasi juga menampilkan analisis metadata EXIF jika tersedia

## Perintah Tambahan

```bash
# Menjalankan di Android
npm run android

# Menjalankan di iOS
npm run ios

# Membersihkan cache
npm run clean

# Membersihkan build Android
npm run clean:android

# Prebuild native code
npm run prebuild
```

## Cara Kerja Deteksi

Aplikasi ini menggunakan model TensorFlow Lite yang telah dilatih untuk membedakan antara gambar AI dan gambar asli. Proses deteksi meliputi:

1. **Preprocessing**: Gambar diproses dan dinormalisasi ke format yang sesuai dengan input model (ukuran standar dan normalisasi nilai pixel)

2. **Inferensi**: Model machine learning melakukan analisis terhadap fitur-fitur visual dalam gambar seperti pola, tekstur, dan artefak digital

3. **Prediksi**: Model memberikan dua output:
   - **Klasifikasi**: Apakah gambar terdeteksi sebagai "AI-Generated" atau "Real Photo"
   - **Confidence Score**: Tingkat keyakinan model terhadap prediksinya (0-100%)

4. **Interpretasi Hasil**:
   - Jika model memprediksi **"AI-Generated"** dengan confidence 85%, artinya model 85% yakin gambar dibuat oleh AI
   - Jika model memprediksi **"Real Photo"** dengan confidence 90%, artinya model 90% yakin gambar adalah foto asli
   - Confidence di bawah 70% akan ditandai sebagai hasil yang "tidak pasti" karena model kurang yakin dengan prediksinya

**Contoh Kasus**:
- ✅ Real Photo - Confidence 92% → Gambar kemungkinan besar asli
- ⚠️ AI-Generated - Confidence 65% → Gambar mungkin AI tapi model kurang yakin
- ✅ AI-Generated - Confidence 88% → Gambar kemungkinan besar dibuat AI
- ⚠️ Real Photo - Confidence 55% → Gambar mungkin asli tapi model kurang yakin

## Deployment

Untuk mendeploy aplikasi ini ke production, Anda dapat menggunakan [Expo Application Services (EAS)](https://expo.dev/eas):

```bash
# Build untuk Android/iOS
eas build

# Submit ke app store
eas submit

# Update over-the-air
eas update
```

Dokumentasi lengkap:
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Updates](https://docs.expo.dev/eas-update/introduction/)

## Sumber Belajar

Untuk mempelajari lebih lanjut tentang teknologi yang digunakan:

- [Dokumentasi React Native](https://reactnative.dev/docs/getting-started)
- [Dokumentasi Expo](https://docs.expo.dev/)
- [Dokumentasi Nativewind](https://www.nativewind.dev/)
- [TensorFlow Lite Guide](https://www.tensorflow.org/lite/guide)
- [React Native Reusables](https://reactnativereusables.com)

## Kontribusi dan Pengembangan Lebih Lanjut

Project ini dikembangkan sebagai bagian dari tugas akademik. Beberapa pengembangan yang dapat dilakukan di masa mendatang:

- **Dynamic Dataset & Continuous Learning**: Implementasi sistem pembelajaran berkelanjutan dimana gambar yang diupload user dapat dijadikan training data baru. Sistem ini akan:
  - Mengumpulkan gambar hasil deteksi beserta feedback dari user (apakah hasil deteksi benar/salah)
  - Menyimpan dataset ke cloud storage untuk proses re-training model secara periodik
  - Memperbarui model secara otomatis melalui over-the-air updates
  - Meningkatkan akurasi model secara bertahap dengan dataset yang terus berkembang

- Menambahkan support untuk lebih banyak format gambar (HEIC, WebP, AVIF)
- Meningkatkan akurasi model dengan arsitektur neural network yang lebih kompleks
- Menambahkan fitur batch processing untuk analisis multiple images sekaligus
- Implementasi history dan statistik deteksi dengan visualisasi grafik
- Integrasi feedback system untuk user melaporkan hasil deteksi yang salah
- Penambahan fitur perbandingan side-by-side untuk multiple images
- Export hasil deteksi dalam format PDF atau spreadsheet

## Lisensi

Project ini dibuat untuk keperluan akademik sebagai tugas Ujian Akhir Semester.