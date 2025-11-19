'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { chatApi } from '@/lib/api';
import { ChatMessage } from './ChatMessage';
import { ArrowUp, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ChatInterfaceProps {
  onTemplateRequest?: (template: string) => void;
  initialInput?: string;
}

export function ChatInterface({ initialInput }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle template requests from sidebar
  useEffect(() => {
    const handleTemplate = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setInputMessage(customEvent.detail);
      // Focus textarea after setting message
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    };

    window.addEventListener('chat:set-template', handleTemplate);
    return () => {
      window.removeEventListener('chat:set-template', handleTemplate);
    };
  }, []);

  // Handle initial input
    useEffect(() => {
      if (initialInput !== undefined) {
        setInputMessage(initialInput);
      }
    }, [initialInput]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Guardar el mensaje antes de limpiarlo
    const messageToSend = inputMessage.trim();

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage(''); // Limpiar el input después de guardar el mensaje
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({
        message: messageToSend,
        session_id: sessionId || undefined
      });

      console.log('🟣 TRACE desde frontend:', response.trace);
      console.log('🟣 session_id desde frontend:', response.session_id);

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
          errorMessage = 'La consulta está tardando mucho. El sistema está procesando tu solicitud, por favor espera...';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.';
        } else {
          errorMessage = `Error: ${error.message}`;
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
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Removed unused clearChat function

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {/*
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col items-start gap-2">
          <Image
            src="/logo-spot3x.png"
            alt="Logo SPOT"
            width={60}
            height={60}
            className="h-8 sm:h-12 w-auto"
          />
          <h1 
            className="font-semibold text-lg sm:text-xl md:text-[22px]"
            style={{ 
              fontFamily: 'var(--font-figtree), sans-serif',
              letterSpacing: '-2%',
              color: '#9F9F9F'
            }}
          >
            Asistente de servicio al cliente
          </h1>
        </div>
      </div>
      */}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 sm:gap-3 p-2 sm:p-4">
            <div className="flex-shrink-0">
              <div className="relative w-8 h-8">
                {/* aro giratorio opcional */}
                <span className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-[#00A9E0] animate-spin" />
                {/* avatar */}
                <div className="w-full h-full rounded-full bg-white ring-1 ring-gray-300 grid place-items-center overflow-hidden">
                  <Image
                    src="/icono-logo.png"    // en /public
                    alt="Avatar asistente"
                    width={20}
                    height={20}
                    sizes="32px"
                    className="w-5 h-5 object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 italic text-sm sm:text-base">Pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex-1 bg-gray-100 rounded-full px-3 sm:px-4 py-2 sm:py-3 ${isLoading ? 'opacity-75' : ''}`}>
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "Escribe tu siguiente mensaje..." : "Escribe tu mensaje aquí..."}
              className="w-full resize-none bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-base"
              rows={1}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="w-9 h-9 sm:w-10 sm:h-10 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
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
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#00A9E0]" />
            ) : (
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
