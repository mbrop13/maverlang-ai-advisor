
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

interface TradingViewWidgetProps {
  symbols: string[];
}

export const TradingViewWidget = ({ symbols }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedWidgets, setLoadedWidgets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!symbols.length || !containerRef.current) return;

    // Limpiar contenedor
    containerRef.current.innerHTML = '';
    setLoadedWidgets(new Set());

    symbols.forEach((symbol, index) => {
      if (!containerRef.current) return;

      const symbolContainer = document.createElement('div');
      symbolContainer.className = 'mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200';
      
      // Título del símbolo
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Análisis Completo de ${symbol}</h3>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">${symbol}</span>
        </div>
      `;
      symbolContainer.appendChild(titleDiv);

      // Grid de widgets
      const widgetsGrid = document.createElement('div');
      widgetsGrid.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';

      // Widget 1: Gráfico principal
      const chartContainer = document.createElement('div');
      chartContainer.className = 'lg:col-span-2';
      const chartWidget = document.createElement('div');
      chartWidget.className = 'tradingview-widget-container';
      chartWidget.style.height = '500px';
      chartWidget.id = `chart-${symbol}-${Date.now()}-${index}`;
      
      setTimeout(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          autosize: true,
          symbol: `NASDAQ:${symbol}`,
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
          container_id: chartWidget.id
        });
        chartWidget.appendChild(script);
      }, 200 * index);

      chartContainer.appendChild(chartWidget);
      widgetsGrid.appendChild(chartContainer);

      // Widget 2: Información del símbolo
      const infoContainer = document.createElement('div');
      infoContainer.className = 'bg-white rounded-lg p-4 shadow-sm';
      const infoWidget = document.createElement('div');
      infoWidget.className = 'tradingview-widget-container';
      infoWidget.id = `info-${symbol}-${Date.now()}-${index}`;
      
      setTimeout(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          symbol: `NASDAQ:${symbol}`,
          width: '100%',
          locale: 'es',
          colorTheme: 'light',
          isTransparent: false
        });
        infoWidget.appendChild(script);
      }, 400 * index);

      infoContainer.appendChild(infoWidget);
      widgetsGrid.appendChild(infoContainer);

      // Widget 3: Análisis técnico
      const technicalContainer = document.createElement('div');
      technicalContainer.className = 'bg-white rounded-lg p-4 shadow-sm';
      const technicalWidget = document.createElement('div');
      technicalWidget.className = 'tradingview-widget-container';
      technicalWidget.style.height = '350px';
      technicalWidget.id = `technical-${symbol}-${Date.now()}-${index}`;
      
      setTimeout(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          interval: '1D',
          width: '100%',
          isTransparent: false,
          height: 350,
          symbol: `NASDAQ:${symbol}`,
          showIntervalTabs: true,
          locale: 'es',
          colorTheme: 'light'
        });
        technicalWidget.appendChild(script);
      }, 600 * index);

      technicalContainer.appendChild(technicalWidget);
      widgetsGrid.appendChild(technicalContainer);

      symbolContainer.appendChild(widgetsGrid);
      
      if (containerRef.current) {
        containerRef.current.appendChild(symbolContainer);
      }
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbols]);

  if (!symbols.length) return null;

  return (
    <div className="my-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Análisis de Mercado en Tiempo Real</h2>
        </div>
        <div className="flex gap-2">
          {symbols.map((symbol) => (
            <Badge key={symbol} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {symbol}
            </Badge>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="space-y-8"></div>
    </div>
  );
};
