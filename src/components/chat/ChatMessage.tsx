'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { parseBedrockResponse } from '@/lib/responseParser';
import { TicketCard } from './TicketCard';
import { ContactCard } from './ContactCard';
import { BigNumberCard } from './BigNumberCard';
import { PieChartCard } from './PieChartCard';
import { BarChartCard } from './BarChartCard';
import { LineChartCard } from './LineChartCard';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const parsedResponse = !isUser ? parseBedrockResponse(message.content) : null;

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        /* Avatar del Asistente - Solo a la izquierda */
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-black">
          <span className="text-white text-sm font-bold">&gt;&gt;</span>
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end max-w-md' : 'items-start flex-1'}`}>
        {isUser ? (
          /* Mensaje del Usuario - Alineado a la derecha */
          <div className="rounded-lg p-3 mb-1" style={{ backgroundColor: 'rgba(0, 169, 224, 0.15)' }}>
            <p className="text-gray-900" style={{ fontSize: '16px' }}>{message.content}</p>
          </div>
        ) : (
          /* Mensaje del Asistente - Alineado a la izquierda */
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3 mb-1">
              <div className="prose prose-sm max-w-none">
                <div className="space-y-4">
              {/* Direct message content if no parsed response */}
              {!parsedResponse && (
                <div 
                  className="whitespace-pre-wrap text-left"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: '16px',
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Tickets Encontrados ({parsedResponse.tickets.length})
                  </h4>
                  <div className="space-y-3">
                    {parsedResponse.tickets.map((ticket, index) => (
                      <TicketCard key={index} ticket={ticket} />
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {parsedResponse?.contacts && parsedResponse.contacts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Contactos Encontrados ({parsedResponse.contacts.length})
                  </h4>
                  <div className="space-y-3">
                    {parsedResponse.contacts.map((contact, index) => (
                      <ContactCard key={index} contact={contact} />
                    ))}
                  </div>
                </div>
              )}

              {/* Big Number visualizations - inline cards */}
              {parsedResponse?.bigNumberData && Array.isArray(parsedResponse.bigNumberData) && parsedResponse.bigNumberData.length > 0 && (
                <div className="my-2">
                  {parsedResponse.bigNumberData.map((data, index) => (
                    <BigNumberCard key={index} payload={data} />
                  ))}
                </div>
              )}

              {/* Chart visualizations - multiple charts support */}
              {parsedResponse?.chartData && Array.isArray(parsedResponse.chartData) && parsedResponse.chartData.length > 0 && (
                <div className="my-3 space-y-4">
                  {parsedResponse.chartData.map((chart, index) => {
                    // Route to specific Recharts component based on chartType
                    if (chart?.chartType === "pie") {
                      return <PieChartCard key={index} payload={chart} />;
                    }
                    if (chart?.chartType === "bar") {
                      return <BarChartCard key={index} payload={chart} />;
                    }
                    if (chart?.chartType === "line") {
                      return <LineChartCard key={index} payload={chart} />;
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
               (!parsedResponse?.chartData || (Array.isArray(parsedResponse?.chartData) && parsedResponse.chartData.length === 0)) && (
                <div 
                  className="italic text-left"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: '16px',
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0498C8' }}>
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}




