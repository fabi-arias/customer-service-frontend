// src/app/login/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Callback() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState('Procesando inicio de sesión...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = sp.get('code');
    const errorParam = sp.get('error');
    
    // Si Cognito devuelve un error
    if (errorParam) {
      setError(`Error de autenticación: ${errorParam}`);
      setIsLoading(false);
      return;
    }
    
    if (!code) {
      setError('Falta el parámetro code en la URL');
      setIsLoading(false);
      return;
    }
    
    (async () => {
      try {        
        // Usar URLSearchParams para application/x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('code', code);
        
        const res = await api.post('/auth/exchange', params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 15000, // 15 segundos específico para este request
        });
        
        if (res.data?.ok) {
          setMsg('Sesión iniciada correctamente');
          setIsLoading(false);
          
          // Disparar evento para que el contexto actualice el usuario
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:login-success'));
          }
          
          // Pequeño delay para que el usuario vea el mensaje de éxito
          setTimeout(() => {
            router.replace('/');
          }, 1000);
        } else {
          setError('No se pudo iniciar sesión: respuesta inesperada');
          setIsLoading(false);
        }
      } catch (e: any) {
        let errorMessage = 'Error desconocido';
        let isExpectedError = false;
        
        if (e.response) {
          // El servidor respondió con un código de error
          const status = e.response.status;
          const detail = e.response.data?.detail || e.response.data?.message;
          
          if (status === 403 && detail) {
            // Error 403: es un error esperado (usuario revocado, no invitado, etc.)
            // No loguear como error del sistema, es un caso de negocio válido
            errorMessage = detail;
            isExpectedError = true;
          } else if (status === 401) {
            // Error 401: token inválido o expirado
            errorMessage = detail || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            isExpectedError = true;
          } else {
            // Otros errores del servidor (500, etc.) - estos sí son errores del sistema
            errorMessage = detail || `Error ${status}: ${e.response.statusText}`;
            if (!isExpectedError) {
              console.error('Error inesperado en callback:', e);
            }
          }
        } else if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
          errorMessage = 'El servidor tardó demasiado en responder. Verifica que el backend esté corriendo.';
          console.error('Error de timeout en callback:', e);
        } else if (e.code === 'ERR_NETWORK' || e.message?.includes('Network Error')) {
          errorMessage = 'Error de conexión. Verifica que el backend esté corriendo en http://localhost:8000';
          console.error('Error de red en callback:', e);
        } else if (e.request) {
          // La petición se hizo pero no hubo respuesta
          errorMessage = 'No se recibió respuesta del servidor. Verifica que el backend esté corriendo.';
          console.error('Error de conexión en callback:', e);
        } else {
          errorMessage = e.message || 'Error desconocido';
          console.error('Error desconocido en callback:', e);
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    })();
  }, [sp, router]);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div
      className="min-h-screen grid place-items-center p-4"
      style={{
        background:
          'radial-gradient(circle at center, #01a9e0 0%, #d9f2fa 50%, white 100%)',
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-xl px-10 py-12 sm:py-20 md:py-30 flex flex-col items-center justify-between"
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

          {isLoading ? (
            <>
              {/* Estado de carga */}
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#00A9E0' }} />
                <p className="text-base text-gray-600">{msg}</p>
              </div>
            </>
          ) : error ? (
            <>
              {/* Estado de error */}
              <div className="flex flex-col items-center space-y-6">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Error al iniciar sesión</h2>
                <p className="text-base text-gray-600">
                  Usuario no está autorizado
                </p>
                <div className="w-full pt-4">
                  <p className="text-sm text-gray-600">
                    Si necesitas acceso, contacta al administrador para ser invitado.
                  </p>
                </div>
                <button
                  onClick={handleGoHome}
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Volver al inicio
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Estado de éxito */}
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-base text-gray-600">{msg}</p>
              </div>
            </>
          )}
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

