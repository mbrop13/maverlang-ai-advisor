
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  PieChart,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

export const Dashboard = ({ appState }: DashboardProps) => {
  const marketStats = [
    {
      name: 'S&P 500',
      value: '4,782.20',
      change: '+1.2%',
      isPositive: true,
      icon: TrendingUp
    },
    {
      name: 'NASDAQ',
      value: '14,963.87',
      change: '+2.1%',
      isPositive: true,
      icon: TrendingUp
    },
    {
      name: 'DOW JONES',
      value: '37,428.92',
      change: '-0.3%',
      isPositive: false,
      icon: TrendingDown
    },
    {
      name: 'VIX',
      value: '13.42',
      change: '-5.7%',
      isPositive: true,
      icon: Activity
    }
  ];

  const topStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 193.58, change: 2.45, volume: '47.8M' },
    { symbol: 'MSFT', name: 'Microsoft', price: 378.85, change: -1.23, volume: '28.3M' },
    { symbol: 'GOOGL', name: 'Alphabet', price: 142.56, change: 1.87, volume: '35.2M' },
    { symbol: 'TSLA', name: 'Tesla', price: 248.42, change: 3.21, volume: '89.1M' },
    { symbol: 'NVDA', name: 'NVIDIA', price: 721.33, change: 4.56, volume: '52.7M' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <Icon className={`w-4 h-4 mr-1 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon className={`w-6 h-6 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Acciones Activas</h3>
            </div>
            <div className="space-y-4">
              {topStocks.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.symbol}</p>
                      <p className="text-sm text-gray-500">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${stock.price}</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change > 0 ? '+' : ''}{stock.change}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {stock.volume}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Resumen de IA</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">Tendencia Alcista</span>
                </div>
                <p className="text-sm text-green-700">
                  Los mercados muestran fortaleza en el sector tecnológico con NVIDIA liderando las ganancias.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Oportunidades</span>
                </div>
                <p className="text-sm text-blue-700">
                  Considera diversificar en sectores defensivos ante la volatilidad esperada.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-800">Recomendación</span>
                </div>
                <p className="text-sm text-amber-700">
                  Mantén un 20% en efectivo para aprovechar correcciones del mercado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
