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
  Trash2,
  Edit2
} from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import { AddPositionModal } from './AddPositionModal';

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
  sector: string;
  totalGainLoss: number;
}

export const Portfolio = ({ appState, updateAppState }: PortfolioProps) => {
  const { fetchFinancialData, isLoading } = useFinancialData();
  const { toast } = useToast();
  
  const [holdings, setHoldings] = useState<Holding[]>([
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      shares: 50, 
      avgPrice: 175.20, 
      currentPrice: 0, 
      value: 0, 
      allocation: 0, 
      change: 0,
      sector: 'Technology',
      totalGainLoss: 0
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.', 
      shares: 25, 
      avgPrice: 365.40, 
      currentPrice: 0, 
      value: 0, 
      allocation: 0, 
      change: 0,
      sector: 'Technology',
      totalGainLoss: 0
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.', 
      shares: 30, 
      avgPrice: 138.90, 
      currentPrice: 0, 
      value: 0, 
      allocation: 0, 
      change: 0,
      sector: 'Technology',
      totalGainLoss: 0
    }
  ]);

  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalCost: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0
  });

  const updatePortfolioData = async () => {
    if (holdings.length === 0) return;
    
    console.log('🔄 Actualizando datos del portafolio...');
    const symbols = holdings.map(h => h.symbol);
    const marketData = await fetchFinancialData(symbols);
    
    console.log('📊 Datos del mercado recibidos:', marketData);
    
    if (marketData.length > 0) {
      const updatedHoldings = holdings.map(holding => {
        const marketStock = marketData.find(stock => stock.symbol === holding.symbol);
        if (marketStock) {
          const currentPrice = marketStock.price;
          const value = holding.shares * currentPrice;
          const change = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
          const totalGainLoss = (currentPrice - holding.avgPrice) * holding.shares;
          
          console.log(`📈 ${holding.symbol}: $${currentPrice}, Ganancia/Pérdida: $${totalGainLoss}`);
          
          return {
            ...holding,
            currentPrice,
            value,
            change,
            name: marketStock.name || holding.name,
            sector: marketStock.sector || holding.sector,
            totalGainLoss
          };
        }
        return holding;
      });

      // Calcular estadísticas del portafolio
      const totalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      const totalCost = updatedHoldings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      // Asignar allocations
      const holdingsWithAllocation = updatedHoldings.map(holding => ({
        ...holding,
        allocation: totalValue > 0 ? parseFloat(((holding.value / totalValue) * 100).toFixed(1)) : 0
      }));

      setHoldings(holdingsWithAllocation);
      setPortfolioStats({
        totalValue,
        totalCost,
        dailyChange: totalGainLoss,
        dailyChangePercent: totalGainLossPercent,
        totalGainLoss,
        totalGainLossPercent
      });

      toast({
        title: "Portafolio actualizado",
        description: "Datos actualizados con precios en tiempo real",
      });
    }
  };

  useEffect(() => {
    updatePortfolioData();
  }, [holdings.length]);

  // Calcular diversificación real por sectores
  const calculateSectorAllocation = () => {
    if (holdings.length === 0) return [];
    
    const sectorMap = new Map<string, number>();
    
    holdings.forEach(holding => {
      const sector = holding.sector || 'Other';
      const currentValue = sectorMap.get(sector) || 0;
      sectorMap.set(sector, currentValue + holding.value);
    });

    const totalValue = portfolioStats.totalValue;
    const sectors = Array.from(sectorMap.entries()).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: getSectorColor(sector)
    }));

    return sectors.sort((a, b) => b.percentage - a.percentage);
  };

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-500',
      'Healthcare': 'bg-green-500',
      'Finance': 'bg-yellow-500',
      'Energy': 'bg-red-500',
      'Consumer': 'bg-purple-500',
      'Industrial': 'bg-indigo-500',
      'Other': 'bg-gray-500'
    };
    return colors[sector] || 'bg-gray-500';
  };

  const sectorAllocation = calculateSectorAllocation();

  const addNewPosition = async (newPosition: { symbol: string; shares: number; avgPrice: number }) => {
    console.log('➕ Agregando nueva posición:', newPosition);
    
    // Verificar si ya existe la posición
    const existingIndex = holdings.findIndex(h => h.symbol === newPosition.symbol);
    
    if (existingIndex >= 0) {
      // Actualizar posición existente (promedio ponderado)
      const existing = holdings[existingIndex];
      const totalShares = existing.shares + newPosition.shares;
      const totalCost = (existing.shares * existing.avgPrice) + (newPosition.shares * newPosition.avgPrice);
      const newAvgPrice = totalCost / totalShares;
      
      const updatedHoldings = [...holdings];
      updatedHoldings[existingIndex] = {
        ...existing,
        shares: totalShares,
        avgPrice: newAvgPrice
      };
      setHoldings(updatedHoldings);
      
      toast({
        title: "Posición actualizada",
        description: `${newPosition.symbol}: ${totalShares} acciones con precio promedio de $${newAvgPrice.toFixed(2)}`,
      });
    } else {
      // Agregar nueva posición
      const newHolding: Holding = {
        symbol: newPosition.symbol,
        name: `${newPosition.symbol} Inc.`,
        shares: newPosition.shares,
        avgPrice: newPosition.avgPrice,
        currentPrice: 0,
        value: 0,
        allocation: 0,
        change: 0,
        sector: 'Technology',
        totalGainLoss: 0
      };
      setHoldings(prev => [...prev, newHolding]);
      
      toast({
        title: "Posición agregada",
        description: `${newPosition.shares} acciones de ${newPosition.symbol} agregadas al portafolio`,
      });
    }
    
    // Actualizar datos después de agregar (con delay para asegurar que el estado se actualice)
    setTimeout(() => {
      updatePortfolioData();
    }, 500);
  };

  const removeHolding = (symbol: string) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
    toast({
      title: "Posición eliminada",
      description: `${symbol} ha sido removido del portafolio`,
    });
  };

  const getDiversificationScore = () => {
    if (sectorAllocation.length <= 1) return 'Muy Baja';
    if (sectorAllocation.length === 2) return 'Baja';
    if (sectorAllocation.length === 3) return 'Moderada';
    if (sectorAllocation.length >= 4) {
      const maxAllocation = Math.max(...sectorAllocation.map(s => s.percentage));
      if (maxAllocation > 70) return 'Moderada-Baja';
      if (maxAllocation > 50) return 'Buena';
      return 'Excelente';
    }
    return 'Moderada';
  };

  return (
    <div className="w-full">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Mi Portafolio</h1>
            <p className="text-gray-600 mt-1">Gestiona tus inversiones y analiza tu rendimiento</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={updatePortfolioData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <AddPositionModal onAddPosition={addNewPosition} isLoading={isLoading} />
          </div>
        </div>
        
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="lg:col-span-2 p-6 bg-white shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Valor Total del Portafolio</h2>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-gray-900">
                ${portfolioStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2">
                {portfolioStats.totalGainLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-lg font-semibold ${portfolioStats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioStats.totalGainLoss >= 0 ? '+' : ''}${portfolioStats.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                  ({portfolioStats.totalGainLossPercent.toFixed(2)}%)
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Inversión total: ${portfolioStats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p>Número de posiciones: {holdings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Diversificación</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{getDiversificationScore()}</p>
                <p className="text-sm opacity-80">Nivel de Diversificación</p>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sectorAllocation.slice(0, 3).map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <span className="text-sm opacity-90 truncate flex-1">{sector.sector}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${sector.color}`}></div>
                      <span className="font-semibold">{sector.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Diversification Details */}
        <Card className="p-6 bg-white shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Análisis de Diversificación por Sectores
          </h3>
          
          {sectorAllocation.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectorAllocation.map((sector) => (
                  <div key={sector.sector} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 truncate flex-1">{sector.sector}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${sector.color}`}></div>
                        <span className="font-bold text-gray-900">{sector.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      ${sector.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${sector.color}`}
                        style={{ width: `${sector.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Recomendaciones de Diversificación:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {sectorAllocation[0]?.percentage > 70 && (
                    <li>• Considera reducir la exposición en {sectorAllocation[0].sector} ({sectorAllocation[0].percentage.toFixed(1)}%)</li>
                  )}
                  {sectorAllocation.length < 3 && (
                    <li>• Agrega posiciones en otros sectores para mejorar la diversificación</li>
                  )}
                  {sectorAllocation.length >= 4 && (
                    <li>• ¡Excelente diversificación! Mantén un balance entre sectores</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Agrega posiciones para ver el análisis de diversificación</p>
            </div>
          )}
        </Card>

        {/* Holdings */}
        <Card className="p-6 bg-white shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mis Posiciones</h3>
            </div>
          </div>
          
          {holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-full max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Símbolo</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Sector</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Acciones</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Precio Prom.</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Precio Actual</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Valor Total</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Ganancia/Pérdida</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Asignación</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => {
                      const isGain = holding.totalGainLoss > 0;
                      
                      return (
                        <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">{holding.symbol.charAt(0)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{holding.symbol}</p>
                                <p className="text-sm text-gray-500 truncate">{holding.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="outline" className="text-xs">
                              {holding.sector}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 text-right text-gray-700 font-medium">{holding.shares}</td>
                          <td className="py-4 px-2 text-right text-gray-700">${holding.avgPrice.toFixed(2)}</td>
                          <td className="py-4 px-2 text-right font-semibold text-gray-900">
                            ${holding.currentPrice > 0 ? holding.currentPrice.toFixed(2) : 'Cargando...'}
                          </td>
                          <td className="py-4 px-2 text-right font-semibold text-gray-900">
                            ${holding.value.toLocaleString('en-US')}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className={`font-semibold ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                              {isGain ? '+' : ''}${holding.totalGainLoss.toFixed(2)}
                            </div>
                            <div className={`text-sm ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                              ({isGain ? '+' : ''}{holding.change.toFixed(2)}%)
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
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-semibold mb-2">Tu portafolio está vacío</h4>
              <p className="mb-4">Comienza agregando tus primeras posiciones</p>
              <AddPositionModal onAddPosition={addNewPosition} isLoading={isLoading} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
