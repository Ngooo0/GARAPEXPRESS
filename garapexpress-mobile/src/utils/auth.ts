export type AppRole = 'client' | 'livreur' | 'admin' | 'pharmacy' | 'utilisateur';

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = normalized + (padding ? '='.repeat(4 - padding) : '');

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let bc = 0;
  let bs: number | undefined;
  let buffer: number;
  let index = 0;

  while ((buffer = padded.charAt(index++).charCodeAt(0))) {
    const char = chars.indexOf(String.fromCharCode(buffer));
    if (char === -1) {
      continue;
    }

    bs = bc % 4 ? (bs ?? 0) * 64 + char : char;
    if (bc++ % 4) {
      output += String.fromCharCode(255 & ((bs ?? 0) >> ((-2 * bc) & 6)));
    }
  }

  return output;
}

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const decoded = decodeBase64Url(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function normalizeRole(role?: string | null): AppRole {
  if (!role) {
    return 'client';
  }

  if (role === 'rider') {
    return 'livreur';
  }

  if (role === 'pharmacie') {
    return 'pharmacy';
  }

  return role as AppRole;
}

export function getRouteForRole(role?: string | null): '/(tabs)' | '/(rider)' | '/(pharmacy)' | '/(admin)' {
  switch (normalizeRole(role)) {
    case 'admin':
      return '/(admin)';
    case 'livreur':
      return '/(rider)';
    case 'pharmacy':
      return '/(pharmacy)';
    case 'client':
    case 'utilisateur':
    default:
      return '/(tabs)';
  }
}
