// src/components/ui/Header.tsx
'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;     // opcional
  showMenuButton?: boolean;         // nuevo
}

export function Header({ onToggleSidebar, showMenuButton = true }: HeaderProps) {
  return (
    <div className="bg-white border-b" style={{ borderColor: '#E6E6E6', borderWidth: '1px' }}>
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botón menú opcional */}
            {showMenuButton && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Logo + subtítulo */}
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <Image
                src="/logo-spot3x.png"
                alt="Logo SPOT"
                width={120}
                height={40}
                className="h-6 sm:h-8 w-auto"
              />
              <h1
                className="font-semibold text-sm sm:text-base md:text-[18px]"
                style={{
                  fontFamily: 'var(--font-figtree), sans-serif',
                  letterSpacing: '-2%',
                  color: '#9F9F9F',
                }}
              >
                Asistente de servicio al cliente
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">{/* futuro */}</div>
        </div>
      </div>
    </div>
  );
}
