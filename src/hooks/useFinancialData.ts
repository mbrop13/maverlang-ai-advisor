
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFinancialData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const extractSymbolsFromText = async (text: string): Promise<string[]> => {
    const normalizedText = text.toUpperCase();
    
    const stockPattern = /\b[A-Z]{1,5}\b/g;
    const companyMentions = {
      'APPLE': 'AAPL',
      'MICROSOFT': 'MSFT',
      'GOOGLE': 'GOOGL',
      'ALPHABET': 'GOOGL',
      'AMAZON': 'AMZN',
      'TESLA': 'TSLA',
      'META': 'META',
      'FACEBOOK': 'META',
      'NVIDIA': 'NVDA',
      'NETFLIX': 'NFLX',
      'AMD': 'AMD',
      'INTEL': 'INTC',
      'SALESFORCE': 'CRM',
      'ORACLE': 'ORCL',
      'IBM': 'IBM',
      'CISCO': 'CSCO'
    };
    
    const foundSymbols: Set<string> = new Set();
    
    Object.entries(companyMentions).forEach(([company, symbol]) => {
      if (normalizedText.includes(company)) {
        foundSymbols.add(symbol);
      }
    });
    
    const matches = normalizedText.match(stockPattern) || [];
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'IBM', 'CSCO'];
    
    matches.forEach(match => {
      if (commonSymbols.includes(match) || match.length <= 5) {
        foundSymbols.add(match);
      }
    });
    
    return Array.from(foundSymbols).slice(0, 5);
  };

  const fetchFinancialData = async (symbols: string[]) => {
    if (!symbols || symbols.length === 0) return [];
    
    setIsLoading(true);
    
    try {
      // Usar API alternativa gratuita de Alpha Vantage para datos más confiables
      const promises = symbols.map(async (symbol) => {
        try {
          // Usar API gratuita de Yahoo Finance alternativa
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
            throw new Error(`No data found for ${symbol}`);
          }
          
          const result = data.chart.result[0];
          const meta = result.meta;
          const quote = result.indicators.quote[0];
          
          // Obtener datos adicionales de la empresa
          const quoteResponse = await fetch(
            `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,summaryDetail,assetProfile,financialData`
          );
          
          let companyData = null;
          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            if (quoteData.quoteSummary && quoteData.quoteSummary.result) {
              companyData = quoteData.quoteSummary.result[0];
            }
          }
          
          const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
          const previousClose = meta.previousClose;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;
          
          return {
            symbol: meta.symbol,
            name: companyData?.assetProfile?.longName || `${symbol} Inc.`,
            price: currentPrice,
            change: change,
            changesPercentage: changePercent,
            pe: companyData?.defaultKeyStatistics?.trailingPE?.raw || null,
            eps: companyData?.defaultKeyStatistics?.trailingEps?.raw || null,
            marketCap: companyData?.summaryDetail?.marketCap?.raw || meta.marketCap,
            sector: companyData?.assetProfile?.sector || 'Technology',
            industry: companyData?.assetProfile?.industry || 'Software',
            website: companyData?.assetProfile?.website || null,
            description: companyData?.assetProfile?.longBusinessSummary || `Datos financieros para ${symbol}`,
            ceo: companyData?.assetProfile?.companyOfficers?.[0]?.name || 'N/A',
            employees: companyData?.assetProfile?.fullTimeEmployees || null,
            exchange: meta.exchangeName,
            currency: meta.currency,
            country: companyData?.assetProfile?.country || 'US',
            beta: companyData?.defaultKeyStatistics?.beta?.raw || null,
            volAvg: meta.averageDailyVolume10Day,
            range: meta.range,
            dcfDiff: null,
            dcf: null
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          
          // Fallback: usar datos básicos de la API de cotizaciones simples
          try {
            const fallbackResponse = await fetch(
              `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${symbol}`
            );
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              const quote = fallbackData.quoteResponse.result[0];
              
              if (quote) {
                return {
                  symbol: quote.symbol,
                  name: quote.longName || quote.shortName || `${symbol} Inc.`,
                  price: quote.regularMarketPrice,
                  change: quote.regularMarketChange,
                  changesPercentage: quote.regularMarketChangePercent,
                  pe: quote.trailingPE || null,
                  eps: quote.epsTrailingTwelveMonths || null,
                  marketCap: quote.marketCap,
                  sector: 'N/A',
                  industry: 'N/A',
                  website: null,
                  description: `Datos básicos para ${symbol}`,
                  ceo: 'N/A',
                  employees: null,
                  exchange: quote.fullExchangeName,
                  currency: quote.currency,
                  country: 'US',
                  beta: quote.beta || null,
                  volAvg: quote.averageDailyVolume3Month,
                  range: `${quote.fiftyTwoWeekLow} - ${quote.fiftyTwoWeekHigh}`,
                  dcfDiff: null,
                  dcf: null
                };
              }
            }
          } catch (fallbackError) {
            console.error(`Fallback also failed for ${symbol}:`, fallbackError);
          }
          
          // Si todo falla, retornar null para filtrar después
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      const validResults = results.filter(result => result !== null);
      
      if (validResults.length === 0) {
        toast({
          title: "Error de API",
          description: "No se pudieron obtener datos reales. Verifique los símbolos ingresados.",
          variant: "destructive"
        });
      }
      
      return validResults;
      
    } catch (error) {
      console.error('Error in fetchFinancialData:', error);
      toast({
        title: "Error",
        description: "No se pudieron obtener los datos financieros",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchFinancialData,
    extractSymbolsFromText,
    isLoading
  };
};
