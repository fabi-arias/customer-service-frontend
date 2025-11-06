// src/app/invite/accept/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com';
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '5n2ee26mn0o1bbem2v091gp4fp';
const redirect = encodeURIComponent(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/login/callback');
const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirect}`;

export default function AcceptInvitePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState('Activando invitación...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sp.get('token');
    if (!token) {
      setError('Token faltante en la URL');
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setMsg('Validando token de invitación...');
        const { data } = await api.post(`/auth/accept?token=${encodeURIComponent(token)}`);
        
        if (data?.ok) {
          setMsg('Invitación activada correctamente. Redirigiendo al login...');
          setIsLoading(false);
          // Redirigir a Cognito Hosted UI después de 2 segundos
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 2000);
        } else {
          setError('No se pudo activar la invitación.');
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error('Error aceptando invitación:', e);
        const errorMsg = e?.response?.data?.detail || e?.response?.data?.message || e?.message || 'Error desconocido';
        setError(errorMsg);
        setIsLoading(false);
      }
    })();
  }, [sp]);

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
              <h2 className="text-lg font-semibold">Error al activar invitación</h2>
            </div>
            <p className="text-gray-700">{error}</p>
            <div className="pt-4 space-y-2">
              <p className="text-sm text-gray-600">Posibles causas:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>El token ha expirado (válido por 7 días)</li>
                <li>El token ya fue utilizado</li>
                <li>El token es inválido</li>
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
            <p className="text-gray-700 text-center">{msg}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

