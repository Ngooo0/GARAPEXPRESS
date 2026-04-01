import { API_BASE_URL } from './apiConfig';

let keepAliveInterval: NodeJS.Timeout | null = null;

/**
 * Garde le serveur Render "éveillé" en envoyant un ping toutes les 5 minutes
 * Cela évite le cold start (30-40s) quand le serveur s'endort après inactivité
 */
export function startKeepAlive() {
  if (keepAliveInterval) {
    console.log('[KeepAlive] Already running');
    return;
  }

  console.log('[KeepAlive] Starting health check every 5 minutes');

  // Premier ping immédiat (async, ne bloque pas)
  pingHealth().catch(() => {
    // Silence - c'est juste un ping
  });

  // Puis toutes les 5 minutes
  keepAliveInterval = setInterval(() => {
    pingHealth().catch(() => {
      // Silence
    });
  }, 5 * 60 * 1000); // 5 minutes
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('[KeepAlive] Stopped');
  }
}

async function pingHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout pour ping

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const now = new Date().toLocaleTimeString();
      console.log(`[KeepAlive] Ping OK at ${now}`);
    }
  } catch (error) {
    // Silence - on ne log pas les erreurs de ping
  }
}
