
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, TrendingUp } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  name: string;
  onClose: () => void;
}

export const TradingChart = ({ symbol, name, onClose }: TradingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Limpiar contenedor
    containerRef.current.innerHTML = '';

    // Crear el widget de TradingView
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol.startsWith('^') ? `INDEX:${symbol.substring(1)}` : `NASDAQ:${symbol}`,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'es',
      enable_publishing: false,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      gridColor: 'rgba(240, 243, 250, 1)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: containerRef.current.id
    });

    containerRef.current.appendChild(script);
    
    setTimeout(() => setIsLoaded(true), 2000);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <Card className="fixed inset-4 z-50 bg-white shadow-2xl border-2 border-blue-200">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">Gráfico en tiempo real - {symbol}</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cerrar
        </Button>
      </div>
      
      <div className="p-4" style={{ height: 'calc(100vh - 200px)' }}>
        {!isLoaded && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando gráfico de {name}...</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          id={`tradingview-${symbol}-${Date.now()}`}
          className="tradingview-widget-container"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </Card>
  );
};
