import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [] 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    if (!loading && isAuthenticated && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user?.role || '');
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [loading, isAuthenticated, user, requiredRoles, router]);

  if (loading) {
    return <div>Laden...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 