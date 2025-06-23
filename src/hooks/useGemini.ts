
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const useGemini = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const apiKey = "AIzaSyBTjEoZrwh9LiDFKghBNMBzk_9eaYVJW3o";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const extractSymbolsWithAI = async (userMessage: string): Promise<string[]> => {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analiza este mensaje y extrae SOLO los símbolos bursátiles válidos de empresas que cotizan en bolsa.

REGLAS:
1. Si mencionan "Apple" o "apple" → devuelve "AAPL"
2. Si mencionan "Microsoft" → devuelve "MSFT"
3. Si mencionan "Tesla" → devuelve "TSLA"
4. Si mencionan "Google" o "Alphabet" → devuelve "GOOGL"
5. Si mencionan "Amazon" → devuelve "AMZN"
6. Si mencionan "Meta" o "Facebook" → devuelve "META"
7. Si mencionan "Nvidia" → devuelve "NVDA"
8. Si mencionan "Netflix" → devuelve "NFLX"

IMPORTANTE: Responde SOLO con el símbolo (ej: "AAPL") o una lista separada por comas si hay varios (ej: "AAPL,MSFT"). NO agregues explicaciones.

Mensaje del usuario: "${userMessage}"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.1,
          maxOutputTokens: 50,
        }
      };

      console.log('Enviando request a Gemini para extraer símbolos:', userMessage);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('Respuesta de Gemini:', data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const extractedText = data.candidates[0].content.parts[0].text.trim().toUpperCase();
        console.log('Texto extraído:', extractedText);
        
        if (!extractedText || extractedText.length < 2) {
          return [];
        }
        
        // Dividir por comas y limpiar
        const symbols = extractedText
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length >= 1 && s.length <= 5 && /^[A-Z]+$/.test(s))
          .slice(0, 3);
        
        console.log('Símbolos finales extraídos:', symbols);
        return symbols;
      }
      
      return [];
    } catch (error) {
      console.error('Error extrayendo símbolos con IA:', error);
      
      // Fallback: detección manual básica
      const normalizedText = userMessage.toLowerCase();
      const companyMap: { [key: string]: string } = {
        'apple': 'AAPL',
        'microsoft': 'MSFT',
        'tesla': 'TSLA',
        'google': 'GOOGL',
        'alphabet': 'GOOGL',
        'amazon': 'AMZN',
        'meta': 'META',
        'facebook': 'META',
        'nvidia': 'NVDA',
        'netflix': 'NFLX'
      };
      
      const foundSymbols: string[] = [];
      Object.entries(companyMap).forEach(([company, symbol]) => {
        if (normalizedText.includes(company) && !foundSymbols.includes(symbol)) {
          foundSymbols.push(symbol);
        }
      });
      
      console.log('Símbolos detectados con fallback:', foundSymbols);
      return foundSymbols.slice(0, 3);
    }
  };

  const analyzeFinancialData = async (userMessage: string, financialData: any[]) => {
    setIsGenerating(true);
    
    try {
      let context = `Eres Maverlang-AI, un asesor financiero experto especializado en análisis de mercados.

CONSULTA DEL USUARIO: "${userMessage}"

`;

      if (financialData.length > 0) {
        context += `DATOS FINANCIEROS DISPONIBLES:
${financialData.map(data => `
**${data.symbol} - ${data.name}:**
- Precio actual: $${data.price?.toFixed(2)}
- Cambio diario: ${data.change > 0 ? '+' : ''}${data.change?.toFixed(2)} (${data.changesPercentage?.toFixed(2)}%)
- Ratio P/E: ${data.pe || 'N/A'}
- EPS: $${data.eps || 'N/A'}
- Capitalización: $${(data.marketCap / 1e9)?.toFixed(2)}B
- Sector: ${data.sector || 'N/A'}
- Industria: ${data.industry || 'N/A'}
- Beta: ${data.beta || 'N/A'}
- Empleados: ${data.employees || 'N/A'}
- CEO: ${data.ceo || 'N/A'}
`).join('')}

INSTRUCCIONES:
Proporciona un análisis financiero completo que incluya:

1. **Resumen Ejecutivo**: Visión general de la empresa/empresas
2. **Análisis de Precios**: Interpretación del precio actual y cambios
3. **Métricas Fundamentales**: Análisis de P/E, EPS, capitalización
4. **Posición Competitiva**: Contexto del sector e industria
5. **Recomendaciones**: Sugerencias basadas en los datos
6. **Factores de Riesgo**: Riesgos importantes a considerar

Usa un lenguaje profesional pero accesible. Incluye emojis para hacer el análisis más visual.`;
      } else {
        context += `No se encontraron datos financieros específicos para la consulta.

Por favor proporciona información educativa general sobre el tema consultado y explica conceptos financieros relevantes.`;
      }

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: context
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2000,
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Respuesta inválida de la API');
      }
    } catch (error) {
      console.error('Error al generar análisis con Gemini:', error);
      toast({
        title: "Error de IA",
        description: "No se pudo generar el análisis completo",
        variant: "destructive"
      });
      
      return `**🤖 Análisis de Maverlang-AI**

Hubo un problema técnico con el análisis de IA, pero los datos financieros están disponibles arriba.

**💡 Recomendación:** Inténtalo de nuevo en unos momentos.

**⚠️ Nota:** Consulta siempre con un asesor financiero profesional antes de tomar decisiones de inversión.`;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    analyzeFinancialData,
    extractSymbolsWithAI,
    isGenerating
  };
};
