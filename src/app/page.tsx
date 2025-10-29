// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Home() {
  const [chatKey, setChatKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNewChat = () => {
    setChatKey(prev => prev + 1);
    // Close sidebar on mobile after starting new chat
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay for mobile - covers entire screen */}
        {sidebarVisible && isMobile && (
          <div 
            className="fixed inset-0 bg-white bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        {sidebarVisible && (
          <div className={`
            fixed md:relative
            left-0 top-0 h-full z-50
            w-64 transition-all duration-300 ease-in-out
            ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar 
              onNewChat={handleNewChat}
            />
          </div>
        )}
        
        {/* Chat Area - always visible with white background, above overlay */}
        <div className="flex-1 flex flex-col bg-white min-w-0 relative z-40 md:z-0">
          <ChatInterface key={chatKey} />
        </div>
      </div>
    </div>
  );
}