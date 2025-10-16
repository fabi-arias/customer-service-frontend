'use client';

import Image from 'next/image';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <div className="bg-white border-b" style={{ borderColor: '#E6E6E6', borderWidth: '1px' }}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <Image
              src="/logo-muscle.png"
              alt="Logo Muscle"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


