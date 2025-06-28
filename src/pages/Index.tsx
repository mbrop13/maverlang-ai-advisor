
import React, { useState } from 'react';
import { ChatView } from '../components/ChatView';
import { Dashboard } from '../components/Dashboard';
import { Portfolio } from '../components/Portfolio';
import { MarketOverview } from '../components/MarketOverview';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [appState, setAppState] = useState({
    currentConversation: null,
    dailyUsage: 0,
    maxDailyUsage: 50,
    user: {
      name: 'Usuario',
      plan: 'Pro'
    }
  });

  const updateAppState = (updates: any) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard appState={appState} updateAppState={updateAppState} />;
      case 'portfolio':
        return <Portfolio appState={appState} updateAppState={updateAppState} />;
      case 'market':
        return <MarketOverview appState={appState} updateAppState={updateAppState} />;
      case 'chat':
        return <ChatView appState={appState} updateAppState={updateAppState} />;
      default:
        return <Dashboard appState={appState} updateAppState={updateAppState} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar with conditional rendering */}
        {sidebarVisible && (
          <div className="flex-shrink-0">
            <Sidebar 
              activeView={activeView} 
              setActiveView={setActiveView}
              appState={appState}
            />
          </div>
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar toggle */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                {sidebarVisible ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {sidebarVisible ? 'Ocultar Sidebar' : 'Mostrar Sidebar'}
                </span>
              </Button>
            </div>
            <Header 
              activeView={activeView}
              appState={appState}
            />
          </div>
          
          {/* Main content with scroll */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="min-h-full">
                {renderActiveView()}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
