// src/lib/api.ts
// API client for communicating with the FastAPI backend
import axios, { AxiosError } from 'axios';
import { ChatRequest, ChatResponse, AgentInfo, ConnectionTest, DatabaseStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos de timeout (reducido de 2 minutos)
  withCredentials: true, // Importante: permite enviar cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores 401 (No autorizado) globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Manejar errores 401 (Unauthorized) - Token expirado o inválido
    if (error.response?.status === 401) {
      // Solo redirigir si no estamos ya en una página de login o callback
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/callback');
      
      if (!isAuthPage) {
        // Limpiar cualquier estado de usuario almacenado localmente
        // Nota: La cookie HttpOnly se maneja en el servidor, pero podemos
        // disparar eventos para que los componentes sepan que la sesión expiró
        if (typeof window !== 'undefined') {
          // Disparar evento personalizado para notificar a los componentes
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Chat API
export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/api/chat', request);
    return response.data;
  },
};

// Agent API
export const agentApi = {
  getInfo: async (): Promise<AgentInfo> => {
    const response = await api.get('/api/agent/info');
    return response.data;
  },

  testConnection: async (): Promise<ConnectionTest> => {
    const response = await api.post('/api/agent/test-connection');
    return response.data;
  },
};

// Database API
export const databaseApi = {
  getHealth: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get('/api/database/health');
    return response.data;
  },

  getStats: async (): Promise<DatabaseStats> => {
    const response = await api.get('/api/database/stats');
    return response.data;
  },
};

// System API
export const systemApi = {
  getHealth: async (): Promise<{ status: string; service: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  getInfo: async (): Promise<{ message: string; version: string; status: string }> => {
    const response = await api.get('/');
    return response.data;
  },
};

// Auth API
export const authApi = {
  exchange: async (code: string): Promise<{ ok: boolean; email?: string }> => {
    const response = await api.post('/auth/exchange', new URLSearchParams({ code }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  logout: async (): Promise<{ ok: boolean }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  me: async (): Promise<{ email: string; groups: string[] }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  invite: async (email: string, role: 'Agent' | 'Supervisor'): Promise<{
    ok: boolean;
    email: string;
    role: string;
    invite_url: string;
    expires_at: string;
    email_sent: boolean;
  }> => {
    const response = await api.post('/auth/invite', { email, role });
    return response.data;
  },

  accept: async (token: string): Promise<{
    ok: boolean;
    email: string;
    message: string;
  }> => {
    const response = await api.post(`/auth/accept?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  listUsers: async (): Promise<{
    ok: boolean;
    users: Array<{
      email: string;
      role: string;
      status: string;
      invited_by: string;
      token_expires_at: string | null;
      created_at: string;
      updated_at: string;
    }>;
    count: number;
  }> => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  updateUserRole: async (email: string, role: 'Agent' | 'Supervisor'): Promise<{
    ok: boolean;
    email: string;
    role: string;
    message: string;
  }> => {
    const response = await api.patch(`/auth/users/${encodeURIComponent(email)}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (email: string, status: 'pending' | 'active' | 'revoked'): Promise<{
    ok: boolean;
    email: string;
    status: string;
    message: string;
  }> => {
    const response = await api.patch(`/auth/users/${encodeURIComponent(email)}/status`, { status });
    return response.data;
  },
};

export default api;



