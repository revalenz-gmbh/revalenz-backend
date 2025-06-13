# Frontend-Backend-Integrationsplan für Revalenz

## 1. API-Client-Setup

### 1.1 Basis-Konfiguration
```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest);
      } catch (error) {
        // Refresh fehlgeschlagen -> Logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 1.2 API-Hooks
```typescript
// lib/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export const useApi = (endpoint: string) => {
  const queryClient = useQueryClient();

  const get = (params?: any) => {
    return useQuery({
      queryKey: [endpoint, params],
      queryFn: () => apiClient.get(endpoint, { params }).then(res => res.data)
    });
  };

  const post = () => {
    return useMutation({
      mutationFn: (data: any) => apiClient.post(endpoint, data).then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      }
    });
  };

  return { get, post };
};
```

## 2. Auth-Flow-Implementierung

### 2.1 Auth Context
```typescript
// lib/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2.2 Protected Routes
```typescript
// components/auth/ProtectedRoute.tsx
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';

export const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (roles && !roles.includes(user?.role)) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, user, roles]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

## 3. Tenant-Integration

### 3.1 Tenant Context
```typescript
// lib/context/TenantContext.tsx
import { createContext, useContext, useState } from 'react';
import { Tenant } from '@/types/tenant';

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant) => void;
  isTenantActive: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  return (
    <TenantContext.Provider value={{
      currentTenant,
      setCurrentTenant,
      isTenantActive: !!currentTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};
```

### 3.2 Tenant Selection
```typescript
// components/tenant/TenantSelector.tsx
import { useTenant } from '@/lib/hooks/useTenant';

export const TenantSelector = () => {
  const { tenants, currentTenant, setCurrentTenant } = useTenant();

  return (
    <select
      value={currentTenant?.id || ''}
      onChange={(e) => {
        const tenant = tenants.find(t => t.id === e.target.value);
        if (tenant) setCurrentTenant(tenant);
      }}
    >
      <option value="">Select Tenant</option>
      {tenants.map(tenant => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name}
        </option>
      ))}
    </select>
  );
};
```

## 4. Ticket-System-Integration

### 4.1 Ticket Hooks
```typescript
// lib/hooks/useTickets.ts
import { useApi } from './useApi';

