'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { clearUser } from '@/lib/auth-user';
import { 
  Plus, 
  User, 
  LogIn,
  LogOut,
  Users,
  MoreVertical,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onNewChat: () => void;
  onTemplateSelect?: (template: string) => void;
}

const SUPERVISOR_TEMPLATES = [
  'Dame tickets asociados a Carolina Talla',
  'Muéstrame los tickets creados hoy que aún no han sido resueltos',
  'Dame la transcripción del ticket con número de itinerario 6560964',
  'Dame el top de agentes con más tickets cerrados durante esta semana',
  'Un pasajero desea cambiar la fecha de su vuelo. ¿Cuál es el procedimiento?',
];

const AGENT_TEMPLATES = [
  'Dame tickets asociados a Carolina Talla',
  'Muéstrame los tickets creados hoy que aún no han sido resueltos',
  'Dame la transcripción del ticket con número de itinerario 6560964',
  'Un pasajero desea cambiar la fecha de su vuelo. ¿Cuál es el procedimiento?',
];

export function Sidebar({ onNewChat, onTemplateSelect }: SidebarProps) {
  const router = useRouter();
  const { user, isSupervisor } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Seleccionar plantillas según el rol
  const quickTemplates = isSupervisor ? SUPERVISOR_TEMPLATES : AGENT_TEMPLATES;

  // Cognito configuration
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com';
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5n2ee26mn0o1bbem2v091gp4fp';
  const redirect = encodeURIComponent(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/login/callback');
  const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirect}&identity_provider=Google&prompt=select_account`;

  const handleTemplateClick = (template: string) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    console.log('🚪 Iniciando logout...');
    
    try {
      // 1. Primero, limpiar la cookie del backend
      console.log('📤 Llamando a authApi.logout()...');
      await authApi.logout();
      console.log('✅ Cookie del backend eliminada');
    } catch (error) {
      console.error('❌ Error en logout del backend:', error);
      // Continuar con el logout local aunque falle el backend
    }
    
    // 2. Limpiar cache y disparar evento para actualizar contexto
    // Esto actualizará la UI sin necesidad de recargar la página
    clearUser();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    
    // 3. El contexto ya manejará el cambio de UI mostrando la pantalla de login
    // No necesitamos hacer window.location.replace ya que React manejará el cambio
    console.log('✅ Logout completado');
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
          <span className="truncate">Nuevo chat</span>
        </button>
        
        {/* Administrar usuarios - Solo para Supervisores */}
        {isSupervisor && (
          <button
            onClick={() => router.push('/admin/users')}
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
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Administrar usuarios</span>
          </button>
        )}
      </div>

      {/* Plantillas rápidas */}
      <div className="px-3 sm:px-4">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Plantillas rápidas
        </div>
        <div className="space-y-1">
          {quickTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateClick(template)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="flex-1">{template}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Profile / Login */}
      <div className="mt-auto p-3 sm:p-4">
        {user ? (
          <div className="relative user-menu-container">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D9F2FA' }}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00A9E0' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {user.given_name || user.family_name 
                      ? `${user.given_name || ''} ${user.family_name || ''}`.trim()
                      : user.email ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email ?? '—'}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {isSupervisor ? 'Supervisor' : user ? 'Agent' : '—'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                title="Opciones"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Menú desplegable */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
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



