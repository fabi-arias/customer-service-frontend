// src/components/auth/LoginButtons.tsx
"use client";

import { useState, useEffect } from "react";
import { buildLoginUrl, buildLogoutUrl, clearIdToken, getIdToken, getRoleFromToken, getEmailFromToken } from "@/lib/auth";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginButtons() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
    setToken(getIdToken());
    
    // Escuchar cambios en localStorage (para otros tabs)
    const handleStorageChange = () => {
      setToken(getIdToken());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!mounted) {
    return (
      <button
        className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 text-left text-white rounded-lg transition-colors text-sm sm:text-base"
        style={{
          backgroundColor: '#00A9E0',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
        }}
        disabled
      >
        <span className="opacity-0">Iniciar sesión</span>
      </button>
    );
  }

  const loggedIn = !!token;
  const role = loggedIn ? getRoleFromToken(token) : "Unknown";
  const email = loggedIn ? getEmailFromToken(token) : null;

  const handleLogout = () => {
    clearIdToken();
    // Redirigir a logout URL de Cognito
    window.location.href = buildLogoutUrl();
  };

  if (!loggedIn) {
    return (
      <a
        href={buildLoginUrl()}
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
        <span className="truncate">Iniciar sesión</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-2 py-1 rounded">
        <User className="w-4 h-4" style={{ color: '#00A9E0' }} />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-600 truncate max-w-[120px]">{email || "Usuario"}</span>
          <span className="text-xs text-gray-500">{role}</span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="px-3 py-2 rounded-lg text-white text-sm sm:text-base transition-colors"
        style={{ 
          backgroundColor: "#033647",
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#022a38";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#033647";
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

