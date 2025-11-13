// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserCached, loadCachedUser, setUserFromEvent, clearUser, type AuthUser } from '@/lib/auth-user';
import { authApi } from '@/lib/api';

type AuthState = { 
  user: AuthUser; 
  isSupervisor: boolean; 
  isAgent: boolean;
  isLoading: boolean;
};

const Ctx = createContext<AuthState>({ 
  user: null, 
  isSupervisor: false, 
  isAgent: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1) Carga inicial + revalidación en background (con catch)
  useEffect(() => {
    const cached = loadCachedUser();
    if (cached?.user) {
      setUser(cached.user);
      setIsLoading(false);
      getUserCached()
        .then(setUser)
        .catch((err) => {
          console.error('Auth bootstrap revalidate failed:', err);
          // opcional: window.dispatchEvent(new CustomEvent('auth:error', { detail: 'No se pudo refrescar la sesión' }));
        });
    } else {
      getUserCached()
        .then((u) => {
          setUser(u);
        })
        .catch((err) => {
          console.error('Auth bootstrap failed:', err);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  // 2) Listeners globales con try/catch en onLogin
  useEffect(() => {
    const onLogin = async () => {
      try {
        const u = await authApi.me();
        setUser(u);
        setUserFromEvent(u);
      } catch (error) {
        console.error('Failed to refresh user after login:', error);
        // Mantener estado consistente: limpiar usuario si el refresh falla
        setUser(null);
        clearUser();
        // Notificar a la app si querés mostrar un toast/banner
        window.dispatchEvent(
          new CustomEvent('auth:error', { detail: 'No se pudo cargar el perfil de usuario' })
        );
      }
    };

    const onUnauthorized = () => { 
      setUser(null); 
      clearUser(); 
    };

    window.addEventListener('auth:login-success', onLogin);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    
    return () => {
      window.removeEventListener('auth:login-success', onLogin);
      window.removeEventListener('auth:unauthorized', onUnauthorized);
    };
  }, []);

  const value = useMemo(() => {
    const groups = user?.groups ?? [];
    const isSupervisor = groups.includes('Supervisor');
    const isAgent = groups.includes('Agent') || isSupervisor;
    return { user, isSupervisor, isAgent, isLoading };
  }, [user, isLoading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
