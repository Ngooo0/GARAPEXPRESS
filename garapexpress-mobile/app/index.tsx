import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: '800', color: '#1F2937', letterSpacing: 1 }}>GARA<Text style={{ color: '#127b05' }}>PEXPRESS</Text></Text>
      <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>
        Votre pharmacie à domicile
      </Text>
    </View>
  );
}
