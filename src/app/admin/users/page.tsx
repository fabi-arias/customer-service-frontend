// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [chatKey, setChatKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading: isLoadingAuth } = useAuth();

  // Solo mostrar loading en el cliente para evitar hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 🔐 Configuración Cognito DESPUÉS de los hooks
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const redirect = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;

  // Early return después de declarar hooks
  if (!domain || !clientId || !redirect) {
    console.error('Missing required authentication configuration');
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-600">Configuration error. Please contact support.</p>
      </div>
    );
  }

  // Validar formato del dominio de Cognito para evitar dominios maliciosos
  const isValidCognitoDomain =
    domain.startsWith('https://') &&
    domain.includes('.auth.') &&
    domain.includes('.amazoncognito.com');

  if (!isValidCognitoDomain) {
    console.error('Invalid Cognito domain format:', domain);
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-600">Configuration error. Please contact support.</p>
      </div>
    );
  }

  const loginUrl = `${domain}/login?client_id=${encodeURIComponent(
    clientId
  )}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(
    redirect
  )}&identity_provider=Google&prompt=select_account`;

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('chat:set-template', { detail: template })
      );
    }
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  if (!isMounted || isLoadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Estado no autenticado
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
          <div className="flex flex-col items-center text-center space-y-8">
            <img
              src="/logo-spot3x.png"
              alt="Spot"
              className="h-18 w-auto"
            />

            <p className="text-[12px] tracking-[0.18em] font-semibold text-black/80 uppercase">
              Asistente de servicio al cliente
            </p>

            <div className="h-px w-11/12 bg-gray-200" />

            <p className="text-base text-gray-600">
              Accede a tu cuenta para continuar.
            </p>

            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-white text-base font-medium transition-colors"
              style={{
                backgroundColor: '#00A9E0',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
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

  // Estado autenticado
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex-1 flex overflow-hidden relative">
        {sidebarVisible && isMobile && (
          <div
            className="fixed inset-0 bg-white bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )}

        {sidebarVisible && (
          <div
            className={`
              fixed md:relative
              left-0 top-0 h-full z-50
              w-64 transition-all duration-300 ease-in-out
              ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <Sidebar
              onNewChat={handleNewChat}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white min-w-0 relative z-40 md:z-0">
          <ChatInterface key={chatKey} />
        </div>
      </div>
    </div>
  );
}
