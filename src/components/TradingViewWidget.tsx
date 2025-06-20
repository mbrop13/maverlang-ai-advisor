
import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbols: string[];
}

export const TradingViewWidget = ({ symbols }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!symbols.length || !containerRef.current) return;

    // Clear existing widgets
    containerRef.current.innerHTML = '';

    symbols.forEach((symbol) => {
      // Widget 1: Symbol Info
      const symbolInfoContainer = document.createElement('div');
      symbolInfoContainer.className = 'tradingview-widget-container mb-6';
      symbolInfoContainer.innerHTML = `
        <div class="tradingview-widget-container__widget"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span class="blue-text"></span>
          </a>
        </div>
      `;

      const symbolInfoScript = document.createElement('script');
      symbolInfoScript.type = 'text/javascript';
      symbolInfoScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
      symbolInfoScript.async = true;
      symbolInfoScript.innerHTML = JSON.stringify({
        symbol: `NASDAQ:${symbol}`,
        width: 550,
        locale: 'es',
        colorTheme: 'light',
        isTransparent: false
      });

      symbolInfoContainer.appendChild(symbolInfoScript);
      containerRef.current?.appendChild(symbolInfoContainer);

      // Widget 2: Advanced Chart
      const advancedChartContainer = document.createElement('div');
      advancedChartContainer.className = 'tradingview-widget-container mb-6';
      advancedChartContainer.style.height = '400px';
      advancedChartContainer.style.width = '100%';
      advancedChartContainer.innerHTML = `
        <div class="tradingview-widget-container__widget" style="height:calc(100% - 32px);width:100%"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span class="blue-text"></span>
          </a>
        </div>
      `;

      const advancedChartScript = document.createElement('script');
      advancedChartScript.type = 'text/javascript';
      advancedChartScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      advancedChartScript.async = true;
      advancedChartScript.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `NASDAQ:${symbol}`,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'es',
        allow_symbol_change: true,
        support_host: 'https://www.tradingview.com'
      });

      advancedChartContainer.appendChild(advancedChartScript);
      containerRef.current?.appendChild(advancedChartContainer);
    });
  }, [symbols]);

  if (!symbols.length) return null;

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Análisis Completo de Trading</h3>
      <div ref={containerRef} className="space-y-6"></div>
    </div>
  );
};
