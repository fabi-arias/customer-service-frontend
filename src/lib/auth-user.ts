// src/lib/auth-user.ts
import { authApi } from '@/lib/api';

export type AuthUser = { 
  email: string; 
  groups: string[];
  given_name?: string;
  family_name?: string;
} | null;

const KEY = 'auth:user:v1';
const TTL = 60_000; // 60s

let inMemory: { user: AuthUser; at: number } | null = null;
let inFlight: Promise<AuthUser> | null = null;

function now() { return Date.now(); }

export function loadCachedUser(): { user: AuthUser; at: number } | null {
  if (inMemory) return inMemory;

  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    inMemory = parsed;
    return parsed;
  } catch { 
    return null; 
  }
}

function save(user: AuthUser) {
  inMemory = { user, at: now() };
  try { 
    sessionStorage.setItem(KEY, JSON.stringify(inMemory)); 
  } catch {}
}

export async function getUserCached(): Promise<AuthUser> {
  const cached = loadCachedUser();
  if (cached && now() - cached.at < TTL) return cached.user;

  if (!inFlight) {
    inFlight = authApi.me()
      .then((u) => { 
        save(u); 
        return u; 
      })
      .catch(() => { 
        save(null); 
        return null; 
      })
      .finally(() => { 
        inFlight = null; 
      });
  }

  return inFlight;
}

// helpers de actualización "push"
export function setUserFromEvent(u: AuthUser) { 
  save(u); 
}

export function clearUser() { 
  inMemory = null;
  try { 
    sessionStorage.removeItem(KEY); 
  } catch {}
}

