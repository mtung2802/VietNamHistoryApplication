import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.flag}>🇻🇳</Text>
      <Text style={styles.title}>Lịch Sử Việt Nam</Text>
      <Text style={styles.subtitle}>Khám phá lịch sử dân tộc</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/period')}>
        <Text style={styles.buttonText}>Bắt đầu →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#C8102E', alignItems: 'center', justifyContent: 'center' },
  flag: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#fff', marginBottom: 48 },
  button: { backgroundColor: '#FFD700', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#C8102E' },
});