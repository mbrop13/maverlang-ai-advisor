
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFinancialData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const extractSymbolsFromText = async (text: string): Promise<string[]> => {
    const stockPattern = /\b[A-Z]{1,5}\b/g;
    const matches = text.match(stockPattern) || [];
    
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
    const foundSymbols = matches.filter(symbol => 
      commonSymbols.includes(symbol) || symbol.length <= 5
    );
    
    return [...new Set(foundSymbols)].slice(0, 5);
  };

  const fetchFinancialData = async (symbols: string[]) => {
    setIsLoading(true);
    
    try {
      // Simular datos financieros para demo
      const mockData = symbols.map(symbol => {
        const basePrice = Math.random() * 500 + 50;
        const change = (Math.random() - 0.5) * 20;
        
        return {
          symbol,
          name: getCompanyName(symbol),
          price: basePrice,
          change: change,
          changesPercentage: (change / basePrice) * 100,
          pe: Math.random() * 30 + 10,
          eps: Math.random() * 10 + 1,
          marketCap: Math.random() * 1000000000000 + 100000000000,
          sector: getSector(symbol),
          industry: getIndustry(symbol)
        };
      });
      
      return mockData;
    } catch (error) {
      console.error('Error fetching financial data:', error);
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

  const getCompanyName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'NFLX': 'Netflix Inc.',
      'AMD': 'Advanced Micro Devices',
      'INTC': 'Intel Corporation'
    };
    return names[symbol] || `${symbol} Corporation`;
  };

  const getSector = (symbol: string): string => {
    const sectors: { [key: string]: string } = {
      'AAPL': 'Technology',
      'MSFT': 'Technology',
      'GOOGL': 'Technology',
      'AMZN': 'Consumer Discretionary',
      'TSLA': 'Automotive',
      'META': 'Technology',
      'NVDA': 'Technology',
      'NFLX': 'Entertainment',
      'AMD': 'Technology',
      'INTC': 'Technology'
    };
    return sectors[symbol] || 'Technology';
  };

  const getIndustry = (symbol: string): string => {
    const industries: { [key: string]: string } = {
      'AAPL': 'Consumer Electronics',
      'MSFT': 'Software',
      'GOOGL': 'Internet Services',
      'AMZN': 'E-commerce',
      'TSLA': 'Electric Vehicles',
      'META': 'Social Media',
      'NVDA': 'Semiconductors',
      'NFLX': 'Streaming Services',
      'AMD': 'Semiconductors',
      'INTC': 'Semiconductors'
    };
    return industries[symbol] || 'Technology Services';
  };

  return {
    fetchFinancialData,
    extractSymbolsFromText,
    isLoading
  };
};
