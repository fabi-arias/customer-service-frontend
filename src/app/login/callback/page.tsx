// src/app/login/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
        setMsg('Intercambiando código por tokens...');
        
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
          // Pequeño delay para que el usuario vea el mensaje de éxito
          setTimeout(() => {
            router.replace('/');
          }, 1000);
        } else {
          setError('No se pudo iniciar sesión: respuesta inesperada');
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error('Error en callback:', e);
        
        let errorMessage = 'Error desconocido';
        
        if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
          errorMessage = 'El servidor tardó demasiado en responder. Verifica que el backend esté corriendo.';
        } else if (e.code === 'ERR_NETWORK' || e.message?.includes('Network Error')) {
          errorMessage = 'Error de conexión. Verifica que el backend esté corriendo en http://localhost:8000';
        } else if (e.response) {
          // El servidor respondió con un código de error
          errorMessage = e.response.data?.detail || e.response.data?.message || `Error ${e.response.status}: ${e.response.statusText}`;
        } else if (e.request) {
          // La petición se hizo pero no hubo respuesta
          errorMessage = 'No se recibió respuesta del servidor. Verifica que el backend esté corriendo.';
        } else {
          errorMessage = e.message || 'Error desconocido';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    })();
  }, [sp, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-700">{msg}</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold">Error al iniciar sesión</h2>
            </div>
            <p className="text-gray-700">{error}</p>
            <div className="pt-4 space-y-2">
              <p className="text-sm text-gray-600">Sugerencias:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Verifica que el backend esté corriendo en http://localhost:8000</li>
                <li>Revisa la consola del navegador para más detalles</li>
                <li>Intenta recargar la página</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/')}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-gray-700">{msg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

