'use client';

import { useState } from 'react';
import { agentApi } from '@/lib/api';
import { AgentInfo, ConnectionTest } from '@/types';
import { 
  Plus, 
  MessageSquare, 
  Bot, 
  User, 
  ChevronDown, 
  ChevronRight,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
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
    <div className="bg-gray-50 border-r border-gray-200 flex flex-col h-full">

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-white rounded-lg transition-colors"
          style={{
            backgroundColor: '#00A9E0',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D9F2FA';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#00A9E0';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <Plus className="w-5 h-5" />
          Iniciar nuevo chat
        </button>
        
        <button
          disabled
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-white cursor-not-allowed rounded-lg"
          style={{
            backgroundColor: '#00A9E0',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
          }}
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


      {/* User Profile */}
      <div className="mt-auto p-4">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D9F2FA' }}>
              <User className="w-5 h-5" style={{ color: '#00A9E0' }} />
            </div>
            <div>
              <div className="font-medium text-gray-900">Usuario</div>
            </div>
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}



