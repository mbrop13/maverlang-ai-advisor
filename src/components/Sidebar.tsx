
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ConversationManager } from './ConversationManager';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  appState: any;
}

export const Sidebar = ({ activeView, setActiveView, appState }: SidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Vista general de mercados'
    },
    {
      id: 'portfolio',
      name: 'Portafolio',
      icon: PieChart,
      description: 'Análisis de inversiones'
    },
    {
      id: 'market',
      name: 'Mercados',
      icon: TrendingUp,
      description: 'Datos en tiempo real'
    }
  ];

  const handleNewConversation = () => {
    // Lógica para nueva conversación
    console.log('Nueva conversación creada');
  };

  const handleSelectConversation = (conversationId: string) => {
    // Lógica para seleccionar conversación
    console.log('Conversación seleccionada:', conversationId);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Maverlang
            </h2>
            <p className="text-xs text-gray-500">AI Financial Advisor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* AI Assistant con conversaciones */}
        <ConversationManager
          activeView={activeView}
          setActiveView={setActiveView}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
        />

        {/* Otros elementos del menú */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start p-4 h-auto transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg' 
                  : 'hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <div className="flex-1 text-left">
                  <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Usage Stats */}
      <div className="p-4 border-t border-gray-100">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              {appState.maxDailyUsage - appState.dailyUsage}
            </div>
            <div className="text-sm text-blue-700 mb-2">
              Consultas restantes
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ 
                  width: `${Math.max(0, 100 - (appState.dailyUsage / appState.maxDailyUsage) * 100)}%` 
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
