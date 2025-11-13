// src/hooks/useAuth.ts
// Hook centralizado para manejar el estado de autenticación
import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

interface User {
  email: string;
  groups: string[];
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

// Estado global compartido para evitar múltiples llamadas simultáneas
let authCheckPromise: Promise<void> | null = null;
let cachedUser: User | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5000; // 5 segundos de cache

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = useCallback(async () => {
    // Si hay una verificación en curso, esperar a que termine
    if (authCheckPromise) {
      await authCheckPromise;
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    // Si el cache es válido, usar el usuario cacheado
    const now = Date.now();
    if (cachedUser && (now - cacheTimestamp) < CACHE_DURATION) {
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    authCheckPromise = (async () => {
      try {
        const userData = await authApi.me();
        cachedUser = userData;
        cacheTimestamp = now;
        setUser(userData);
        setError(null);
      } catch (err) {
        cachedUser = null;
        cacheTimestamp = 0;
        setUser(null);
        setError(err instanceof Error ? err : new Error('Error de autenticación'));
      } finally {
        setIsLoading(false);
        authCheckPromise = null;
      }
    })();

    await authCheckPromise;
  }, []);

  const clearAuth = useCallback(() => {
    cachedUser = null;
    cacheTimestamp = 0;
    setUser(null);
    setError(null);
  }, []);

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuchar eventos de logout/unauthorized y login success
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
    };

    const handleLoginSuccess = () => {
      // Invalidar cache y forzar refresh después de login exitoso
      cachedUser = null;
      cacheTimestamp = 0;
      checkAuth();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:login-success', handleLoginSuccess);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:login-success', handleLoginSuccess);
    };
  }, [clearAuth, checkAuth]);

  return {
    user,
    isLoading,
    error,
    checkAuth,
    clearAuth,
  };
}

