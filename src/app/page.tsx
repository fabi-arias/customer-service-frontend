// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Loader2 } from 'lucide-react';

export default function Home() {
  const [chatKey, setChatKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading: isLoadingAuth } = useAuth();

  // Cognito configuration
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com';
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5n2ee26mn0o1bbem2v091gp4fp';
  const redirect = encodeURIComponent(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/login/callback');
  const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirect}&identity_provider=Google&prompt=select_account`;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  const handleNewChat = () => {
    setChatKey(prev => prev + 1);
    // Close sidebar on mobile after starting new chat
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  // Mostrar pantalla de login si no está autenticado
  if (isLoadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // reemplaza SOLO el return del estado !user
  if (!user) {
    return (
      <div
        className="min-h-screen grid place-items-center p-4"
        style={{
          background:
            'radial-gradient(circle at center, #01a9e0 0%, #d9f2fa 50%, white 100%)',
        }}
      >
        <div
          className="relative w-full max-w-md rounded-3xl bg-white shadow-xl px-10 py-20 sm:py-32 md:py-40 flex flex-col items-center justify-between"
          style={{ fontFamily: 'var(--font-figtree), sans-serif' }}
        >
          {/* Contenedor principal del contenido */}
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo principal */}
            <img
              src="/logo-spot3x.png"
              alt="Spot"
              className="h-18 w-auto"
            />
  
            {/* Subtítulo */}
            <p className="text-[12px] tracking-[0.18em] font-semibold text-black/80 uppercase">
              Asistente de servicio al cliente
            </p>
  
            {/* Separador */}
            <div className="h-px w-11/12 bg-gray-200" />
  
            {/* Mensaje */}
            <p className="text-base text-gray-600">
              Accede a tu cuenta para continuar.
            </p>
  
            {/* Botón login */}
            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-white text-base font-medium transition-colors"
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
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Iniciar sesión con Google
            </button>
          </div>
  
          {/* Impulsado por Muscle (al fondo) */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 opacity-70">
            <span className="text-sm text-gray-400">Impulsado por</span>
            <img
              src="/logo-muscle.png"
              alt="Muscle logo"
              className="h-4 w-auto"
            />
          </div>
        </div>
      </div>
    );
  }
  
  


  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay for mobile - covers entire screen */}
        {sidebarVisible && isMobile && (
          <div 
            className="fixed inset-0 bg-white bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        {sidebarVisible && (
          <div className={`
            fixed md:relative
            left-0 top-0 h-full z-50
            w-64 transition-all duration-300 ease-in-out
            ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar 
              onNewChat={handleNewChat}
            />
          </div>
        )}
        
        {/* Chat Area - always visible with white background, above overlay */}
        <div className="flex-1 flex flex-col bg-white min-w-0 relative z-40 md:z-0">
          <ChatInterface key={chatKey} />
        </div>
      </div>
    </div>
  );
}