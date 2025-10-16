'use client';

import { ChatMessage as ChatMessageType } from '@/types';
import { parseBedrockResponse, formatDate, safeText } from '@/lib/responseParser';
import { TicketCard } from './TicketCard';
import { ContactCard } from './ContactCard';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const parsedResponse = !isUser ? parseBedrockResponse(message.content) : null;

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-blue-50' : 'bg-gray-50'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">
            {isUser ? 'Usuario' : 'Asistente'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp}
          </span>
        </div>

        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-gray-900">{message.content}</p>
          ) : (
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
                  className="whitespace-pre-wrap text-left"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000'
                  }}
                >
                  {parsedResponse.conversational}
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

              {/* Additional text */}
              {parsedResponse?.additionalText && (
                <div 
                  className="whitespace-pre-wrap text-left"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000'
                  }}
                >
                  {parsedResponse.additionalText}
                </div>
              )}

              {/* Fallback if no content */}
              {!parsedResponse?.conversational && 
               !parsedResponse?.tickets.length && 
               !parsedResponse?.contacts.length && 
               !parsedResponse?.additionalText && (
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
          )}
        </div>
      </div>
    </div>
  );
}


