
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';

interface PortfolioProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

export const Portfolio = ({ appState }: PortfolioProps) => {
  const portfolioValue = 125430.50;
  const dailyChange = 2847.33;
  const dailyChangePercent = 2.32;

  const holdings = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      shares: 150, 
      avgPrice: 175.20, 
      currentPrice: 193.58, 
      value: 29037, 
      allocation: 23.1,
      change: 10.48
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft', 
      shares: 75, 
      avgPrice: 365.40, 
      currentPrice: 378.85, 
      value: 28413.75, 
      allocation: 22.7,
      change: 3.68
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet', 
      shares: 120, 
      avgPrice: 138.90, 
      currentPrice: 142.56, 
      value: 17107.2, 
      allocation: 13.6,
      change: 2.63
    },
    { 
      symbol: 'TSLA', 
      name: 'Tesla', 
      shares: 60, 
      avgPrice: 220.30, 
      currentPrice: 248.42, 
      value: 14905.2, 
      allocation: 11.9,
      change: 12.75
    },
    { 
      symbol: 'NVDA', 
      name: 'NVIDIA', 
      shares: 25, 
      avgPrice: 680.50, 
      currentPrice: 721.33, 
      value: 18033.25, 
      allocation: 14.4,
      change: 6.0
    }
  ];

  const sectorAllocation = [
    { sector: 'Tecnología', percentage: 71.4, color: 'bg-blue-500' },
    { sector: 'Automotriz', percentage: 11.9, color: 'bg-red-500' },
    { sector: 'Semiconductores', percentage: 14.4, color: 'bg-green-500' },
    { sector: 'Efectivo', percentage: 2.3, color: 'bg-gray-500' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2 p-6 bg-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Valor Total del Portafolio</h2>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalle
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-lg font-semibold text-green-600">
                  +${dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                  ({dailyChangePercent}%)
                </span>
                <span className="text-sm text-gray-500">hoy</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Diversificación</h3>
            </div>
            <div className="space-y-3">
              {sectorAllocation.slice(0, 3).map((sector) => (
                <div key={sector.sector} className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{sector.sector}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${sector.color}`}></div>
                    <span className="font-semibold">{sector.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Rebalancear
            </Button>
          </Card>
        </div>

        {/* Holdings */}
        <Card className="p-6 bg-white shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mis Inversiones</h3>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Posición
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Símbolo</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Acciones</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Precio Promedio</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Precio Actual</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Valor Total</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Ganancia/Pérdida</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Asignación</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const totalGainLoss = (holding.currentPrice - holding.avgPrice) * holding.shares;
                  const gainLossPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                  const isGain = totalGainLoss > 0;
                  
                  return (
                    <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{holding.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{holding.symbol}</p>
                            <p className="text-sm text-gray-500">{holding.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-gray-700">{holding.shares}</td>
                      <td className="py-4 px-2 text-right text-gray-700">${holding.avgPrice.toFixed(2)}</td>
                      <td className="py-4 px-2 text-right font-semibold text-gray-900">${holding.currentPrice}</td>
                      <td className="py-4 px-2 text-right font-semibold text-gray-900">
                        ${holding.value.toLocaleString('en-US')}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className={`font-semibold ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                          {isGain ? '+' : ''}${totalGainLoss.toFixed(2)}
                        </div>
                        <div className={`text-sm ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                          ({isGain ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Badge variant="outline">{holding.allocation}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
