
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe,
  Building,
  Zap,
  RefreshCw,
  MousePointer
} from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import { TradingChart } from './TradingChart';

interface MarketOverviewProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

export const MarketOverview = ({ appState }: MarketOverviewProps) => {
  const { fetchFinancialData, isLoading } = useFinancialData();
  const { toast } = useToast();

  const [marketData, setMarketData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedChart, setSelectedChart] = useState<{ symbol: string; name: string } | null>(null);

  // Índices principales con símbolos correctos
  const [indices, setIndices] = useState([
    { name: 'S&P 500', symbol: '^GSPC', value: 0, change: 0, changePercent: 0 },
    { name: 'NASDAQ', symbol: '^IXIC', value: 0, change: 0, changePercent: 0 },
    { name: 'Dow Jones', symbol: '^DJI', value: 0, change: 0, changePercent: 0 },
    { name: 'VIX', symbol: '^VIX', value: 0, change: 0, changePercent: 0 }
  ]);

  const sectors = [
    { name: 'Tecnología', change: 2.45, icon: Zap, companies: ['AAPL', 'MSFT', 'GOOGL'] },
    { name: 'Financiero', change: -0.87, icon: Building, companies: ['JPM', 'BAC', 'WFC'] },
    { name: 'Salud', change: 1.23, icon: Globe, companies: ['JNJ', 'PFE', 'UNH'] },
    { name: 'Energía', change: -1.54, icon: TrendingDown, companies: ['XOM', 'CVX', 'COP'] },
    { name: 'Consumo', change: 0.76, icon: TrendingUp, companies: ['AMZN', 'TSLA', 'DIS'] }
  ];

  // Cargar datos reales del mercado
  const loadMarketData = async () => {
    try {
      // Cargar índices principales
      const indexSymbols = ['^GSPC', '^IXIC', '^DJI', '^VIX'];
      const indexData = await fetchFinancialData(indexSymbols);
      
      if (indexData.length > 0) {
        setIndices(prev => prev.map(index => {
          const realData = indexData.find(d => d.symbol === index.symbol);
          if (realData) {
            return {
              ...index,
              value: realData.price,
              change: realData.change,
              changePercent: realData.changesPercentage
            };
          }
          return index;
        }));
      }

      // Cargar acciones populares para ganadores y perdedores
      const popularSymbols = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 
        'AMD', 'INTC', 'CRM', 'ORCL', 'PYPL', 'ADBE', 'UBER', 'SPOT',
        'JPM', 'BAC', 'JNJ', 'PFE', 'XOM', 'CVX', 'DIS', 'WMT'
      ];
      
      const data = await fetchFinancialData(popularSymbols);
      setMarketData(data);
      setLastUpdated(new Date());
      
      toast({
        title: "Mercados actualizados",
        description: "Datos en tiempo real cargados correctamente",
      });
    } catch (error) {
      console.error('Error cargando datos del mercado:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del mercado",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const openChart = (symbol: string, name: string) => {
    setSelectedChart({ symbol, name });
  };

  const closeChart = () => {
    setSelectedChart(null);
  };

  // Separar ganadores y perdedores basado en datos reales
  const topGainers = marketData
    .filter(stock => stock.changesPercentage > 0)
    .sort((a, b) => b.changesPercentage - a.changesPercentage)
    .slice(0, 6);

  const topLosers = marketData
    .filter(stock => stock.changesPercentage < 0)
    .sort((a, b) => a.changesPercentage - b.changesPercentage)
    .slice(0, 6);

  return (
    <div className="w-full">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Mercados en Vivo</h1>
            <p className="text-gray-600 mt-1">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button
            onClick={loadMarketData}
            disabled={isLoading}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        {/* Major Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {indices.map((index) => {
            const isPositive = index.change > 0;
            return (
              <Card 
                key={index.symbol} 
                className="p-4 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                onClick={() => openChart(index.symbol, index.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">{index.name}</h3>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {index.value > 0 ? index.value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Cargando...'}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{index.change.toFixed(2)}
                  </span>
                  <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                    {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MousePointer className="w-3 h-3 mr-1" />
                  <span>Click para gráfico</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sectors Performance */}
        <Card className="p-6 bg-white shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Rendimiento por Sectores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              const isPositive = sector.change > 0;
              return (
                <div key={sector.name} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="font-medium text-gray-900 text-sm truncate">{sector.name}</span>
                  </div>
                  <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{sector.change.toFixed(2)}%
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sector.companies.map((company) => (
                      <Badge key={company} variant="outline" className="text-xs">
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Principales Ganadores
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {topGainers.length > 0 ? topGainers.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-all cursor-pointer hover:scale-105"
                  onClick={() => openChart(stock.symbol, stock.name)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{stock.symbol}</p>
                      <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">${stock.price.toFixed(2)}</p>
                    <p className="font-semibold text-green-600">+{stock.change.toFixed(2)}</p>
                    <p className="text-sm text-green-600">+{stock.changesPercentage.toFixed(2)}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">Cargando ganadores...</p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Principales Perdedores
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {topLosers.length > 0 ? topLosers.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-all cursor-pointer hover:scale-105"
                  onClick={() => openChart(stock.symbol, stock.name)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{stock.symbol}</p>
                      <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">${stock.price.toFixed(2)}</p>
                    <p className="font-semibold text-red-600">{stock.change.toFixed(2)}</p>
                    <p className="text-sm text-red-600">{stock.changesPercentage.toFixed(2)}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">Cargando perdedores...</p>
              )}
            </div>
          </Card>
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
