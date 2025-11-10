'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();

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

          {/* Icono de error */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900">
            Error al iniciar sesión
          </h1>

          {/* Mensaje de usuario no autorizado */}
          <p className="text-base text-gray-600">
            Usuario no está autorizado
          </p>

          {/* Sección de contacto */}
          <div className="w-full pt-4">
            <p className="text-sm text-gray-600">
              Si necesitas acceso, contacta al administrador para ser invitado.
            </p>
          </div>

          {/* Botón volver al inicio */}
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
