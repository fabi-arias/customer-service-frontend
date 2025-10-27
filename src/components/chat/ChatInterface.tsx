'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { chatApi } from '@/lib/api';
import { ChatMessage } from './ChatMessage';
import { ArrowUp, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola bienvenido! Soy tu asistente para consultas sobre tickets y contactos ¿En qué te puedo ayudar hoy?',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({
        message: inputMessage,
        session_id: sessionId || undefined
      });

      if (response.success) {
        // Update session ID if provided
        if (response.session_id) {
          setSessionId(response.session_id);
        }

        const assistantMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response || '_(Respuesta vacía)_',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Error: ${response.error || 'Error desconocido'}`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = '⏱️ La consulta está tardando mucho. El sistema está procesando tu solicitud, por favor espera...';
        } else if (error.message.includes('Network Error')) {
          errorMessage = '🌐 Error de conexión con el servidor. Verifica que el backend esté ejecutándose.';
        } else {
          errorMessage = `❌ Error: ${error.message}`;
        }
      }

      const errorChatMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Removed unused clearChat function

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col items-start gap-2">
          <Image
            src="/logo-spot3x.png"
            alt="Logo SPOT"
            width={60}
            height={60}
            className="h-12 w-auto"
          />
          <h1 
            className="font-semibold"
            style={{ 
              fontFamily: 'var(--font-figtree), sans-serif',
              fontSize: '22px',
              letterSpacing: '-2%',
              color: '#9F9F9F'
            }}
          >
            Asistente de servicio al cliente
          </h1>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 p-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-sm font-bold">&gt;&gt;</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3 mb-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-gray-500 italic">Pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full resize-none bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            style={{
              backgroundColor: '#0498C8'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#0380A6';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#0498C8';
              }
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
