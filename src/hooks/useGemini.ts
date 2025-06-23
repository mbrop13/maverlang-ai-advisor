
import { useState } from 'react'; // 1
import { useToast } from '@/hooks/use-toast'; // 2

interface GeminiResponse { // 3
  candidates: Array<{ // 4
    content: { // 5
      parts: Array<{ // 6
        text: string; // 7
      }>; // 8
    }; // 9
  }>; // 10
} // 11

export const useGemini = () => { // 12
  const [isGenerating, setIsGenerating] = useState(false); // 13
  const { toast } = useToast(); // 14
  
  const apiKey = "AIzaSyBTjEoZrwh9LiDFKghBNMBzk_9eaYVJW3o"; // 15
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`; // 16

  const extractSymbolsWithAI = async (userMessage: string): Promise<string[]> => { // 17
    try { // 18
      const requestBody = { // 19
        contents: [ // 20
          { // 21
            parts: [ // 22
              { // 23
                text: `Analiza el siguiente mensaje del usuario y extrae ÚNICAMENTE los símbolos bursátiles (tickers) válidos de empresas que cotizan en bolsa. // 24

REGLAS ESTRICTAS: // 25
1. Solo devuelve símbolos de empresas reales que cotizan en bolsa (AAPL, MSFT, TSLA, GOOGL, AMZN, META, NVDA, etc.) // 26
2. NO incluyas palabras comunes como "sobre", "de", "dame", "información", "análisis", "empresa", etc. // 27
3. Si se menciona el nombre de una empresa conocida, devuelve su símbolo oficial: // 28
   - Apple → AAPL // 29
   - Microsoft → MSFT   // 30
   - Tesla → TSLA // 31
   - Google/Alphabet → GOOGL // 32
   - Amazon → AMZN // 33
   - Meta/Facebook → META // 34
   - Nvidia → NVDA // 35
   - Netflix → NFLX // 36
4. Máximo 3 símbolos por respuesta // 37
5. Si no encuentras símbolos válidos, devuelve una lista vacía // 38
6. Responde SOLO con los símbolos separados por comas, sin explicaciones // 39

Mensaje del usuario: "${userMessage}" // 40

Ejemplos: // 41
- "información sobre Apple" → "AAPL" // 42
- "análisis de Tesla y Microsoft" → "TSLA,MSFT" // 43
- "dame datos sobre la empresa" → "" // 44
- "cómo está NIO hoy" → "NIO"` // 45
              } // 46
            ] // 47
          } // 48
        ], // 49
        generationConfig: { // 50
          temperature: 0.1, // 51
          topK: 1, // 52
          topP: 0.1, // 53
          maxOutputTokens: 50, // 54
        } // 55
      }; // 56

      const response = await fetch(apiUrl, { // 57
        method: 'POST', // 58
        headers: { // 59
          'Content-Type': 'application/json', // 60
        }, // 61
        body: JSON.stringify(requestBody) // 62
      }); // 63

      if (!response.ok) { // 64
        throw new Error(`Error de API: ${response.status}`); // 65
      } // 66

      const data: GeminiResponse = await response.json(); // 67
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) { // 68
        const extractedText = data.candidates[0].content.parts[0].text.trim(); // 69
        
        // Si la respuesta está vacía o es muy corta, no hay símbolos válidos // 70
        if (!extractedText || extractedText.length < 2) { // 71
          return []; // 72
        } // 73
        
        // Filtrar y validar símbolos // 74
        const symbols = extractedText // 75
          .split(',') // 76
          .map(s => s.trim().toUpperCase()) // 77
          .filter(s => { // 78
            // Solo símbolos de 1-5 caracteres que no sean palabras comunes // 79
            const commonWords = ['SOBRE', 'DE', 'DAME', 'INFO', 'ANALISIS', 'EMPRESA', 'DATOS', 'HOY']; // 80
            return s.length >= 1 && s.length <= 5 && !commonWords.includes(s) && /^[A-Z]+$/.test(s); // 81
          }) // 82
          .slice(0, 3); // Máximo 3 símbolos // 83
        
        console.log('Símbolos extraídos por IA:', symbols); // 84
        return symbols; // 85
      } // 86
      
      return []; // 87
    } catch (error) { // 88
      console.error('Error extrayendo símbolos con IA:', error); // 89
      return []; // 90
    } // 91
  }; // 92

  const analyzeFinancialData = async (userMessage: string, financialData: any[]) => { // 93
    setIsGenerating(true); // 94
    
    try { // 95
      let context = `Eres Maverlang-AI, un asesor financiero experto y profesional especializado en análisis de mercados. // 96

CONSULTA DEL USUARIO: "${userMessage}" // 97

`; // 98

      if (financialData.length > 0) { // 99
        context += `DATOS FINANCIEROS DISPONIBLES: // 100
${financialData.map(data => `
**${data.symbol} - ${data.name}:** // 101
- Precio actual: $${data.price?.toFixed(2)} // 102
- Cambio diario: ${data.change > 0 ? '+' : ''}${data.change?.toFixed(2)} (${data.changesPercentage?.toFixed(2)}%) // 103
- Ratio P/E: ${data.pe || 'N/A'} // 104
- Ganancias por acción (EPS): $${data.eps || 'N/A'} // 105
- Capitalización de mercado: $${(data.marketCap / 1e9)?.toFixed(2)}B // 106
- Sector: ${data.sector || 'N/A'} // 107
- Industria: ${data.industry || 'N/A'} // 108
`).join('')} // 109

INSTRUCCIONES DE ANÁLISIS: // 110
Proporciona un análisis financiero completo y profesional que incluya: // 111

1. **Resumen Ejecutivo**: Visión general de las empresas analizadas // 112
2. **Análisis Técnico**: Interpretación de precios, tendencias y momentum // 113
3. **Análisis Fundamental**: Evaluación de métricas como P/E, EPS, capitalización // 114
4. **Evaluación Sectorial**: Contexto de la industria y sector // 115
5. **Comparativa**: Si hay múltiples acciones, compararlas detalladamente // 116
6. **Recomendaciones**: Sugerencias de inversión basadas en perfil conservador a moderado // 117
7. **Gestión de Riesgo**: Factores de riesgo importantes a considerar // 118
8. **Perspectiva Temporal**: Análisis a corto, medio y largo plazo // 119

Usa un lenguaje profesional pero accesible. Incluye emojis apropiados para hacer el análisis más visual y fácil de leer.`; // 120
      } else { // 121
        context += `No se encontraron datos financieros específicos para la consulta. // 122

Por favor: // 123
1. Proporciona información educativa general sobre el tema consultado // 124
2. Explica conceptos financieros relevantes // 125
3. Sugiere cómo el usuario podría obtener la información que busca // 126
4. Ofrece consejos generales de inversión responsable // 127

Mantén un tono profesional y educativo.`; // 128
      } // 129

      const requestBody = { // 130
        contents: [ // 131
          { // 132
            parts: [ // 133
              { // 134
                text: context // 135
              } // 136
            ] // 137
          } // 138
        ], // 139
        generationConfig: { // 140
          temperature: 0.7, // 141
          topK: 40, // 142
          topP: 0.95, // 143
          maxOutputTokens: 3000, // 144
        } // 145
      }; // 146

      const response = await fetch(apiUrl, { // 147
        method: 'POST', // 148
        headers: { // 149
          'Content-Type': 'application/json', // 150
        }, // 151
        body: JSON.stringify(requestBody) // 152
      }); // 153

      if (!response.ok) { // 154
        throw new Error(`Error de API: ${response.status}`); // 155
      } // 156

      const data: GeminiResponse = await response.json(); // 157
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) { // 158
        return data.candidates[0].content.parts[0].text; // 159
      } else { // 160
        throw new Error('Respuesta inválida de la API'); // 161
      } // 162
    } catch (error) { // 163
      console.error('Error al generar análisis con Gemini:', error); // 164
      toast({ // 165
        title: "Error de IA", // 166
        description: "No se pudo generar el análisis. Los datos financieros están disponibles.", // 167
        variant: "destructive" // 168
      }); // 169
      
      return `**🤖 Análisis de Maverlang-AI** // 170

Hubo un problema técnico con el análisis de IA, pero los datos financieros se obtuvieron correctamente. // 171

**📊 Datos disponibles para análisis:** // 172
${financialData.map(item => { // 173
        const changeIcon = item.change > 0 ? '📈' : '📉'; // 174
        return `• **${item.symbol} (${item.name})**: $${item.price?.toFixed(2)} ${changeIcon} ${item.changesPercentage?.toFixed(2)}%`; // 175
      }).join('\n')} // 176

**💡 Recomendación:** Por favor, inténtalo de nuevo en unos momentos para obtener el análisis completo con IA. // 177

**⚠️ Nota importante:** Siempre consulta con un asesor financiero profesional antes de tomar decisiones de inversión importantes.`; // 178
    } finally { // 179
      setIsGenerating(false); // 180
    } // 181
  }; // 182

  return { // 183
    analyzeFinancialData, // 184
    extractSymbolsWithAI, // 185
    isGenerating // 186
  }; // 187
}; // 188
