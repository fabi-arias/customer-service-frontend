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
  const ticketUrl = safeText(ticket.ticket_url);

  // Create title
  const title = `${ticketId} - ${subject.length > 80 ? subject.slice(0, 80) + '...' : subject}`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Basic Information */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Información Básica</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-bold text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-900">{ticketId}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Asunto:</span>
                  <span className="ml-2 text-gray-900">{subject}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Itinerario:</span>
                  <span className="ml-2 text-gray-900">{itinerary}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Prioridad:</span>
                  <span className="ml-2 text-gray-900">{priority}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Categoría:</span>
                  <span className="ml-2 text-gray-900">{category}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Estado:</span>
                  <span className="ml-2 text-gray-900">{status}</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Detalles Adicionales</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-bold text-gray-700">Creado:</span>
                  <span className="ml-2 text-gray-900">{createdDate}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Cerrado:</span>
                  <span className="ml-2 text-gray-900">{closedDate}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Origen:</span>
                  <span className="ml-2 text-gray-900">{source}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Propietario:</span>
                  <span className="ml-2 text-gray-900">{owner}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {content && content !== 'N/A' && (
            <div className="mt-4">
              <h5 className="font-semibold text-gray-900 mb-3">Descripción</h5>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r text-sm text-gray-900">
                {content}
              </div>
            </div>
          )}

          {/* Resolution */}
          {resolution && resolution !== 'N/A' && (
            <div className="mt-4">
              <h5 className="font-semibold text-gray-900 mb-3">Resolución</h5>
              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r text-sm text-gray-900">
                {resolution}
              </div>
            </div>
          )}

          {/* Ticket URL (enlace/acción) */}
          {ticketUrl && ticketUrl !== 'N/A' && (
            <div className="mt-4">
              <h5 className="font-semibold text-slate-900 mb-3">Enlace al ticket en HubSpot</h5>
              <div className="bg-slate-100 border-l-4 border-slate-400 p-3 rounded-r text-sm text-blue-900">
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-blue-700"
                >
                  {ticketUrl}
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



