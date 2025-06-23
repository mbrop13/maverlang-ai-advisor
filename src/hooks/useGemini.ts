
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
  // 1. Estado para controlar si la IA está generando una respuesta
  const [isGenerating, setIsGenerating] = useState(false);
  // 2. Hook para mostrar notificaciones toast al usuario
  const { toast } = useToast();
  
  // 3. Clave API de Google Gemini para hacer peticiones
  const apiKey = "AIzaSyBTjEoZrwh9LiDFKghBNMBzk_9eaYVJW3o";
  // 4. URL completa de la API de Gemini con la clave incluida
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // 5. Función principal para extraer símbolos bursátiles del mensaje del usuario
  const extractSymbolsWithAI = async (userMessage: string): Promise<string[]> => {
    try {
      // 6. Configuración del cuerpo de la petición para Gemini
      const requestBody = {
        contents: [
          {
            parts: [
              {
                // 7. Prompt específico que le dice a Gemini exactamente qué hacer
                text: `Analiza este mensaje y extrae SOLO los símbolos bursátiles válidos de empresas que cotizan en bolsa.

REGLAS ESPECÍFICAS:
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
        // 8. Configuración para hacer la respuesta más determinística
        generationConfig: {
          temperature: 0.1,    // 9. Baja creatividad para respuestas consistentes
          topK: 1,            // 10. Solo considera la mejor opción
          topP: 0.1,          // 11. Baja diversidad en las respuestas
          maxOutputTokens: 50, // 12. Límite de tokens para respuesta corta
        }
      };

      // 13. Log para debug - mostrar qué mensaje se está procesando
      console.log('Enviando request a Gemini para extraer símbolos:', userMessage);
      
      // 14. Petición HTTP POST a la API de Gemini
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody) // 15. Convertir objeto a JSON
      });

      // 16. Verificar si la respuesta HTTP fue exitosa
      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
      }

      // 17. Convertir respuesta JSON a objeto TypeScript
      const data: GeminiResponse = await response.json();
      // 18. Log para debug - mostrar respuesta completa de Gemini
      console.log('Respuesta de Gemini:', data);
      
      // 19. Verificar si Gemini devolvió una respuesta válida
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        // 20. Extraer y limpiar el texto de la respuesta
        const extractedText = data.candidates[0].content.parts[0].text.trim().toUpperCase();
        // 21. Log para debug - mostrar texto extraído
        console.log('Texto extraído:', extractedText);
        
        // 22. Validar que el texto no esté vacío y tenga al menos 2 caracteres
        if (!extractedText || extractedText.length < 2) {
          return []; // 23. Retornar array vacío si no hay texto válido
        }
        
        // 24. Procesar la respuesta: dividir por comas y limpiar cada símbolo
        const symbols = extractedText
          .split(',')                    // 25. Separar múltiples símbolos por coma
          .map(s => s.trim())           // 26. Quitar espacios en blanco
          .filter(s => s.length >= 1 && s.length <= 5 && /^[A-Z]+$/.test(s)) // 27. Filtrar solo símbolos válidos (1-5 letras mayúsculas)
          .slice(0, 3);                 // 28. Limitar a máximo 3 símbolos
        
        // 29. Log para debug - mostrar símbolos finales procesados
        console.log('Símbolos finales extraídos:', symbols);
        return symbols; // 30. Retornar array de símbolos válidos
      }
      
      return []; // 31. Retornar array vacío si no hay candidatos válidos
    } catch (error) {
      // 32. Log de error si falla la petición a Gemini
      console.error('Error extrayendo símbolos con IA:', error);
      
      // 33. Sistema de fallback: detección manual básica
      const normalizedText = userMessage.toLowerCase(); // 34. Convertir mensaje a minúsculas
      // 35. Mapa de nombres de empresas a símbolos bursátiles
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
      
      // 36. Array para almacenar símbolos encontrados manualmente
      const foundSymbols: string[] = [];
      // 37. Buscar cada empresa en el texto del usuario
      Object.entries(companyMap).forEach(([company, symbol]) => {
        // 38. Si encuentra el nombre de la empresa y el símbolo no está duplicado
        if (normalizedText.includes(company) && !foundSymbols.includes(symbol)) {
          foundSymbols.push(symbol); // 39. Agregar símbolo al array
        }
      });
      
      // 40. Log para debug - mostrar símbolos detectados con fallback
      console.log('Símbolos detectados con fallback:', foundSymbols);
      return foundSymbols.slice(0, 3); // 41. Retornar máximo 3 símbolos
    }
  };

  // 42. Función para generar análisis financiero usando IA
  const analyzeFinancialData = async (userMessage: string, financialData: any[]) => {
    setIsGenerating(true); // 43. Marcar que la IA está generando
    
    try {
      // 44. Construir el contexto inicial para el prompt
      let context = `Eres Maverlang-AI, un asesor financiero experto especializado en análisis de mercados.

CONSULTA DEL USUARIO: "${userMessage}"

`;

      // 45. Si hay datos financieros, agregarlos al contexto
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
        // 46. Si no hay datos, pedir información educativa general
        context += `No se encontraron datos financieros específicos para la consulta.

Por favor proporciona información educativa general sobre el tema consultado y explica conceptos financieros relevantes.`;
      }

      // 47. Configurar el cuerpo de la petición para análisis
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: context // 48. Usar el contexto construido como prompt
              }
            ]
          }
        ],
        // 49. Configuración para respuesta más creativa y detallada
        generationConfig: {
          temperature: 0.7,      // 50. Mayor creatividad para análisis
          topK: 40,             // 51. Más opciones para variedad
          topP: 0.95,           // 52. Alta diversidad en respuestas
          maxOutputTokens: 2000, // 53. Límite alto para análisis completo
        }
      };

      // 54. Petición HTTP a Gemini para generar análisis
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody) // 55. Convertir a JSON
      });

      // 56. Verificar si la petición fue exitosa
      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
      }

      // 57. Convertir respuesta a objeto TypeScript
      const data: GeminiResponse = await response.json();
      
      // 58. Verificar si hay una respuesta válida de análisis
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text; // 59. Retornar el análisis generado
      } else {
        throw new Error('Respuesta inválida de la API'); // 60. Error si no hay respuesta válida
      }
    } catch (error) {
      // 61. Log de error y mostrar toast al usuario
      console.error('Error al generar análisis con Gemini:', error);
      toast({
        title: "Error de IA",
        description: "No se pudo generar el análisis completo",
        variant: "destructive"
      });
      
      // 62. Mensaje de fallback cuando falla el análisis
      return `**🤖 Análisis de Maverlang-AI**

Hubo un problema técnico con el análisis de IA, pero los datos financieros están disponibles arriba.

**💡 Recomendación:** Inténtalo de nuevo en unos momentos.

**⚠️ Nota:** Consulta siempre con un asesor financiero profesional antes de tomar decisiones de inversión.`;
    } finally {
      setIsGenerating(false); // 63. Marcar que la IA terminó de generar
    }
  };

  // 64. Retornar las funciones y estado para uso en componentes
  return {
    analyzeFinancialData,
    extractSymbolsWithAI,
    isGenerating
  };
};
