import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#C8102E', borderTopColor: '#a00e26', height: 60 },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#ffaaaa',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="period" options={{ title: 'Thời kỳ', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📜</Text> }} />
      <Tabs.Screen name="person" options={{ title: 'Nhân vật', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⚔️</Text> }} />
      <Tabs.Screen name="game" options={{ title: 'Game', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🎮</Text> }} />
      <Tabs.Screen name="explore" options={{ title: 'Khám phá', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🔍</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Hồ sơ', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>👤</Text> }} />
    </Tabs>
  );
}