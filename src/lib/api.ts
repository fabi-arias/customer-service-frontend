// API client for communicating with the FastAPI backend
import axios from 'axios';
import { ChatRequest, ChatResponse, AgentInfo, ConnectionTest, DatabaseStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;


