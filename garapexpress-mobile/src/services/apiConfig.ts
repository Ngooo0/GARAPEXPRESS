import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = '3000';

// URL fixe du tunnel - à mettre à jour avec l'URL de localtunnel/ngrok
// IP locale: 172.20.10.5 (accessible depuis téléphone sur même réseau Wi-Fi)
const TUNNEL_URL = 'http://172.20.10.5:3000';

function normalizeHost(host: string): string {
  return host.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function getFallbackHost(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  
  // Android emulator utilise 10.0.2.2 pour accéder à localhost
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  
  // iOS et autres: utiliser localhost ou l'IP de la machine
  return 'localhost';
}

function resolveBaseHost(): string {
  // Priorité 1: Variable d'environnement de Constants (via app.json extra)
  const extra = Constants?.extra?.expoConfig?.extra ?? Constants?.manifest2?.extra ?? {};
  const configUrl = extra?.EXPO_PUBLIC_API_URL;
  if (configUrl) {
    console.log('Using config EXPO_PUBLIC_API_URL:', configUrl);
    return configUrl.replace(/\/api\/?$/, '');
  }
  
  // Priorité 2: process.env (variable d'environnement classique)
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    console.log('Using env EXPO_PUBLIC_API_URL:', envUrl);
    return envUrl.replace(/\/api\/?$/, '');
  }

  const envHost = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (envHost) {
    console.log('Using EXPO_PUBLIC_API_HOST:', envHost);
    return `http://${normalizeHost(envHost)}`;
  }

  // Priorité 3: URL fixe du tunnel (fallback pour développement)
  console.log('Using fixed TUNNEL_URL:', TUNNEL_URL);
  return TUNNEL_URL;
}

export const BASE_URL = resolveBaseHost();
export const API_BASE_URL = `${BASE_URL}/api`;
export const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

console.log('API Configuration:');
console.log('  BASE_URL:', BASE_URL);
console.log('  API_BASE_URL:', API_BASE_URL);
