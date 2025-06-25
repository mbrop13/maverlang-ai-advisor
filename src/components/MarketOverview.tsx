
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
  RefreshCw
} from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';

interface MarketOverviewProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

export const MarketOverview = ({ appState }: MarketOverviewProps) => {
  const { fetchFinancialData, isLoading } = useFinancialData();
  const { toast } = useToast();

  const [marketData, setMarketData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Datos estáticos de índices principales
  const indices = [
    { name: 'S&P 500', symbol: '^GSPC', value: 4782.20, change: 57.18, changePercent: 1.21 },
    { name: 'Dow Jones', symbol: '^DJI', value: 37428.92, change: -125.81, changePercent: -0.34 },
    { name: 'NASDAQ', symbol: '^IXIC', value: 14963.87, change: 310.52, changePercent: 2.12 },
    { name: 'Russell 2000', symbol: '^RUT', value: 1975.42, change: 24.33, changePercent: 1.25 }
  ];

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
      const topGainerSymbols = ['NVDA', 'AMD', 'TSLA', 'AAPL', 'MSFT'];
      const topLoserSymbols = ['META', 'NFLX', 'AMZN', 'GOOGL'];
      
      const allSymbols = [...new Set([...topGainerSymbols, ...topLoserSymbols])];
      const data = await fetchFinancialData(allSymbols);
      
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

  // Separar ganadores y perdedores basado en datos reales
  const topGainers = marketData
    .filter(stock => stock.changesPercentage > 0)
    .sort((a, b) => b.changesPercentage - a.changesPercentage)
    .slice(0, 4);

  const topLosers = marketData
    .filter(stock => stock.changesPercentage < 0)
    .sort((a, b) => a.changesPercentage - b.changesPercentage)
    .slice(0, 4);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mercados en Vivo</h1>
            <p className="text-gray-600">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button
            onClick={loadMarketData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        {/* Major Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {indices.map((index) => {
            const isPositive = index.change > 0;
            return (
              <Card key={index.symbol} className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{index.name}</h3>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {index.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{index.change.toFixed(2)}
                  </span>
                  <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                    {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              const isPositive = sector.change > 0;
              return (
                <div key={sector.name} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="font-medium text-gray-900">{sector.name}</span>
                  </div>
                  <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{sector.change.toFixed(2)}%
                  </p>
                  <div className="flex gap-1 mt-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Principales Ganadores
            </h3>
            <div className="space-y-3">
              {topGainers.length > 0 ? topGainers.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.symbol}</p>
                      <p className="text-sm text-gray-600">${stock.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
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
            <div className="space-y-3">
              {topLosers.length > 0 ? topLosers.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.symbol}</p>
                      <p className="text-sm text-gray-600">${stock.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
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
    </div>
  );
};
