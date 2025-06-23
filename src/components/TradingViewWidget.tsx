
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

    symbols.forEach((symbol, index) => {
      // Create unique container ID for each symbol
      const containerId = `tradingview-widget-${symbol}-${index}`;
      
      // Create main container for all widgets
      const mainContainer = document.createElement('div');
      mainContainer.className = 'mb-8 p-4 bg-gray-50 rounded-lg';
      
      // Symbol title
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `<h4 class="text-lg font-bold text-gray-800 mb-4">📊 Análisis Completo de ${symbol}</h4>`;
      mainContainer.appendChild(titleDiv);

      // Container for widgets grid
      const widgetsContainer = document.createElement('div');
      widgetsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4';

      // Widget 1: Symbol Info
      const symbolInfoContainer = document.createElement('div');
      symbolInfoContainer.className = 'tradingview-widget-container';
      symbolInfoContainer.id = `${containerId}-info`;
      
      const symbolInfoScript = document.createElement('script');
      symbolInfoScript.type = 'text/javascript';
      symbolInfoScript.async = true;
      symbolInfoScript.innerHTML = JSON.stringify({
        symbol: `NASDAQ:${symbol}`,
        width: "100%",
        locale: 'es',
        colorTheme: 'light',
        isTransparent: false
      });
      
      // Add TradingView script source
      setTimeout(() => {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
        scriptElement.async = true;
        scriptElement.onload = () => {
          // Widget loaded successfully
          console.log(`Symbol info widget loaded for ${symbol}`);
        };
        symbolInfoContainer.appendChild(scriptElement);
        symbolInfoContainer.appendChild(symbolInfoScript);
      }, 100 * index);

      widgetsContainer.appendChild(symbolInfoContainer);

      // Widget 2: Mini Chart
      const miniChartContainer = document.createElement('div');
      miniChartContainer.className = 'tradingview-widget-container';
      miniChartContainer.id = `${containerId}-chart`;
      miniChartContainer.style.height = '400px';
      
      const miniChartScript = document.createElement('script');
      miniChartScript.type = 'text/javascript';
      miniChartScript.async = true;
      miniChartScript.innerHTML = JSON.stringify({
        symbol: `NASDAQ:${symbol}`,
        width: "100%",
        height: "400",
        locale: 'es',
        dateRange: '12M',
        colorTheme: 'light',
        isTransparent: false,
        autosize: true,
        largeChartUrl: ''
      });

      setTimeout(() => {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        scriptElement.async = true;
        scriptElement.onload = () => {
          console.log(`Mini chart widget loaded for ${symbol}`);
        };
        miniChartContainer.appendChild(scriptElement);
        miniChartContainer.appendChild(miniChartScript);
      }, 200 * index);

      widgetsContainer.appendChild(miniChartContainer);

      // Widget 3: Technical Analysis
      const technicalContainer = document.createElement('div');
      technicalContainer.className = 'tradingview-widget-container';
      technicalContainer.id = `${containerId}-technical`;
      
      const technicalScript = document.createElement('script');
      technicalScript.type = 'text/javascript';
      technicalScript.async = true;
      technicalScript.innerHTML = JSON.stringify({
        interval: '1D',
        width: "100%",
        isTransparent: false,
        height: 400,
        symbol: `NASDAQ:${symbol}`,
        showIntervalTabs: true,
        locale: 'es',
        colorTheme: 'light'
      });

      setTimeout(() => {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        scriptElement.async = true;
        scriptElement.onload = () => {
          console.log(`Technical analysis widget loaded for ${symbol}`);
        };
        technicalContainer.appendChild(scriptElement);
        technicalContainer.appendChild(technicalScript);
      }, 300 * index);

      widgetsContainer.appendChild(technicalContainer);

      // Widget 4: Company Profile
      const profileContainer = document.createElement('div');
      profileContainer.className = 'tradingview-widget-container';
      profileContainer.id = `${containerId}-profile`;
      
      const profileScript = document.createElement('script');
      profileScript.type = 'text/javascript';
      profileScript.async = true;
      profileScript.innerHTML = JSON.stringify({
        symbol: `NASDAQ:${symbol}`,
        width: "100%",
        height: 400,
        locale: 'es',
        colorTheme: 'light',
        isTransparent: false
      });

      setTimeout(() => {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
        scriptElement.async = true;
        scriptElement.onload = () => {
          console.log(`Profile widget loaded for ${symbol}`);
        };
        profileContainer.appendChild(scriptElement);
        profileContainer.appendChild(profileScript);
      }, 400 * index);

      widgetsContainer.appendChild(profileContainer);

      mainContainer.appendChild(widgetsContainer);
      
      if (containerRef.current) {
        containerRef.current.appendChild(mainContainer);
      }
    });

    // Clean up function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbols]);

  if (!symbols.length) return null;

  return (
    <div className="my-6">
      <div ref={containerRef} className="space-y-6"></div>
    </div>
  );
};
