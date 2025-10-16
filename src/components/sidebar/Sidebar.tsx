'use client';

import { useState } from 'react';
import { agentApi } from '@/lib/api';
import { AgentInfo, ConnectionTest } from '@/types';
import { 
  Plus, 
  MessageSquare, 
  Bot, 
  Trash2, 
  User, 
  ChevronDown, 
  ChevronRight,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  onClearChat: () => void;
}

export function Sidebar({ onNewChat, onClearChat }: SidebarProps) {
  const [isAgentInfoExpanded, setIsAgentInfoExpanded] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<string | null>(null);

  const loadAgentInfo = async () => {
    try {
      const info = await agentApi.getInfo();
      setAgentInfo(info);
    } catch (error) {
      console.error('Error loading agent info:', error);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await agentApi.testConnection();
      setConnectionTest(result);
      setLastConnectionCheck(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionTest({
        success: false,
        message: 'Error al probar la conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAgentInfoToggle = () => {
    if (!isAgentInfoExpanded && !agentInfo) {
      loadAgentInfo();
    }
    setIsAgentInfoExpanded(!isAgentInfoExpanded);
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Iniciar nuevo chat
        </button>
        
        <button
          disabled
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 cursor-not-allowed rounded-lg"
        >
          <MessageSquare className="w-5 h-5" />
          Conversación actual
        </button>
      </div>

      {/* Agent Information */}
      <div className="px-4">
        <button
          onClick={handleAgentInfoToggle}
          className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5" />
            Información del Agente
          </div>
          {isAgentInfoExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isAgentInfoExpanded && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {agentInfo ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Agente ID:</span>
                  <span className="ml-2 text-gray-900">{agentInfo.agent_id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Alias:</span>
                  <span className="ml-2 text-gray-900">{agentInfo.agent_alias_id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Región:</span>
                  <span className="ml-2 text-gray-900">{agentInfo.region}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Cargando información...</div>
            )}

            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingConnection ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              Probar conexión ahora
            </button>

            {/* Connection Test Results */}
            {connectionTest && (
              <div className="mt-3 p-2 rounded text-sm">
                {connectionTest.success ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <Wifi className="w-4 h-4" />
                    <span>✅ Conexión e invocación correctas.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <WifiOff className="w-4 h-4" />
                    <span>❌ Falló la invocación: {connectionTest.error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Last Connection Check */}
            {lastConnectionCheck && (
              <div className="mt-2 text-xs text-gray-500">
                Última prueba: {lastConnectionCheck}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear Chat */}
      <div className="px-4 mt-4">
        <button
          onClick={onClearChat}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Limpiar chat
        </button>
      </div>

      {/* User Profile */}
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Usuario</div>
            <div className="text-xs text-gray-600">Activo</div>
          </div>
        </div>
      </div>
    </div>
  );
}


