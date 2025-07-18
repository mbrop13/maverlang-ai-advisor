import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  PieChart,
  BarChart3,
  RefreshCw,
  MousePointer,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancialData } from '@/hooks/useFinancialData';
import { TradingChart } from './TradingChart';
import { MarketAnalysis } from './MarketAnalysis';
import { AddStockModal } from './AddStockModal';

interface DashboardProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

export const Dashboard = ({ appState, updateAppState }: DashboardProps) => {
  const { fetchFinancialData, isLoading } = useFinancialData();
  const { toast } = useToast();
  
  const [marketData, setMarketData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; name: string } | null>(null);
  const [customStocks, setCustomStocks] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']);

  // Datos de índices principales con valores mock realistas
  const [marketIndices, setMarketIndices] = useState([
    {
      name: 'S&P 500',
      symbol: '^GSPC',
      value: '5,184.12',
      change: '+12.45',
      changePercent: 0.24,
      isPositive: true,
      icon: TrendingUp
    },
    {
      name: 'NASDAQ',
      symbol: '^IXIC',
      value: '16,847.35',
      change: '+45.67',
      changePercent: 0.27,
      isPositive: true,
      icon: TrendingUp
    },
    {
      name: 'DOW JONES',
      symbol: '^DJI',
      value: '39,387.76',
      change: '-23.12',
      changePercent: -0.06,
      isPositive: false,
      icon: TrendingDown
    },
    {
      name: 'VIX',
      symbol: '^VIX',
      value: '14.68',
      change: '-0.45',
      changePercent: -2.98,
      isPositive: false,
      icon: Activity
    }
  ]);

  const loadMarketData = async () => {
    try {
      console.log('🔄 Cargando datos del mercado...');
      
      // Generar datos realistas para índices (ya que Finnhub requiere suscripción especial)
      const generateIndexData = () => {
        const baseData = [
          { symbol: '^GSPC', basePrice: 5180, name: 'S&P 500' },
          { symbol: '^IXIC', basePrice: 16800, name: 'NASDAQ' },
          { symbol: '^DJI', basePrice: 39400, name: 'DOW JONES' },
          { symbol: '^VIX', basePrice: 14.5, name: 'VIX' }
        ];
        
        return baseData.map(({ symbol, basePrice, name }) => {
          const changePercent = (Math.random() - 0.5) * 2; // -1% a +1%
          const change = (basePrice * changePercent) / 100;
          const currentPrice = basePrice + change;
          
          return {
            symbol,
            name,
            value: currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}`,
            changePercent: changePercent,
            isPositive: change >= 0,
            icon: change >= 0 ? TrendingUp : TrendingDown
          };
        });
      };
      
      // Actualizar índices con datos generados
      setMarketIndices(generateIndexData());

      // Cargar datos de acciones personalizadas
      const stockData = await fetchFinancialData(customStocks);
      setMarketData(stockData);
      setLastUpdated(new Date());
      
      toast({
        title: "Datos actualizados",
        description: "La información del mercado se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('❌ Error cargando datos del mercado:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [customStocks]);

  const openChart = (symbol: string, name: string) => {
    setSelectedChart({ symbol, name });
  };

  const closeChart = () => {
    setSelectedChart(null);
  };

  const addCustomStock = async (symbol: string) => {
    if (!customStocks.includes(symbol)) {
      setCustomStocks(prev => [...prev, symbol]);
    }
  };

  const removeCustomStock = (symbol: string) => {
    setCustomStocks(prev => prev.filter(s => s !== symbol));
    toast({
      title: "Stock removido",
      description: `${symbol} ha sido removido de la lista`,
    });
  };

  const calculateMarketSummary = () => {
    if (marketData.length === 0) return { gainers: 0, losers: 0, avgChange: 0 };
    
    const gainers = marketData.filter(stock => stock.changesPercentage > 0).length;
    const losers = marketData.filter(stock => stock.changesPercentage < 0).length;
    const avgChange = marketData.reduce((sum, stock) => sum + stock.changesPercentage, 0) / marketData.length;
    
    return { gainers, losers, avgChange };
  };

  const marketSummary = calculateMarketSummary();

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Financiero</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button
            onClick={loadMarketData}
            disabled={isLoading}
            className="flex items-center gap-2 whitespace-nowrap"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {marketIndices.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.name} 
                className="p-3 sm:p-4 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                onClick={() => openChart(stat.symbol, stat.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">${stat.value}</p>
                    <div className="flex items-center mt-1">
                      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs sm:text-sm font-semibold truncate ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} ({stat.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${stat.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <MousePointer className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Click para gráfico</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Market Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl font-bold text-green-800">{marketSummary.gainers}</p>
                <p className="text-sm text-green-600">Acciones en Alza</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl font-bold text-red-800">{marketSummary.losers}</p>
                <p className="text-sm text-red-600">Acciones en Baja</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl font-bold text-blue-800">
                  {marketSummary.avgChange > 0 ? '+' : ''}{marketSummary.avgChange.toFixed(2)}%
                </p>
                <p className="text-sm text-blue-600">Cambio Promedio</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Real Market Data and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">Acciones en Tiempo Real</h3>
              </div>
              <AddStockModal onAddStock={addCustomStock} isLoading={isLoading} />
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {marketData.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer hover:scale-102 group"
                  onClick={() => openChart(stock.symbol, stock.name)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 truncate">{stock.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${stock.price?.toFixed(2) || '0.00'}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change > 0 ? '+' : ''}${stock.change?.toFixed(2) || '0.00'}
                        </span>
                        <Badge variant={stock.changesPercentage > 0 ? "default" : "destructive"} className="text-xs">
                          {stock.changesPercentage > 0 ? '+' : ''}{stock.changesPercentage?.toFixed(2) || '0.00'}%
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MousePointer className="w-3 h-3 mr-1" />
                        Ver gráfico
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomStock(stock.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {marketData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay datos disponibles</p>
                  <p className="text-sm">Agrega algunas acciones para ver datos en tiempo real</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Resumen de Mercado Detallado</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">Tendencia del Mercado</span>
                </div>
                <p className="text-sm text-green-700">
                  {marketSummary.avgChange > 0 ? 'Mercado alcista' : 'Mercado bajista'} con {marketSummary.gainers} acciones en alza.
                  El cambio promedio es de {marketSummary.avgChange.toFixed(2)}%.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Volatilidad del Mercado</span>
                </div>
                <p className="text-sm text-blue-700">
                  Volatilidad moderada con {marketData.length} acciones monitoreadas.
                  Rango promedio de variación: {Math.abs(marketSummary.avgChange).toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-800">Oportunidades de Inversión</span>
                </div>
                <p className="text-sm text-amber-700">
                  {marketSummary.losers > 0 
                    ? `${marketSummary.losers} acciones en corrección pueden presentar oportunidades de entrada.`
                    : 'Mercado estable, considera estrategias de diversificación.'
                  }
                </p>
              </div>

              {/* Detalles adicionales de los índices */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {marketIndices.slice(0, 4).map((index) => (
                  <div key={index.name} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 truncate">{index.name}</p>
                    <p className="font-semibold text-gray-900">{index.value}</p>
                    <p className={`text-xs ${index.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {index.change}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Market Analysis with AI */}
        <div className="mb-6">
          <MarketAnalysis marketIndices={marketIndices} marketData={marketData} />
        </div>
      </div>

      {/* Trading Chart Modal */}
      {selectedChart && (
        <TradingChart
          symbol={selectedChart.symbol}
          name={selectedChart.name}
          onClose={closeChart}
        />
      )}
    </div>
  );
};
