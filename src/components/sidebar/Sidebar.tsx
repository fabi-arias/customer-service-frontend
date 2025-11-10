'use client';

import { useState, useEffect } from 'react';
import { agentApi, authApi } from '@/lib/api';
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
  Loader2,
  LogIn,
  LogOut,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const router = useRouter();
  const [isAgentInfoExpanded, setIsAgentInfoExpanded] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; groups: string[] } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  const isSupervisor = user?.groups.includes('Supervisor') || false;

  // Cognito configuration
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com';
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5n2ee26mn0o1bbem2v091gp4fp';
  const redirect = encodeURIComponent(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/login/callback');
  const logoutRedirect = encodeURIComponent(process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI || 'http://localhost:3000');
  const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirect}&identity_provider=Google&prompt=select_account`;

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

  // Load user info on mount (solo si hay cookie)
  useEffect(() => {
    const loadUser = async () => {
      // Verificar si hay cookie antes de hacer la llamada
      // Esto evita llamadas innecesarias si el usuario no está autenticado
      try {
        const userData = await authApi.me();
        setUser(userData);
      } catch (error) {
        // User not authenticated - esto es normal si no hay sesión
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    // Pequeño delay para evitar múltiples llamadas al cargar
    const timer = setTimeout(loadUser, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  const handleLogout = async () => {
    console.log('🚪 Iniciando logout...');
    
    try {
      // 1. Primero, limpiar la cookie del backend
      console.log('📤 Llamando a authApi.logout()...');
      await authApi.logout();
      console.log('✅ Cookie del backend eliminada');
      
      // 2. Limpiar estado local inmediatamente
      setUser(null);
      
      // 3. Redirigir directamente a home
      // El logout local está completo (cookie eliminada, estado limpiado)
      // Para logout completo de Cognito, necesitas configurar "Sign-out URLs" en Cognito
      // y usar: ${domain}/logout?client_id=${clientId}&logout_uri=${logoutRedirect}
      console.log('🔄 Redirigiendo a home (logout local completado)...');
      console.log('ℹ️ Para logout completo de Cognito, configura "Sign-out URLs" en la consola de Cognito');
      window.location.replace('/');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      
      // Si falla, limpiar estado local y redirigir a home directamente
      setUser(null);
      console.log('🔄 Redirigiendo a home (logout local completado)...');
      window.location.replace('/');
    }
  };

  return (
    <div className="bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-y-auto">

      {/* Navigation */}
      <div className="p-3 sm:p-4 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 text-left text-white rounded-lg transition-colors text-sm sm:text-base"
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
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="truncate">Iniciar nuevo chat</span>
        </button>
        
        <button
          disabled
          className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 text-left text-white cursor-not-allowed rounded-lg text-sm sm:text-base"
          style={{
            backgroundColor: '#00A9E0',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
          }}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="truncate">Conversación actual</span>
        </button>
      </div>

      {/* Agent Information */}
      <div className="px-3 sm:px-4">
        <button
          onClick={handleAgentInfoToggle}
          className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Información del Agente</span>
          </div>
          {isAgentInfoExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isAgentInfoExpanded && (
          <div className="mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {agentInfo ? (
              <div className="space-y-2 text-xs sm:text-sm">
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
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Supervisor Actions */}
      {isSupervisor && (
        <div className="px-3 sm:px-4 mt-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Administrar usuarios</span>
          </button>
        </div>
      )}

      {/* User Profile / Login */}
      <div className="mt-auto p-3 sm:p-4">
        {isLoadingUser ? (
          <div className="p-2 sm:p-3 bg-white border border-gray-200 rounded-lg text-center text-sm text-gray-600">
            Cargando...
          </div>
        ) : user ? (
          <div className="flex items-center justify-between p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D9F2FA' }}>
                <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00A9E0' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.email}</div>
                <div className="text-xs text-gray-500 truncate">{user.groups.join(', ')}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition-colors text-sm sm:text-base"
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
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Iniciar sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}