export const useTickets = () => {
  const { get, post } = useApi('/tickets');

  const getTickets = (params?: any) => {
    return get(params);
  };

  const createTicket = () => {
    return post();
  };

  const updateTicket = (id: string) => {
    return useMutation({
      mutationFn: (data: any) => apiClient.put(`/tickets/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      }
    });
  };

  return { getTickets, createTicket, updateTicket };
};
```

### 4.2 Ticket Components
```typescript
// components/tickets/TicketList.tsx
import { useTickets } from '@/lib/hooks/useTickets';

export const TicketList = () => {
  const { getTickets } = useTickets();
  const { data: tickets, isLoading } = getTickets();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {tickets?.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

## 5. Implementierungsreihenfolge

1. **Phase 1: Basis-Setup**
   - [ ] API-Client-Konfiguration
   - [ ] Auth Context
   - [ ] Protected Routes
   - [ ] Basis-Komponenten

2. **Phase 2: Authentifizierung**
   - [ ] Login/Register-Formulare
   - [ ] Token-Management
   - [ ] Auth-Middleware
   - [ ] Error-Handling

3. **Phase 3: Tenant-Integration**
   - [ ] Tenant Context
   - [ ] Tenant Selection
   - [ ] Tenant-spezifische Daten
   - [ ] Tenant-Isolation

4. **Phase 4: Ticket-System**
   - [ ] Ticket CRUD
   - [ ] Kommentar-System
   - [ ] Datei-Upload
   - [ ] Status-Management

## 6. Testing-Strategie

1. **Unit Tests**
   - API-Client
   - Auth-Logik
   - Tenant-Logik
   - Ticket-Logik

2. **Integration Tests**
   - Auth-Flow
   - Tenant-Flow
   - Ticket-Flow

3. **E2E Tests**
   - Komplette User-Journeys
   - Error-Szenarien
   - Edge Cases

## 7. Performance-Optimierung

1. **Caching-Strategie**
   - React Query für API-Caching
   - Local Storage für Auth-Daten
   - Memoization für teure Berechnungen

2. **Lazy Loading**
   - Route-based Code Splitting
   - Component Lazy Loading
   - Image Lazy Loading

3. **Bundle-Optimierung**
   - Tree Shaking
   - Code Splitting
   - Asset Optimization

## 8. Monitoring und Logging

1. **Error Tracking**
   - Sentry Integration
   - Error Boundaries
   - Error Logging

2. **Performance Monitoring**
   - Lighthouse Scores
   - Core Web Vitals
   - User Metrics

3. **Analytics**
   - User Behavior
   - Feature Usage
   - Error Rates

## 9. Globaler Error-Handler

### 9.1 Error Boundary
```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Hier können wir den Error an einen Error-Tracking-Service senden
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Etwas ist schiefgelaufen</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9.2 API Error Handler
```typescript
// lib/api/errorHandler.ts
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface ApiError {
  message: string;
  code: string;
  status: number;
}

export const handleApiError = (error: AxiosError<ApiError>) => {
  const errorMessage = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
  
  switch (error.response?.status) {
    case 400:
      toast.error('Ungültige Anfrage: ' + errorMessage);
      break;
    case 401:
      toast.error('Nicht autorisiert. Bitte melden Sie sich erneut an.');
      // Trigger Logout
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

  // Logging für Monitoring
  console.error('API Error:', {
    status: error.response?.status,
    message: errorMessage,
    url: error.config?.url,
    method: error.config?.method,
  });
};
```

## 10. Detaillierte Caching-Strategie

### 10.1 React Query Konfiguration
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 Minuten
      cacheTime: 30 * 60 * 1000, // 30 Minuten
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Spezifische Cache-Konfigurationen
export const cacheConfig = {
  tickets: {
    staleTime: 2 * 60 * 1000, // 2 Minuten
    cacheTime: 10 * 60 * 1000, // 10 Minuten
  },
  user: {
    staleTime: 30 * 60 * 1000, // 30 Minuten
    cacheTime: 24 * 60 * 60 * 1000, // 24 Stunden
  },
  tenant: {
    staleTime: 60 * 60 * 1000, // 1 Stunde
    cacheTime: 24 * 60 * 60 * 1000, // 24 Stunden
  },
};
```

### 10.2 Cache-Invalidierung
```typescript
// lib/hooks/useCache.ts
import { useQueryClient } from '@tanstack/react-query';

export const useCache = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = (queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  const prefetchQueries = async (queryKey: string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  };

  const clearCache = () => {
    queryClient.clear();
  };

  return {
    invalidateQueries,
    prefetchQueries,
    clearCache,
  };
};
```

## 11. Rate-Limiting

### 11.1 API Rate Limiter
```typescript
// lib/api/rateLimiter.ts
import { AxiosRequestConfig } from 'axios';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in Millisekunden
}

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  public async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.config.timeWindow
    );

    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}

// Rate Limiter Instanzen für verschiedene Endpoints
export const rateLimiters = {
  auth: new RateLimiter({ maxRequests: 5, timeWindow: 60000 }), // 5 Anfragen pro Minute
  tickets: new RateLimiter({ maxRequests: 30, timeWindow: 60000 }), // 30 Anfragen pro Minute
  general: new RateLimiter({ maxRequests: 100, timeWindow: 60000 }), // 100 Anfragen pro Minute
};

// Axios Interceptor für Rate Limiting
export const rateLimitInterceptor = async (config: AxiosRequestConfig) => {
  const endpoint = config.url?.split('/')[1] || 'general';
  const limiter = rateLimiters[endpoint as keyof typeof rateLimiters] || rateLimiters.general;

  if (!(await limiter.checkLimit())) {
    throw new Error('Rate limit exceeded');
  }

  return config;
};
```

### 11.2 UI Feedback für Rate Limiting
```typescript
// components/RateLimitFeedback.tsx
import { useState, useEffect } from 'react';

export const RateLimitFeedback = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleRateLimit = () => {
    setShowWarning(true);
    setCountdown(60);
    setTimeout(() => setShowWarning(false), 60000);
  };

  if (!showWarning) return null;

  return (
    <div className="rate-limit-warning">
      <p>Zu viele Anfragen. Bitte warten Sie {countdown} Sekunden.</p>
    </div>
  );
};
```

### 11.3 Integration in API Client
```typescript
// lib/api/client.ts
import { rateLimitInterceptor } from './rateLimiter';

// Füge den Rate Limit Interceptor hinzu
apiClient.interceptors.request.use(rateLimitInterceptor);
```

## 12. Monitoring und Analytics

### 12.1 Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export const trackApiPerformance = (startTime: number, endpoint: string) => {
  const duration = Date.now() - startTime;
  
  // Sende Metriken an Monitoring-Service
  console.log(`API Call to ${endpoint} took ${duration}ms`);
  
  if (duration > 1000) {
    console.warn(`Slow API call detected: ${endpoint}`);
  }
};
```

### 12.2 Error Tracking
```typescript
// lib/monitoring/errors.ts
export const trackError = (error: Error, context: any) => {
  // Sende Error an Error-Tracking-Service
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}; 