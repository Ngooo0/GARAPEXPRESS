import Constants from 'expo-constants';
import { Platform } from 'react-native';

// PRODUCTION URL - Fallback pour l'API
const PRODUCTION_URL = 'https://garapexpress.onrender.com';

// URL fixe du tunnel (dev local) - pas utilisé en prod
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
    // Enlever /api, /api/v1, /v1, etc. pour avoir juste le host de base
    return configUrl
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/api\/?$/, '');
  }
  
  // Priorité 2: process.env (variable d'environnement classique)
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    console.log('Using env EXPO_PUBLIC_API_URL:', envUrl);
    // Enlever /api, /api/v1, /v1, etc.
    return envUrl
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/api\/?$/, '');
  }

  const envHost = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (envHost) {
    console.log('Using EXPO_PUBLIC_API_HOST:', envHost);
    return `http://${normalizeHost(envHost)}`;
  }

  // Priorité 3: Fallback vers URL de production
  console.log('Using PRODUCTION_URL as fallback');
  return PRODUCTION_URL;
}

// Get BASE_URL avec fallback vers production
const baseUrl = resolveBaseHost();
export const BASE_URL = baseUrl || PRODUCTION_URL;
export const API_BASE_URL = `${BASE_URL}/api`;
export const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

// Debug: verify the URLs are correct
console.log('API Configuration:');
console.log('  BASE_URL:', BASE_URL);
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  Expected login URL:', `${API_BASE_URL}/utilisateurs/login`);
