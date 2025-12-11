import { HapticTab } from '@/components/haptic-tab';
import { Icon } from '@/components/ui/icon';
import { Tabs } from 'expo-router';
import { HouseHeart, Scan, Signature, SwatchBook } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <Icon size={28} as={SwatchBook} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Deteksi',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                backgroundColor: '#3b82f6',
                padding: 12,
                borderRadius: 16,
              }}>
              <Icon size={36} as={Scan} color="white" />
            </View>
          ),
          tabBarLabelStyle: {
            marginTop: 20,
          },
          tabBarIconStyle: {
            marginTop: -10,
          },
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Tentang',
          tabBarIcon: ({ color }) => <Icon size={28} as={Signature} color={color} />,
        }}
      />
    </Tabs>
  );
}
