
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
      // Create main container for all widgets
      const mainContainer = document.createElement('div');
      mainContainer.className = 'mb-8 p-4 bg-gray-50 rounded-lg';
      
      // Symbol title
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `<h4 class="text-lg font-bold text-gray-800 mb-4">📊 Análisis Completo de ${symbol}</h4>`;
      mainContainer.appendChild(titleDiv);

      // Container for widgets 1-4 (same width)
      const topWidgetsContainer = document.createElement('div');
      topWidgetsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6';

      // Widget 1: Symbol Info
      const symbolInfoContainer = document.createElement('div');
      symbolInfoContainer.className = 'tradingview-widget-container';
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
      topWidgetsContainer.appendChild(symbolInfoContainer);

      // Widget 2: Advanced Chart
      const advancedChartContainer = document.createElement('div');
      advancedChartContainer.className = 'tradingview-widget-container';
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
      topWidgetsContainer.appendChild(advancedChartContainer);

      // Widget 3: Symbol Profile
      const symbolProfileContainer = document.createElement('div');
      symbolProfileContainer.className = 'tradingview-widget-container';
      symbolProfileContainer.innerHTML = `
        <div class="tradingview-widget-container__widget"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span class="blue-text"></span>
          </a>
        </div>
      `;

      const symbolProfileScript = document.createElement('script');
      symbolProfileScript.type = 'text/javascript';
      symbolProfileScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
      symbolProfileScript.async = true;
      symbolProfileScript.innerHTML = JSON.stringify({
        width: 400,
        height: 550,
        isTransparent: false,
        colorTheme: 'light',
        symbol: `NASDAQ:${symbol}`,
        locale: 'es'
      });

      symbolProfileContainer.appendChild(symbolProfileScript);
      topWidgetsContainer.appendChild(symbolProfileContainer);

      // Widget 4: Financials
      const financialsContainer = document.createElement('div');
      financialsContainer.className = 'tradingview-widget-container';
      financialsContainer.innerHTML = `
        <div class="tradingview-widget-container__widget"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span class="blue-text"></span>
          </a>
        </div>
      `;

      const financialsScript = document.createElement('script');
      financialsScript.type = 'text/javascript';
      financialsScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
      financialsScript.async = true;
      financialsScript.innerHTML = JSON.stringify({
        isTransparent: false,
        largeChartUrl: '',
        displayMode: 'regular',
        width: 400,
        height: 550,
        colorTheme: 'light',
        symbol: `NASDAQ:${symbol}`,
        locale: 'es'
      });

      financialsContainer.appendChild(financialsScript);
      topWidgetsContainer.appendChild(financialsContainer);

      mainContainer.appendChild(topWidgetsContainer);

      // Container for widgets 5-6 (half width)
      const bottomWidgetsContainer = document.createElement('div');
      bottomWidgetsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4';

      // Widget 5: Technical Analysis
      const technicalAnalysisContainer = document.createElement('div');
      technicalAnalysisContainer.className = 'tradingview-widget-container';
      technicalAnalysisContainer.innerHTML = `
        <div class="tradingview-widget-container__widget"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span class="blue-text">Siga los mercados en TradingView</span>
          </a>
        </div>
      `;

      const technicalAnalysisScript = document.createElement('script');
      technicalAnalysisScript.type = 'text/javascript';
      technicalAnalysisScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
      technicalAnalysisScript.async = true;
      technicalAnalysisScript.innerHTML = JSON.stringify({
        interval: '1m',
        width: 425,
        isTransparent: false,
        height: 450,
        symbol: `NASDAQ:${symbol}`,
        showIntervalTabs: true,
        displayMode: 'single',
        locale: 'es',
        colorTheme: 'light'
      });

      technicalAnalysisContainer.appendChild(technicalAnalysisScript);
      bottomWidgetsContainer.appendChild(technicalAnalysisContainer);

      // Widget 6: Timeline
      const timelineContainer = document.createElement('div');
      timelineContainer.className = 'tradingview-widget-container';
      timelineContainer.innerHTML = `
        <div class="tradingview-widget-container__widget"></div>
        <div class="tradingview-widget-copyright">
          <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span class="blue-text"></span>
          </a>
        </div>
      `;

      const timelineScript = document.createElement('script');
      timelineScript.type = 'text/javascript';
      timelineScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
      timelineScript.async = true;
      timelineScript.innerHTML = JSON.stringify({
        feedMode: 'all_symbols',
        isTransparent: false,
        displayMode: 'regular',
        width: '400',
        height: '550',
        colorTheme: 'light',
        locale: 'en'
      });

      timelineContainer.appendChild(timelineScript);
      bottomWidgetsContainer.appendChild(timelineContainer);

      mainContainer.appendChild(bottomWidgetsContainer);
      containerRef.current?.appendChild(mainContainer);
    });
  }, [symbols]);

  if (!symbols.length) return null;

  return (
    <div className="my-6">
      <div ref={containerRef} className="space-y-6"></div>
    </div>
  );
};
