// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Home() {
  const [chatKey, setChatKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleNewChat = () => {
    setChatKey(prev => prev + 1);
  };


  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="w-64 transition-all duration-300 ease-in-out">
            <Sidebar 
              onNewChat={handleNewChat}
            />
          </div>
        )}
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatInterface key={chatKey} />
        </div>
      </div>
    </div>
  );
}