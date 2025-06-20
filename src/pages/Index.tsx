
import React, { useState } from 'react';
import { ChatView } from '../components/ChatView';
import { Dashboard } from '../components/Dashboard';
import { Portfolio } from '../components/Portfolio';
import { MarketOverview } from '../components/MarketOverview';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Index = () => {
  const [activeView, setActiveView] = useState('chat');
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
      default:
        return <ChatView appState={appState} updateAppState={updateAppState} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-screen">
        {/* Sidebar with conditional rendering */}
        {sidebarVisible && (
          <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView}
            appState={appState}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with sidebar toggle */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="flex items-center gap-2"
              >
                {sidebarVisible ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
                {sidebarVisible ? 'Ocultar Sidebar' : 'Mostrar Sidebar'}
              </Button>
            </div>
            <Header 
              activeView={activeView}
              appState={appState}
            />
          </div>
          
          <main className="flex-1 overflow-hidden">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
