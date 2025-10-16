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

  const handleClearChat = () => {
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
        <div className={`transition-all duration-300 ease-in-out ${
          sidebarVisible ? 'w-80' : 'w-0'
        }`}>
          <div className={`h-full ${sidebarVisible ? 'block' : 'hidden'}`}>
            <Sidebar 
              onNewChat={handleNewChat}
              onClearChat={handleClearChat}
            />
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatInterface key={chatKey} />
        </div>
      </div>
    </div>
  );
}