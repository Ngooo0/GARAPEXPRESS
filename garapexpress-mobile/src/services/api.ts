import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';
import { decodeJwtPayload, normalizeRole } from '../utils/auth';

console.log('API_BASE_URL:', API_BASE_URL);

const TOKEN_KEY = '@garapexpress_token';
const USER_KEY = '@garapexpress_user';
const FETCH_TIMEOUT = 10000000; // 10 secondes

// Fonction utilitaire avec timeout
function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>(() => {
      setTimeout(() => {
        throw new Error('Délai d\'expiration dépassé: impossible de se connecter au serveur');
      }, timeout);
    }),
  ]);
}

// Fonction utilitaire pour les requêtes
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message =
        error?.message ||
        error?.error ||
        `Erreur ${response.status} lors de l'appel API`;
      throw new Error(message);
    }

    // Gérer les réponses vides (204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// Gestion du token
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// Gestion des données utilisateur
export async function getStoredUser(): Promise<any | null> {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: any): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Types de réponse du backend
interface LoginResponse {
  success: boolean;
  data?: string; // token
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

type LoginRole = 'client' | 'livreur' | 'admin' | 'pharmacy';

function unwrapResponseData<T>(response: T | ApiResponse<T>): T {
  if (
    response &&
    typeof response === 'object' &&
    'data' in (response as Record<string, unknown>)
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export const api = {
  // Authentification - Utilisateurs
  auth: {
    login: async (email: string, motDePasse: string, preferredRole?: LoginRole) => {
      const loginAttempts =
        preferredRole === 'pharmacy'
          ? [
              () =>
                fetchAPI<LoginResponse>('/pharmacies/login', {
                  method: 'POST',
                  body: JSON.stringify({ email, motDePasse }),
                }),
            ]
          : [
              () =>
                fetchAPI<LoginResponse>('/utilisateurs/login', {
                  method: 'POST',
                  body: JSON.stringify({ email, motDePasse }),
                }),
            ];

      let lastError: unknown;
      for (const attempt of loginAttempts) {
        try {
          const response = await attempt();
          if (response.success && response.data) {
            const payload = decodeJwtPayload(response.data);
            const normalizedRole = normalizeRole(payload?.role);

            if (
              preferredRole &&
              !(
                (preferredRole === 'client' && ['client', 'utilisateur'].includes(normalizedRole)) ||
                normalizedRole === preferredRole
              )
            ) {
              throw new Error('Ce compte ne correspond pas au profil sélectionné.');
            }

            await setToken(response.data);
            await setStoredUser({
              id: payload?.idUtilisateur ?? payload?.idPharmacie ?? 0,
              nom: payload?.nom ?? payload?.raisonSociale ?? '',
              prenom: payload?.prenom ?? '',
              telephone: payload?.telephone ?? '',
              email: payload?.email ?? email,
              role: normalizedRole,
            });
          }
          return response;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error('Erreur de connexion');
    },
    
    register: async (data: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      motDePasse: string;
      role: string;
    }) => {
      // Sélectionner la route selon le rôle
      let endpoint = '/utilisateurs/register/client';
      if (data.role === 'livreur') {
        endpoint = '/utilisateurs/register/livreur';
      } else if (data.role === 'admin') {
        endpoint = '/utilisateurs/register/admin';
      } else if (data.role === 'pharmacy') {
        endpoint = '/pharmacies/register';
      }
      
      const response = await fetchAPI<RegisterResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return response;
    },
    
    logout: async () => {
      await clearToken();
    },
    
    getProfile: async () => {
      const user = await getStoredUser();
      if (user) return { data: user };
      return fetchAPI('/utilisateurs/profile');
    },
  },

  // Pharmacies
  pharmacies: {
    getAll: async (params?: { latitude?: number; longitude?: number; estDeGarde?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.latitude) queryParams.set('latitude', params.latitude.toString());
      if (params?.longitude) queryParams.set('longitude', params.longitude.toString());
      if (params?.estDeGarde !== undefined) queryParams.set('estDeGarde', params.estDeGarde.toString());
      
      const query = queryParams.toString();
      return fetchAPI<any[]>(`/pharmacies${query ? `?${query}` : ''}`);
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/pharmacies/${id}`);
    },
    
    // Routes extended pour proximité et garde
    getProximite: async (latitude: number, longitude: number) => {
      const response = await fetchAPI<ApiResponse<any[]>>(`/pharmacies/extended/proximite?lat=${latitude}&lng=${longitude}`);
      return unwrapResponseData(response);
    },
    
    getGardeProximite: async (latitude: number, longitude: number) => {
      const response = await fetchAPI<ApiResponse<any[]>>(`/pharmacies/extended/garde/proximite?lat=${latitude}&lng=${longitude}`);
      return unwrapResponseData(response);
    },
    
    getGarde: async () => {
      return fetchAPI<any[]>('/pharmacies/garde');
    },
    
    register: async (data: {
      raisonSociale: string;
      adresse: string;
      numeroAgrement: string;
      telephone: string;
      email: string;
      motDePasse: string;
      horaires: string;
      latitude?: number;
      longitude?: number;
    }) => {
      return fetchAPI<any>('/pharmacies/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    login: async (email: string, motDePasse: string) => {
      return fetchAPI<any>('/pharmacies/login', {
        method: 'POST',
        body: JSON.stringify({ email, motDePasse }),
      });
    },
    
    updateGarde: async (pharmacieId: number, estDeGarde: boolean) => {
      return fetchAPI(`/pharmacies/extended/${pharmacieId}/garde`, {
        method: 'PUT',
        body: JSON.stringify({ estDeGarde }),
      });
    },
    
    updateHoraires: async (pharmacieId: number, horaires: string) => {
      return fetchAPI(`/pharmacies/extended/${pharmacieId}/horaires`, {
        method: 'PUT',
        body: JSON.stringify({ horaires }),
      });
    },

    update: async (pharmacieId: number, data: any) => {
      const response = await fetchAPI<ApiResponse<any>>(`/pharmacies/${pharmacieId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },

    delete: async (pharmacieId: number) => {
      return fetchAPI(`/pharmacies/${pharmacieId}`, {
        method: 'DELETE',
      });
    },
    
    getExtended: async () => {
      return fetchAPI<any[]>('/pharmacies');
    },
    
    getCatalogue: async (pharmacieId: number) => {
      const response = await fetchAPI<ApiResponse<any[]>>(`/catalogues/pharmacie/${pharmacieId}`);
      return unwrapResponseData(response) || [];
    },
  },

  // Médicaments
  medicaments: {
    getAll: async () => {
      return fetchAPI<any[]>('/medicaments');
    },
    
    search: async (query: string) => {
      return fetchAPI<any[]>(`/medicaments/search?q=${encodeURIComponent(query)}`);
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/medicaments/${id}`);
    },
    
    create: async (data: {
      nom: string;
      DCI: string;
      categorie: string;
      surOrdonnance: boolean;
      stock: number;
      prix: number;
    }) => {
      return fetchAPI<any>('/medicaments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: number, data: any) => {
      return fetchAPI<any>(`/medicaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id: number) => {
      return fetchAPI<any>(`/medicaments/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Commandes
  commandes: {
    create: async (data: {
      dateCommande: string;
      statut: string;
      montantTotal: number;
      adresseLivraison: string;
      pharmacieId: number;
      clientId: number;
    }) => {
      const response = await fetchAPI<ApiResponse<any>>('/commandes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    getAll: async () => {
      return fetchAPI<any[]>('/commandes');
    },
    
    getByClient: async (clientId: number) => {
      return fetchAPI<any[]>(`/commandes/client/${clientId}`);
    },
    
    getByPharmacie: async (pharmacieId: number) => {
      return fetchAPI<any[]>(`/commandes/pharmacie/${pharmacieId}`);
    },
    
    getByStatut: async (statut: string) => {
      return fetchAPI<any[]>(`/commandes/statut/${statut}`);
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/commandes/${id}`);
    },
    
    updateStatus: async (id: number, statut: string) => {
      const response = await fetchAPI<ApiResponse<any>>(`/commandes/${id}/statut`, {
        method: 'PATCH',
        body: JSON.stringify({ statut }),
      });
      return unwrapResponseData(response);
    },
    
    update: async (id: number, data: any) => {
      const response = await fetchAPI<ApiResponse<any>>(`/commandes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    delete: async (id: number) => {
      return fetchAPI(`/commandes/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Livraisons
  livraisons: {
    getAll: async () => {
      return fetchAPI<any[]>('/livraisons');
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/livraisons/${id}`);
    },
    
    getByLivreur: async (livreurId: number) => {
      return fetchAPI<any[]>(`/livraisons/livreur/${livreurId}`);
    },
    
    create: async (data: {
      heureDepart: string;
      heureArrivee?: string;
      statut: string;
      adresse: string;
      commandeId: number;
      livreurId: number;
    }) => {
      const response = await fetchAPI<ApiResponse<any>>('/livraisons', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    update: async (id: number, data: any) => {
      const response = await fetchAPI<ApiResponse<any>>(`/livraisons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    delete: async (id: number) => {
      return fetchAPI(`/livraisons/${id}`, {
        method: 'DELETE',
      });
    },
    
    getExtended: async () => {
      return fetchAPI<any[]>('/livraisons/extended');
    },
  },

  // Paiements
  paiements: {
    getAll: async () => {
      return fetchAPI<any[]>('/paiements');
    },

    create: async (data: {
      montant: number;
      modePaiement: string;
      statut: string;
      dateTransaction: string;
      commandeId: number;
    }) => {
      const response = await fetchAPI<ApiResponse<any>>('/paiements', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/paiements/${id}`);
    },
  },

  // Ordonnances
  ordonnances: {
    upload: async (formData: FormData) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/ordonnances/extended/upload`;
      
      console.log('Calling upload API:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', response.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || errorData.message || "Erreur lors de l'upload de l'ordonnance");
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      return result;
    },

    analyze: async (fichier: string) => {
      const response = await fetchAPI<ApiResponse<{ medicaments: any[]; message?: string }>>('/ordonnances/extended/analyser', {
        method: 'POST',
        body: JSON.stringify({ fichier }),
      });
      return unwrapResponseData(response);
    },
    
    getAll: async () => {
      return fetchAPI<any[]>('/ordonnances');
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/ordonnances/${id}`);
    },
    
    create: async (data: {
      dateEmission: string;
      fichier: string;
      statut: string;
      commandeId: number;
    }) => {
      const response = await fetchAPI<ApiResponse<any>>('/ordonnances', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    update: async (id: number, data: any) => {
      const response = await fetchAPI<ApiResponse<any>>(`/ordonnances/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    delete: async (id: number) => {
      return fetchAPI(`/ordonnances/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Notifications
  notifications: {
    getAll: async (utilisateurId?: number) => {
      if (utilisateurId) {
        return fetchAPI<any[]>(`/notifications/utilisateur/${utilisateurId}`);
      }
      return fetchAPI<any[]>('/notifications');
    },
    
    create: async (data: {
      message: string;
      type: string;
      utilisateurId: number;
    }) => {
      const response = await fetchAPI<ApiResponse<any>>('/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },

    markAsRead: async (id: number) => {
      const response = await fetchAPI<ApiResponse<any>>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
      return unwrapResponseData(response);
    },
    
    delete: async (id: number) => {
      return fetchAPI(`/notifications/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Statistiques (Admin)
  stats: {
    getDashboard: async () => {
      const response = await fetchAPI<ApiResponse<any>>('/stats');
      return unwrapResponseData(response);
    },
    getLivreurs: async () => {
      const response = await fetchAPI<ApiResponse<any[]>>('/stats/livreurs');
      return unwrapResponseData(response) || [];
    },
    getPharmacies: async () => {
      const response = await fetchAPI<ApiResponse<any[]>>('/stats/pharmacies');
      return unwrapResponseData(response) || [];
    },
  },

  // Utilisateurs (CRUD)
  utilisateurs: {
    getAll: async () => {
      return fetchAPI<any[]>('/utilisateurs');
    },
    
    getById: async (id: number) => {
      return fetchAPI<any>(`/utilisateurs/${id}`);
    },
    
    create: async (data: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      motDePasse: string;
    }) => {
      return fetchAPI<any>('/utilisateurs/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: number, data: any) => {
      return fetchAPI(`/utilisateurs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    updateLivreurDisponibilite: async (id: number, disponibilite: boolean) => {
      const response = await fetchAPI<ApiResponse<any>>(`/utilisateurs/livreurs/${id}/disponibilite`, {
        method: 'PATCH',
        body: JSON.stringify({ disponibilite }),
      });
      return unwrapResponseData(response);
    },
    
    delete: async (id: number) => {
      return fetchAPI(`/utilisateurs/${id}`, {
        method: 'DELETE',
      });
    },

    // Réinitialisation du mot de passe
    forgotPassword: async (telephone: string) => {
      const response = await fetchAPI<ApiResponse<{ success: boolean; message: string; code?: string }>>('/utilisateurs/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ telephone }),
      });
      return unwrapResponseData(response);
    },

    resetPassword: async (telephone: string, code: string, nouveauMotDePasse: string) => {
      const response = await fetchAPI<ApiResponse<{ success: boolean; message: string }>>('/utilisateurs/reset-password', {
        method: 'POST',
        body: JSON.stringify({ telephone, code, nouveauMotDePasse }),
      });
      return unwrapResponseData(response);
    },

    // Réinitialisation par email
    forgotPasswordByEmail: async (email: string) => {
      const response = await fetchAPI<ApiResponse<{ success: boolean; message: string }>>('/utilisateurs/forgot-password-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return unwrapResponseData(response);
    },

    resetPasswordByEmail: async (email: string, nouveauMotDePasse: string) => {
      const response = await fetchAPI<ApiResponse<{ success: boolean; message: string }>>('/utilisateurs/reset-password-email', {
        method: 'POST',
        body: JSON.stringify({ email, nouveauMotDePasse }),
      });
      return unwrapResponseData(response);
    },
  },

  // Catalogues de pharmacies
  catalogues: {
    getAll: async () => {
      const response = await fetchAPI<ApiResponse<any[]>>('/catalogues');
      return unwrapResponseData(response);
    },
    
    getByPharmacie: async (pharmacieId: number) => {
      const response = await fetchAPI<ApiResponse<any[]>>(`/catalogues/pharmacie/${pharmacieId}`);
      return unwrapResponseData(response);
    },
    
    create: async (data: {
      prix: number;
      quantiteStock: number;
      disponibilite: boolean;
      dateMAJ: string;
      pharmacieId: number;
      medicamentId: number;
    }) => {
      const response = await fetchAPI<ApiResponse<any>>('/catalogues', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    update: async (id: number, data: any) => {
      const response = await fetchAPI<ApiResponse<any>>(`/catalogues/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return unwrapResponseData(response);
    },
    
    delete: async (id: number) => {
      return fetchAPI(`/catalogues/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

export default api;
export { API_BASE_URL };
