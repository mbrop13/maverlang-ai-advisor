
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
      const apiKey = 'fCHTBdDUx8bqkZMrYJrqTInrUJN9KdkN';
      const promises = symbols.map(async (symbol) => {
        try {
          // Obtener datos de la empresa
          const profileResponse = await fetch(
            `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
          );
          
          if (!profileResponse.ok) {
            throw new Error(`HTTP error! status: ${profileResponse.status}`);
          }
          
          const profileData = await profileResponse.json();
          
          if (!profileData || profileData.length === 0) {
            throw new Error(`No data found for ${symbol}`);
          }
          
          const profile = profileData[0];
          
          // Obtener métricas financieras adicionales
          const metricsResponse = await fetch(
            `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${apiKey}`
          );
          
          let metrics = null;
          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json();
            metrics = metricsData[0];
          }
          
          return {
            symbol: profile.symbol,
            name: profile.companyName,
            price: profile.price,
            change: profile.changes,
            changesPercentage: profile.changesPercentage,
            pe: metrics?.peRatio || profile.pe || null,
            eps: metrics?.revenuePerShare || null,
            marketCap: profile.mktCap,
            sector: profile.sector,
            industry: profile.industry,
            website: profile.website,
            description: profile.description,
            ceo: profile.ceo,
            employees: profile.fullTimeEmployees,
            exchange: profile.exchange,
            currency: profile.currency,
            country: profile.country,
            beta: profile.beta,
            volAvg: profile.volAvg,
            range: profile.range,
            dcfDiff: profile.dcfDiff,
            dcf: profile.dcf
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          // Retornar datos mock si falla la API
          return {
            symbol,
            name: `${symbol} Inc.`,
            price: Math.random() * 500 + 50,
            change: (Math.random() - 0.5) * 20,
            changesPercentage: (Math.random() - 0.5) * 10,
            pe: Math.random() * 30 + 10,
            eps: Math.random() * 10 + 1,
            marketCap: Math.random() * 1000000000000 + 100000000000,
            sector: 'Technology',
            industry: 'Software',
            error: `API error for ${symbol}`,
            website: null,
            description: `Mock data for ${symbol} due to API error`,
            ceo: 'N/A',
            employees: null,
            exchange: 'NASDAQ',
            currency: 'USD',
            country: 'US',
            beta: null,
            volAvg: null,
            range: null,
            dcfDiff: null,
            dcf: null
          };
        }
      });
      
      const results = await Promise.all(promises);
      return results.filter(result => result !== null);
      
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
