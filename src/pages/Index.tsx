
import React, { useState } from 'react';
import { ChatView } from '../components/ChatView';
import { Dashboard } from '../components/Dashboard';
import { Portfolio } from '../components/Portfolio';
import { MarketOverview } from '../components/MarketOverview';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const Index = () => {
  const [activeView, setActiveView] = useState('chat');
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
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          appState={appState}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            activeView={activeView}
            appState={appState}
          />
          <main className="flex-1 overflow-hidden">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
