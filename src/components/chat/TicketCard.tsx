'use client';

import { useState } from 'react';
import { Ticket } from '@/types';
import { formatDate, safeText } from '@/lib/responseParser';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract fields with fallbacks
  const ticketId = safeText(ticket.id || ticket.hubspot_ticket_id);
  const subject = safeText(ticket.subject || ticket.asunto, 'Sin asunto');
  const createdDate = formatDate(ticket.created_at || ticket.creado || '');
  const priority = safeText(ticket.priority || ticket.prioridad);
  const source = safeText(ticket.source || ticket.origen);
  const status = safeText(ticket.status || ticket.estado);
  const itinerary = safeText(ticket.itinerary_number || ticket.itinerario);
  const category = safeText(ticket.category || ticket.categoria);
  const closedDate = formatDate(ticket.closed_at || ticket.cerrado || '');
  const owner = safeText(ticket.owner || ticket.propietario || ticket.owner_name);
  const content = safeText(ticket.content || ticket.descripcion, '');
  const resolution = safeText(ticket.resolution || ticket.resolucion, '');

  // 🔐 URL segura (solo http/https). Si es inválida, queda cadena vacía.
  const ticketUrl = (() => {
    const raw = ticket.ticket_url;
    if (!raw || raw === 'N/A') return '';
    try {
      const u = new URL(raw);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : '';
    } catch {
      return '';
    }
  })();

  // Title
  const title = `${ticketId} - ${subject.length > 80 ? subject.slice(0, 80) + '...' : subject}`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
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
                <div><span className="font-bold text-gray-700">ID:</span><span className="ml-2 text-gray-900">{ticketId}</span></div>
                <div><span className="font-bold text-gray-700">Asunto:</span><span className="ml-2 text-gray-900">{subject}</span></div>
                <div><span className="font-bold text-gray-700">Itinerario:</span><span className="ml-2 text-gray-900">{itinerary}</span></div>
                <div><span className="font-bold text-gray-700">Prioridad:</span><span className="ml-2 text-gray-900">{priority}</span></div>
                <div><span className="font-bold text-gray-700">Categoría:</span><span className="ml-2 text-gray-900">{category}</span></div>
                <div><span className="font-bold text-gray-700">Estado:</span><span className="ml-2 text-gray-900">{status}</span></div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Detalles Adicionales</h5>
              <div className="space-y-2 text-xs sm:text-sm">
                <div><span className="font-bold text-gray-700">Creado:</span><span className="ml-2 text-gray-900">{createdDate}</span></div>
                <div><span className="font-bold text-gray-700">Cerrado:</span><span className="ml-2 text-gray-900">{closedDate}</span></div>
                <div><span className="font-bold text-gray-700">Origen:</span><span className="ml-2 text-gray-900">{source}</span></div>
                <div><span className="font-bold text-gray-700">Propietario:</span><span className="ml-2 text-gray-900">{owner}</span></div>
              </div>
            </div>
          </div>

          {/* Content */}
          {content && content !== 'N/A' && (
            <div className="mt-3 sm:mt-4">
              <h5 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Descripción</h5>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-2 sm:p-3 rounded-r text-xs sm:text-sm text-gray-900 break-words">
                {content}
              </div>
            </div>
          )}

          {/* Resolution */}
          {resolution && resolution !== 'N/A' && (
            <div className="mt-3 sm:mt-4">
              <h5 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Resolución</h5>
              <div className="bg-green-50 border-l-4 border-green-400 p-2 sm:p-3 rounded-r text-xs sm:text-sm text-gray-900 break-words">
                {resolution}
              </div>
            </div>
          )}

          {/* Ticket URL (enlace seguro) */}
          {ticketUrl ? (
            <div className="mt-3 sm:mt-4">
              <h5 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Enlace al ticket en HubSpot</h5>
              <div className="bg-slate-100 border-l-4 border-slate-400 p-2 sm:p-3 rounded-r text-xs sm:text-sm text-blue-900 break-words">
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline underline-offset-2 hover:text-blue-700 break-all"
                >
                  {ticketUrl}
                </a>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
