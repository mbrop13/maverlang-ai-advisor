
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Eye,
  BarChart3,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';

interface PortfolioProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  allocation: number;
  change: number;
}

export const Portfolio = ({ appState, updateAppState }: PortfolioProps) => {
  const { fetchFinancialData, isLoading } = useFinancialData();
  const { toast } = useToast();
  
  const [holdings, setHoldings] = useState<Holding[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 150, avgPrice: 175.20, currentPrice: 0, value: 0, allocation: 0, change: 0 },
    { symbol: 'MSFT', name: 'Microsoft', shares: 75, avgPrice: 365.40, currentPrice: 0, value: 0, allocation: 0, change: 0 },
    { symbol: 'GOOGL', name: 'Alphabet', shares: 120, avgPrice: 138.90, currentPrice: 0, value: 0, allocation: 0, change: 0 },
    { symbol: 'TSLA', name: 'Tesla', shares: 60, avgPrice: 220.30, currentPrice: 0, value: 0, allocation: 0, change: 0 },
    { symbol: 'NVDA', name: 'NVIDIA', shares: 25, avgPrice: 680.50, currentPrice: 0, value: 0, allocation: 0, change: 0 }
  ]);

  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0
  });

  const updatePortfolioData = async () => {
    const symbols = holdings.map(h => h.symbol);
    const marketData = await fetchFinancialData(symbols);
    
    if (marketData.length > 0) {
      const updatedHoldings = holdings.map(holding => {
        const marketStock = marketData.find(stock => stock.symbol === holding.symbol);
        if (marketStock) {
          const currentPrice = marketStock.price;
          const value = holding.shares * currentPrice;
          const change = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
          
          return {
            ...holding,
            currentPrice,
            value,
            change,
            name: marketStock.name
          };
        }
        return holding;
      });

      // Calcular valor total y asignaciones
      const totalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      const totalCost = updatedHoldings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
      const dailyChange = totalValue - totalCost;
      const dailyChangePercent = (dailyChange / totalCost) * 100;

      const holdingsWithAllocation = updatedHoldings.map(holding => ({
        ...holding,
        allocation: parseFloat(((holding.value / totalValue) * 100).toFixed(1))
      }));

      setHoldings(holdingsWithAllocation);
      setPortfolioStats({
        totalValue,
        dailyChange,
        dailyChangePercent
      });

      toast({
        title: "Portafolio actualizado",
        description: "Datos actualizados con precios en tiempo real",
      });
    }
  };

  useEffect(() => {
    updatePortfolioData();
  }, []);

  const sectorAllocation = [
    { sector: 'Tecnología', percentage: 71.4, color: 'bg-blue-500' },
    { sector: 'Automotriz', percentage: 11.9, color: 'bg-red-500' },
    { sector: 'Semiconductores', percentage: 14.4, color: 'bg-green-500' },
    { sector: 'Efectivo', percentage: 2.3, color: 'bg-gray-500' }
  ];

  const removeHolding = (symbol: string) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
    toast({
      title: "Posición eliminada",
      description: `${symbol} ha sido removido del portafolio`,
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2 p-6 bg-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Valor Total del Portafolio</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={updatePortfolioData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                ${portfolioStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2">
                {portfolioStats.dailyChange >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-lg font-semibold ${portfolioStats.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioStats.dailyChange >= 0 ? '+' : ''}${portfolioStats.dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                  ({portfolioStats.dailyChangePercent.toFixed(2)}%)
                </span>
                <span className="text-sm text-gray-500">ganancia/pérdida total</span>
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
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const totalGainLoss = (holding.currentPrice - holding.avgPrice) * holding.shares;
                  const gainLossPercent = holding.change;
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
                      <td className="py-4 px-2 text-right font-semibold text-gray-900">
                        ${holding.currentPrice > 0 ? holding.currentPrice.toFixed(2) : 'Cargando...'}
                      </td>
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
                      <td className="py-4 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHolding(holding.symbol)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
