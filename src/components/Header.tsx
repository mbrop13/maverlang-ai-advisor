
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, User, Bell } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  appState: any;
}

export const Header = ({ activeView, appState }: HeaderProps) => {
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard Financiero';
      case 'portfolio':
        return 'Mi Portafolio';
      case 'market':
        return 'Mercados en Vivo';
      case 'chat':
      default:
        return 'Maverlang-AI Assistant';
    }
  };

  const usagePercentage = (appState.dailyUsage / appState.maxDailyUsage) * 100;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              {getViewTitle()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Análisis financiero potenciado por IA
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Usage Indicator */}
          <Card className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-blue-900">
                Consultas hoy: {appState.dailyUsage}/{appState.maxDailyUsage}
              </div>
              <div className="w-20 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{appState.user.name}</div>
                <Badge variant="secondary" className="text-xs">
                  {appState.user.plan}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
