'use client';

import { useState } from 'react';
import { Contact } from '@/types';
import { formatDate, safeText } from '@/lib/responseParser';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract fields with fallbacks
  const contactId = safeText(contact.id || contact.hubspot_contact_id);
  const name = safeText(contact.name || contact.nombre, 'Sin nombre');
  const email = safeText(contact.email);
  const phone = safeText(contact.phone || contact.telefono);
  const createdDate = formatDate(contact.created_at || contact.creado || '');
  const owner = safeText(contact.owner || contact.propietario || contact.owner_name);

  // Create title
  const title = `${contactId} - ${name}`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}
          <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{title}</span>
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
            {/* Basic Information */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Información Básica</h5>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-900">{contactId}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Nombre:</span>
                  <span className="ml-2 text-gray-900">{name}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{email}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Teléfono:</span>
                  <span className="ml-2 text-gray-900">{phone}</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Detalles Adicionales</h5>
              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-gray-700">Creado:</span>
                  <span className="ml-2 text-gray-900">{createdDate}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Propietario:</span>
                  <span className="ml-2 text-gray-900">{owner}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



