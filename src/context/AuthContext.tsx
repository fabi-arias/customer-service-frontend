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
  // 1) valor sincrónico inicial (cero "Cargando…")
  const initial = loadCachedUser()?.user ?? null;
  const [user, setUser] = useState<AuthUser>(initial);
  const [isLoading, setIsLoading] = useState(initial === null);

  // 2) revalidación en background una sola vez
  useEffect(() => {
    if (initial === null) {
      getUserCached().then((u) => {
        setUser(u);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      // Revalidar en background sin bloquear
      getUserCached().then(setUser);
    }
  }, []);

  // 3) listeners globales (ya emites estos eventos)
  useEffect(() => {
    const onLogin = async () => {
      const u = await authApi.me();
      setUser(u);
      setUserFromEvent(u);
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

