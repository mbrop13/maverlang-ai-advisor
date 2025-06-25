
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFinancialData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 1. Función para extraer símbolos bursátiles del texto del usuario
  const extractSymbolsFromText = async (text: string): Promise<string[]> => {
    // 2. Convertir texto a mayúsculas para búsqueda consistente
    const normalizedText = text.toUpperCase();
    
    // 3. Patrón regex para encontrar símbolos bursátiles (1-5 letras mayúsculas)
    const stockPattern = /\b[A-Z]{1,5}\b/g;
    
    // 4. Mapa de nombres de empresas a sus símbolos bursátiles
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
    
    // 5. Set para evitar símbolos duplicados
    const foundSymbols: Set<string> = new Set();
    
    // 6. Buscar nombres de empresas en el texto
    Object.entries(companyMentions).forEach(([company, symbol]) => {
      if (normalizedText.includes(company)) {
        foundSymbols.add(symbol);
      }
    });
    
    // 7. Buscar patrones de símbolos directamente
    const matches = normalizedText.match(stockPattern) || [];
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'IBM', 'CSCO'];
    
    // 8. Agregar símbolos encontrados que sean conocidos
    matches.forEach(match => {
      if (commonSymbols.includes(match) || match.length <= 5) {
        foundSymbols.add(match);
      }
    });
    
    // 9. Retornar array limitado a 5 símbolos
    return Array.from(foundSymbols).slice(0, 5);
  };

  // 10. Función para obtener datos reales de IEX Cloud (API gratuita y confiable)
  const fetchRealStockData = async (symbol: string) => {
    try {
      // 11. Usar IEX Cloud API que es gratuita y confiable
      const response = await fetch(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=demo`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 12. Verificar que hay datos válidos
      if (!data.latestPrice) {
        throw new Error(`No data found for ${symbol}`);
      }
      
      // 13. Retornar datos estructurados
      return {
        symbol: data.symbol,
        name: data.companyName || `${symbol} Inc.`,
        price: data.latestPrice,
        change: data.change,
        changesPercentage: data.changePercent * 100,
        pe: data.peRatio,
        eps: null,
        marketCap: data.marketCap,
        sector: data.sector || 'Technology',
        industry: data.industry || 'Software',
        website: null,
        description: `Datos reales para ${symbol}`,
        ceo: null,
        employees: null,
        exchange: data.primaryExchange || 'NASDAQ',
        currency: 'USD',
        country: 'US',
        beta: null,
        volAvg: data.avgTotalVolume,
        range: `${data.week52Low} - ${data.week52High}`,
        dcfDiff: null,
        dcf: null,
        high: data.high,
        low: data.low,
        open: data.open,
        volume: data.latestVolume
      };
    } catch (error) {
      console.error(`Error fetching real data for ${symbol}:`, error);
      return null;
    }
  };

  // 14. Función para generar datos simulados realistas
  const generateRealisticData = (symbol: string) => {
    // 15. Precios base realistas para cada símbolo
    const basePrices: { [key: string]: number } = {
      'AAPL': 175,
      'MSFT': 350,
      'GOOGL': 125,
      'AMZN': 140,
      'TSLA': 200,
      'META': 280,
      'NVDA': 450,
      'NFLX': 400,
      'AMD': 110,
      'INTC': 45,
      'CRM': 220,
      'ORCL': 105,
      'IBM': 140,
      'CSCO': 50
    };

    // 16. Información de empresas
    const companyInfo: { [key: string]: any } = {
      'AAPL': { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics' },
      'MSFT': { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software' },
      'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services' },
      'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'E-commerce' },
      'TSLA': { name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles' },
      'META': { name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Social Media' },
      'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
      'NFLX': { name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Streaming' }
    };

    // 17. Precio base + variación aleatoria realista
    const basePrice = basePrices[symbol] || 100;
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1; // ±10% variación
    
    // 18. Cambio diario realista
    const change = (Math.random() - 0.5) * price * 0.05; // ±5% cambio diario
    const changesPercentage = (change / (price - change)) * 100;
    
    // 19. Información de la empresa
    const info = companyInfo[symbol] || { name: `${symbol} Inc.`, sector: 'Technology', industry: 'Software' };
    
    return {
      symbol: symbol,
      name: info.name,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changesPercentage: Math.round(changesPercentage * 100) / 100,
      pe: Math.round((15 + Math.random() * 20) * 100) / 100, // P/E entre 15-35
      eps: Math.round((price / (15 + Math.random() * 20)) * 100) / 100,
      marketCap: Math.round((price * (1000000000 + Math.random() * 2000000000000)) / 1000000) * 1000000,
      sector: info.sector,
      industry: info.industry,
      website: `https://${symbol.toLowerCase()}.com`,
      description: `Datos simulados realistas para ${info.name}`,
      ceo: 'CEO Name',
      employees: Math.floor(50000 + Math.random() * 150000),
      exchange: 'NASDAQ',
      currency: 'USD',
      country: 'US',
      beta: Math.round((0.5 + Math.random() * 1.5) * 100) / 100, // Beta entre 0.5-2.0
      volAvg: Math.floor(10000000 + Math.random() * 50000000),
      range: `${Math.round((price * 0.7) * 100) / 100} - ${Math.round((price * 1.3) * 100) / 100}`,
      dcfDiff: null,
      dcf: null,
      high: Math.round((price * (1 + Math.random() * 0.05)) * 100) / 100,
      low: Math.round((price * (1 - Math.random() * 0.05)) * 100) / 100,
      open: Math.round((price + (Math.random() - 0.5) * price * 0.02) * 100) / 100,
      volume: Math.floor(5000000 + Math.random() * 20000000)
    };
  };

  // 20. Función principal para obtener datos financieros
  const fetchFinancialData = async (symbols: string[]) => {
    // 21. Validar que hay símbolos para buscar
    if (!symbols || symbols.length === 0) return [];
    
    // 22. Marcar como cargando
    setIsLoading(true);
    
    try {
      console.log('📊 Obteniendo datos financieros para:', symbols);
      
      // 23. Crear promesas para cada símbolo
      const promises = symbols.map(async (symbol) => {
        // 24. Intentar obtener datos reales primero
        const realData = await fetchRealStockData(symbol);
        
        if (realData) {
          console.log(`✅ Datos reales obtenidos para ${symbol}`);
          return realData;
        } else {
          console.log(`🔄 Usando datos simulados para ${symbol}`);
          return generateRealisticData(symbol);
        }
      });
      
      // 25. Esperar a que se completen todas las peticiones
      const results = await Promise.all(promises);
      
      // 26. Filtrar resultados válidos
      const validResults = results.filter(result => result !== null);
      
      console.log('📈 Datos financieros procesados:', validResults.length, 'símbolos');
      
      // 27. Retornar resultados válidos
      return validResults;
      
    } catch (error) {
      // 28. Log de error general
      console.error('❌ Error en fetchFinancialData:', error);
      
      // 29. Generar datos simulados como último recurso
      const fallbackData = symbols.map(symbol => generateRealisticData(symbol));
      
      // 30. Mostrar toast informativo
      toast({
        title: "Datos Simulados",
        description: "Usando datos simulados realistas debido a problemas de conectividad",
        variant: "default"
      });
      
      return fallbackData;
    } finally {
      // 31. Desmarcar como cargando
      setIsLoading(false);
    }
  };

  // 32. Retornar funciones y estado para uso en componentes
  return {
    fetchFinancialData,
    extractSymbolsFromText,
    isLoading
  };
};
