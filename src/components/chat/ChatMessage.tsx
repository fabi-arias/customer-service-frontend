'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { parseBedrockResponse } from '@/lib/responseParser';
import { TicketCard } from './TicketCard';
import { ContactCard } from './ContactCard';
import { BigNumberCard } from './BigNumberCard';
import { PieChartCard } from './PieChartCard';
import { BarChartCard } from './BarChartCard';
import { LineChartCard } from './LineChartCard';
import MessageVisual from './MessageVisual';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Image from "next/image";
import lupa from "@/public/icono-logo.png";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const parsedResponse = !isUser ? parseBedrockResponse(message.content) : null;

  return (
    <div className={`flex gap-2 sm:gap-3 p-2 sm:p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        /* Avatar del Asistente */
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white ring-1 ring-gray-300 grid place-items-center overflow-hidden">
            {/* padding interno para que no quede pegada al borde */}
            <Image
              src="/icono-logo.png" 
              alt="Avatar asistente"
              width={20}
              height={20}
              sizes="32px"
              className="w-5 h-5 object-contain"
              priority
            />
          </div>
        </div>
      )}


      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end max-w-[85%] sm:max-w-md' : 'items-start flex-1'}`}>
        {isUser ? (
          /* Mensaje del Usuario - Alineado a la derecha */
          <div className="rounded-lg p-2 sm:p-3 mb-1" style={{ backgroundColor: 'rgba(0, 169, 224, 0.15)' }}>
            <p className="text-gray-900 text-sm sm:text-base break-words">{message.content}</p>
          </div>
        ) : (
          /* Mensaje del Asistente - Alineado a la izquierda */
          <div className="flex-1 min-w-0 max-w-[92vw] sm:max-w-[42rem] md:max-w-[56rem] lg:max-w-[64rem]">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-1">
              <div className="prose prose-sm max-w-none">
                <div className="space-y-3 sm:space-y-4">
              {/* Direct message content if no parsed response */}
              {!parsedResponse && (
                <div 
                  className="whitespace-pre-wrap text-left break-words"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#000000'
                  }}
                >
                  {message.content}
                </div>
              )}

              {/* Conversational text */}
              {parsedResponse?.conversational && (
                <div 
                  className="text-left prose prose-sm max-w-none"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    color: '#000000'
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold" style={{ color: '#000000' }}>{children}</strong>,
                    }}
                  >
                    {parsedResponse.conversational}
                  </ReactMarkdown>
                </div>
              )}

              {/* Tickets */}
              {parsedResponse?.tickets && parsedResponse.tickets.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                    Tickets Encontrados ({parsedResponse.tickets.length})
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {parsedResponse.tickets.map((ticket, index) => (
                      <TicketCard key={index} ticket={ticket} />
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {parsedResponse?.contacts && parsedResponse.contacts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                    Contactos Encontrados ({parsedResponse.contacts.length})
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {parsedResponse.contacts.map((contact, index) => (
                      <ContactCard key={index} contact={contact} />
                    ))}
                  </div>
                </div>
              )}

              {/* Big Number visualizations - inline cards */}
              {parsedResponse?.bigNumberData && Array.isArray(parsedResponse.bigNumberData) && parsedResponse.bigNumberData.length > 0 && (
                <div className="my-2 space-y-2 sm:space-y-0">
                  {parsedResponse.bigNumberData.map((data, index) => (
                    <MessageVisual key={index}>
                      <BigNumberCard payload={data} />
                    </MessageVisual>
                  ))}
                </div>
              )}

              {/* Chart visualizations - multiple charts support */}
              {parsedResponse?.chartData && Array.isArray(parsedResponse.chartData) && parsedResponse.chartData.length > 0 && (
                <div className="my-3 space-y-3 sm:space-y-4">
                  {parsedResponse.chartData.map((chart, index) => {
                    // Route to specific Recharts component based on chartType
                    if (chart?.chartType === "pie") {
                      return (
                        <MessageVisual key={index}>
                          <PieChartCard payload={chart} />
                        </MessageVisual>
                      );
                    }
                    if (chart?.chartType === "bar") {
                      return (
                        <MessageVisual key={index}>
                          <BarChartCard payload={chart} />
                        </MessageVisual>
                      );
                    }
                    if (chart?.chartType === "line") {
                      return (
                        <MessageVisual key={index}>
                          <LineChartCard payload={chart} />
                        </MessageVisual>
                      );
                    }
                    // Fallback: if it's a bigNumber that somehow ended up in chartData
                    if (chart?.chartType === "bigNumber" || 
                        (chart?.total_closed !== undefined && !chart?.data) ||
                        (chart?.avg_hours_business !== undefined && !chart?.data)) {
                      return (
                        <MessageVisual key={index}>
                          <BigNumberCard payload={chart} />
                        </MessageVisual>
                      );
                    }
                    // Fallback (shouldn't happen with new format)
                    return null;
                  })}
                </div>
              )}

              {/* Additional text */}
              {parsedResponse?.additionalText && (
                <div 
                  className="text-left prose prose-sm max-w-none"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    color: '#000000'
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold" style={{ color: '#023D52' }}>{children}</strong>,
                    }}
                  >
                    {parsedResponse.additionalText}
                  </ReactMarkdown>
                </div>
              )}

              {/* Fallback if no content */}
              {!parsedResponse?.conversational && 
               !parsedResponse?.tickets.length && 
               !parsedResponse?.contacts.length && 
               !parsedResponse?.additionalText && 
               (!parsedResponse?.chartData || (Array.isArray(parsedResponse?.chartData) && parsedResponse.chartData.length === 0)) &&
               (!parsedResponse?.bigNumberData || (Array.isArray(parsedResponse?.bigNumberData) && parsedResponse.bigNumberData.length === 0)) && (
                <div 
                  className="italic text-left text-sm sm:text-base"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: '400',
                    color: '#000000'
                  }}
                >
                  No se detectó contenido para mostrar.
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </div>
      </div>

      {isUser && (
        /* Avatar del Usuario - Solo a la derecha */
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00A9E0' }}>
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      )}
    </div>
  );
}




