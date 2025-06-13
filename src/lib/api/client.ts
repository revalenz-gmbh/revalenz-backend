import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

// Basis API Client Konfiguration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rate Limiter Konfiguration
const rateLimiters = {
  auth: { maxRequests: 5, timeWindow: 60000 },    // 5 Anfragen pro Minute
  tickets: { maxRequests: 30, timeWindow: 60000 }, // 30 Anfragen pro Minute
  general: { maxRequests: 100, timeWindow: 60000 }, // 100 Anfragen pro Minute
};

// Request Interceptor für Rate Limiting und Auth
apiClient.interceptors.request.use(
  async (config) => {
    // Token hinzufügen
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Rate Limiting prüfen
    const endpoint = config.url?.split('/')[1] || 'general';
    const limiter = rateLimiters[endpoint as keyof typeof rateLimiters] || rateLimiters.general;
    
    // TODO: Implementiere Rate Limiting Logik
    // Für den ersten Schritt lassen wir das Rate Limiting erstmal weg

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor für Error Handling und Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Token Refresh Logik
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (error) {
        // Refresh fehlgeschlagen -> Logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Error Handling
    const errorMessage = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
    
    switch (error.response?.status) {
      case 400:
        toast.error('Ungültige Anfrage: ' + errorMessage);
        break;
      case 401:
        toast.error('Nicht autorisiert. Bitte melden Sie sich erneut an.');
        break;
      case 403:
        toast.error('Zugriff verweigert');
        break;
      case 404:
        toast.error('Ressource nicht gefunden');
        break;
      case 429:
        toast.error('Zu viele Anfragen. Bitte warten Sie einen Moment.');
        break;
      case 500:
        toast.error('Server-Fehler. Bitte versuchen Sie es später erneut.');
        break;
      default:
        toast.error(errorMessage);
    }

    // Error Logging
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);

export default apiClient; 