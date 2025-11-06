// src/lib/api.ts
// API client for communicating with the FastAPI backend
import axios, { AxiosInstance } from 'axios';
import { ChatRequest, ChatResponse, AgentInfo, ConnectionTest, DatabaseStats } from '@/types';
import { getIdToken, buildLoginUrl } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado - limpiar y redirigir a login
      if (typeof window !== "undefined") {
        localStorage.removeItem("id_token");
        window.location.href = buildLoginUrl();
      }
      return Promise.reject(new Error("401 Unauthorized"));
    }
    if (error.response?.status === 403) {
      // Autenticado pero sin rol suficiente
      return Promise.reject(new Error("403 Forbidden (rol insuficiente)"));
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

// Metrics API (solo para Supervisores)
export const metricsApi = {
  getCategories: async (from: string, to: string, top: number = 10) => {
    const response = await api.get(`/data/analytics/categories?from=${from}&to=${to}&top=${top}`);
    return response.data;
  },

  getSources: async (from: string, to: string) => {
    const response = await api.get(`/data/analytics/sources?from=${from}&to=${to}`);
    return response.data;
  },

  getAgents: async (from: string, to: string, top: number = 10) => {
    const response = await api.get(`/data/analytics/agents?from=${from}&to=${to}&top=${top}`);
    return response.data;
  },

  getClosedVolume: async (from: string, to: string) => {
    const response = await api.get(`/data/analytics/closed_volume?from=${from}&to=${to}`);
    return response.data;
  },

  getSubcategories: async (from: string, to: string, top?: number) => {
    const url = `/data/analytics/subcategories?from=${from}&to=${to}${top ? `&top=${top}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getResolutionTimeByAgent: async (from: string, to: string, top?: number) => {
    const url = `/data/analytics/resolution_time/by_agent_business?from=${from}&to=${to}${top ? `&top=${top}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getAvgResolutionTime: async (from: string, to: string) => {
    const response = await api.get(`/data/analytics/resolution_time/avg_business?from=${from}&to=${to}`);
    return response.data;
  },

  getResolutionTimeBySource: async (from: string, to: string, order: string = "asc") => {
    const response = await api.get(`/data/analytics/resolution_time/by_source_business?from=${from}&to=${to}&order=${order}`);
    return response.data;
  },

  getSlowCases: async (from: string, to: string, top: number = 10) => {
    const response = await api.get(`/data/analytics/resolution_time/slow_cases_business?from=${from}&to=${to}&top=${top}`);
    return response.data;
  },
};

export default api;



