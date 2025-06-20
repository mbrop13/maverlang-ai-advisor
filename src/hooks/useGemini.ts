
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
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const extractSymbolsWithAI = async (userMessage: string): Promise<string[]> => {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analiza el siguiente mensaje del usuario y extrae ÚNICAMENTE los símbolos bursátiles (tickers) válidos de empresas que cotizan en bolsa.

REGLAS ESTRICTAS:
1. Solo devuelve símbolos de empresas reales que cotizan en bolsa (AAPL, MSFT, TSLA, GOOGL, AMZN, META, NVDA, etc.)
2. NO incluyas palabras comunes como "sobre", "de", "dame", "información", "análisis", "empresa", etc.
3. Si se menciona el nombre de una empresa conocida, devuelve su símbolo oficial:
   - Apple → AAPL
   - Microsoft → MSFT  
   - Tesla → TSLA
   - Google/Alphabet → GOOGL
   - Amazon → AMZN
   - Meta/Facebook → META
   - Nvidia → NVDA
   - Netflix → NFLX
4. Máximo 3 símbolos por respuesta
5. Si no encuentras símbolos válidos, devuelve una lista vacía
6. Responde SOLO con los símbolos separados por comas, sin explicaciones

Mensaje del usuario: "${userMessage}"

Ejemplos:
- "información sobre Apple" → "AAPL"
- "análisis de Tesla y Microsoft" → "TSLA,MSFT"
- "dame datos sobre la empresa" → ""
- "cómo está NIO hoy" → "NIO"`
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
        const extractedText = data.candidates[0].content.parts[0].text.trim();
        
        // Si la respuesta está vacía o es muy corta, no hay símbolos válidos
        if (!extractedText || extractedText.length < 2) {
          return [];
        }
        
        // Filtrar y validar símbolos
        const symbols = extractedText
          .split(',')
          .map(s => s.trim().toUpperCase())
          .filter(s => {
            // Solo símbolos de 1-5 caracteres que no sean palabras comunes
            const commonWords = ['SOBRE', 'DE', 'DAME', 'INFO', 'ANALISIS', 'EMPRESA', 'DATOS', 'HOY'];
            return s.length >= 1 && s.length <= 5 && !commonWords.includes(s) && /^[A-Z]+$/.test(s);
          })
          .slice(0, 3); // Máximo 3 símbolos
        
        console.log('Símbolos extraídos por IA:', symbols);
        return symbols;
      }
      
      return [];
    } catch (error) {
      console.error('Error extrayendo símbolos con IA:', error);
      return [];
    }
  };

  const analyzeFinancialData = async (userMessage: string, financialData: any[]) => {
    setIsGenerating(true);
    
    try {
      let context = `Eres Maverlang-AI, un asesor financiero experto y profesional especializado en análisis de mercados. 

CONSULTA DEL USUARIO: "${userMessage}"

`;

      if (financialData.length > 0) {
        context += `DATOS FINANCIEROS DISPONIBLES:
${financialData.map(data => `
**${data.symbol} - ${data.name}:**
- Precio actual: $${data.price?.toFixed(2)}
- Cambio diario: ${data.change > 0 ? '+' : ''}${data.change?.toFixed(2)} (${data.changesPercentage?.toFixed(2)}%)
- Ratio P/E: ${data.pe || 'N/A'}
- Ganancias por acción (EPS): $${data.eps || 'N/A'}
- Capitalización de mercado: $${(data.marketCap / 1e9)?.toFixed(2)}B
- Sector: ${data.sector || 'N/A'}
- Industria: ${data.industry || 'N/A'}
`).join('')}

INSTRUCCIONES DE ANÁLISIS:
Proporciona un análisis financiero completo y profesional que incluya:

1. **Resumen Ejecutivo**: Visión general de las empresas analizadas
2. **Análisis Técnico**: Interpretación de precios, tendencias y momentum
3. **Análisis Fundamental**: Evaluación de métricas como P/E, EPS, capitalización
4. **Evaluación Sectorial**: Contexto de la industria y sector
5. **Comparativa**: Si hay múltiples acciones, compararlas detalladamente
6. **Recomendaciones**: Sugerencias de inversión basadas en perfil conservador a moderado
7. **Gestión de Riesgo**: Factores de riesgo importantes a considerar
8. **Perspectiva Temporal**: Análisis a corto, medio y largo plazo

Usa un lenguaje profesional pero accesible. Incluye emojis apropiados para hacer el análisis más visual y fácil de leer.`;
      } else {
        context += `No se encontraron datos financieros específicos para la consulta. 

Por favor:
1. Proporciona información educativa general sobre el tema consultado
2. Explica conceptos financieros relevantes
3. Sugiere cómo el usuario podría obtener la información que busca
4. Ofrece consejos generales de inversión responsable

Mantén un tono profesional y educativo.`;
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
          maxOutputTokens: 3000,
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
        description: "No se pudo generar el análisis. Los datos financieros están disponibles.",
        variant: "destructive"
      });
      
      return `**🤖 Análisis de Maverlang-AI**

Hubo un problema técnico con el análisis de IA, pero los datos financieros se obtuvieron correctamente.

**📊 Datos disponibles para análisis:**
${financialData.map(item => {
        const changeIcon = item.change > 0 ? '📈' : '📉';
        return `• **${item.symbol} (${item.name})**: $${item.price?.toFixed(2)} ${changeIcon} ${item.changesPercentage?.toFixed(2)}%`;
      }).join('\n')}

**💡 Recomendación:** Por favor, inténtalo de nuevo en unos momentos para obtener el análisis completo con IA.

**⚠️ Nota importante:** Siempre consulta con un asesor financiero profesional antes de tomar decisiones de inversión importantes.`;
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
