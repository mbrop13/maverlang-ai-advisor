
import React, { useState, useRef, useEffect } from 'react'; // 1
import { Button } from '@/components/ui/button'; // 2
import { Input } from '@/components/ui/input'; // 3
import { Card } from '@/components/ui/card'; // 4
import { Alert, AlertDescription } from '@/components/ui/alert'; // 5
import { ChatMessage } from './ChatMessage'; // 6
import { useFinancialData } from '../hooks/useFinancialData'; // 7
import { useGemini } from '../hooks/useGemini'; // 8
import { useToast } from '@/hooks/use-toast'; // 9
import { Send, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react'; // 10

interface ChatViewProps { // 11
  appState: any; // 12
  updateAppState: (updates: any) => void; // 13
} // 14

const INITIAL_MESSAGE = { // 15
  id: '1', // 16
  content: `¡Hola! Soy **Maverlang-AI**, tu asesor financiero personal potenciado por IA avanzada. // 17

## 🚀 ¿En qué puedo ayudarte? // 18

💹 **Análisis de Acciones:** Evaluación profunda de empresas y su rendimiento // 19
📊 **Comparativas:** Análisis detallado entre diferentes inversiones   // 20
📈 **Datos en Tiempo Real:** Información financiera actualizada al minuto // 21
🎯 **Estrategias Personalizadas:** Recomendaciones basadas en tu perfil // 22
🔍 **Análisis Técnico:** Interpretación de patrones y tendencias // 23

**Ejemplos de consultas:** // 24
- "Analiza Apple vs Microsoft" // 25
- "¿Cómo está Tesla hoy?" // 26
- "Compara tecnológicas del S&P 500" // 27
- "Dame una estrategia para invertir $10,000" // 28

¡Pregúntame lo que necesites saber sobre inversiones! 💼✨`, // 29
  isUser: false, // 30
  timestamp: new Date() // 31
}; // 32

export const ChatView = ({ appState, updateAppState }: ChatViewProps) => { // 33
  const [messages, setMessages] = useState([INITIAL_MESSAGE]); // 34
  const [inputMessage, setInputMessage] = useState(''); // 35
  const [conversationId, setConversationId] = useState<string | null>(null); // 36
  const messagesEndRef = useRef<HTMLDivElement>(null); // 37
  const { fetchFinancialData } = useFinancialData(); // 38
  const { analyzeFinancialData, extractSymbolsWithAI, isGenerating } = useGemini(); // 39
  const { toast } = useToast(); // 40

  const scrollToBottom = () => { // 41
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // 42
  }; // 43

  useEffect(() => { // 44
    scrollToBottom(); // 45
  }, [messages]); // 46

  // Handle new conversation // 47
  const startNewConversation = () => { // 48
    setMessages([INITIAL_MESSAGE]); // 49
    setConversationId(null); // 50
    updateAppState({ // 51
      currentConversation: null // 52
    }); // 53
    toast({ // 54
      title: "Nueva conversación iniciada", // 55
      description: "Puedes comenzar a hacer nuevas consultas.", // 56
    }); // 57
  }; // 58

  const handleSendMessage = async (e: React.FormEvent) => { // 59
    e.preventDefault(); // 60
    
    if (!inputMessage.trim() || isGenerating) return; // 61
    
    if (appState.dailyUsage >= appState.maxDailyUsage) { // 62
      toast({ // 63
        title: "Límite alcanzado", // 64
        description: "Has alcanzado el límite diario de consultas.", // 65
        variant: "destructive" // 66
      }); // 67
      return; // 68
    } // 69

    const userMessage = inputMessage.trim(); // 70
    setInputMessage(''); // 71
    
    // Create conversation ID if it doesn't exist // 72
    if (!conversationId) { // 73
      const newConversationId = Date.now().toString(); // 74
      setConversationId(newConversationId); // 75
      updateAppState({ // 76
        currentConversation: newConversationId // 77
      }); // 78
    } // 79
    
    const newUserMessage = { // 80
      id: Date.now().toString(), // 81
      content: userMessage, // 82
      isUser: true, // 83
      timestamp: new Date() // 84
    }; // 85
    
    setMessages(prev => [...prev, newUserMessage]); // 86

    try { // 87
      console.log('Extrayendo símbolos con IA para:', userMessage); // 88
      const symbols = await extractSymbolsWithAI(userMessage); // 89
      console.log('Símbolos extraídos por IA:', symbols); // 90
      
      let financialData: any[] = []; // 91
      if (symbols.length > 0) { // 92
        console.log('Obteniendo datos financieros para:', symbols); // 93
        financialData = await fetchFinancialData(symbols); // 94
        console.log('Datos financieros obtenidos:', financialData); // 95
        
        const financialDataMessage = { // 96
          id: Date.now().toString() + '_data', // 97
          content: formatFinancialData(financialData), // 98
          isUser: false, // 99
          timestamp: new Date(), // 100
          financialData, // 101
          symbols // 102
        }; // 103
        
        setMessages(prev => [...prev, financialDataMessage]); // 104
        await new Promise(resolve => setTimeout(resolve, 1500)); // 105
      } // 106
      
      const analysisThinkingMessage = { // 107
        id: 'analysis_thinking', // 108
        content: '', // 109
        isUser: false, // 110
        timestamp: new Date(), // 111
        isThinking: true // 112
      }; // 113
      
      setMessages(prev => [...prev, analysisThinkingMessage]); // 114
      
      const aiAnalysis = await analyzeFinancialData(userMessage, financialData); // 115
      
      setMessages(prev => { // 116
        const filtered = prev.filter(msg => msg.id !== 'analysis_thinking'); // 117
        return [...filtered, { // 118
          id: Date.now().toString() + '_analysis', // 119
          content: aiAnalysis, // 120
          isUser: false, // 121
          timestamp: new Date() // 122
        }]; // 123
      }); // 124
      
      updateAppState({ // 125
        dailyUsage: appState.dailyUsage + 1 // 126
      }); // 127
      
    } catch (error) { // 128
      console.error('Error processing message:', error); // 129
      
      setMessages(prev => { // 130
        const filtered = prev.filter(msg => msg.id !== 'analysis_thinking'); // 131
        return [...filtered, { // 132
          id: Date.now().toString(), // 133
          content: 'Lo siento, hubo un error procesando tu consulta. Por favor, inténtalo de nuevo.', // 134
          isUser: false, // 135
          timestamp: new Date() // 136
        }]; // 137
      }); // 138
      
      toast({ // 139
        title: "Error", // 140
        description: "Hubo un problema procesando tu consulta.", // 141
        variant: "destructive" // 142
      }); // 143
    } // 144
  }; // 145

  const formatFinancialData = (data: any[]) => { // 146
    if (!data.length) return "No se encontraron datos financieros para los símbolos solicitados."; // 147
    
    let content = "## 📊 **Datos Financieros Obtenidos**\n\n"; // 148
    
    data.forEach(item => { // 149
      const changeIcon = item.change > 0 ? '📈' : '📉'; // 150
      
      content += `### **${item.symbol} - ${item.name}**\n`; // 151
      content += `💰 **Precio:** $${item.price?.toFixed(2)}\n`; // 152
      content += `${changeIcon} **Cambio:** ${item.change > 0 ? '+' : ''}${item.change?.toFixed(2)} (${item.changesPercentage?.toFixed(2)}%)\n`; // 153
      content += `📊 **P/E:** ${item.pe?.toFixed(2) || 'N/A'}\n`; // 154
      content += `💵 **EPS:** $${item.eps?.toFixed(2) || 'N/A'}\n`; // 155
      content += `🏢 **Cap. Mercado:** $${(item.marketCap / 1e9)?.toFixed(2)}B\n`; // 156
      content += `🏭 **Sector:** ${item.sector || 'N/A'}\n`; // 157
      content += `🔧 **Industria:** ${item.industry || 'N/A'}\n\n`; // 158
    }); // 159
    
    return content; // 160
  }; // 161

  const isNearLimit = appState.dailyUsage >= appState.maxDailyUsage * 0.8; // 162

  return ( // 163
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white"> {/* 164 */}
      {/* Header with new conversation button */} {/* 165 */}
      <div className="border-b border-gray-200 bg-white px-6 py-3"> {/* 166 */}
        <div className="max-w-4xl mx-auto flex justify-between items-center"> {/* 167 */}
          <h2 className="text-lg font-semibold text-gray-800">Chat con Maverlang-AI</h2> {/* 168 */}
          <Button // 169
            onClick={startNewConversation} // 170
            variant="outline" // 171
            size="sm" // 172
            className="flex items-center gap-2" // 173
          > {/* 174 */}
            <RefreshCw className="w-4 h-4" /> {/* 175 */}
            Nueva Conversación {/* 176 */}
          </Button> {/* 177 */}
        </div> {/* 178 */}
      </div> {/* 179 */}

      {/* Messages Area */} {/* 180 */}
      <div className="flex-1 overflow-y-auto"> {/* 181 */}
        <div className="max-w-4xl mx-auto p-6 space-y-6"> {/* 182 */}
          {messages.map((message) => ( // 183
            <ChatMessage key={message.id} message={message} /> // 184
          ))} {/* 185 */}
          <div ref={messagesEndRef} /> {/* 186 */}
        </div> {/* 187 */}
      </div> {/* 188 */}

      {/* Input Area */} {/* 189 */}
      <div className="border-t border-gray-200 bg-white shadow-lg"> {/* 190 */}
        <div className="max-w-4xl mx-auto p-6"> {/* 191 */}
          {isNearLimit && ( // 192
            <Alert className="mb-4 border-amber-200 bg-amber-50"> {/* 193 */}
              <AlertTriangle className="h-4 w-4 text-amber-600" /> {/* 194 */}
              <AlertDescription className="text-amber-800"> {/* 195 */}
                ⚠️ Te quedan pocas consultas para hoy. Úsalas sabiamente. {/* 196 */}
              </AlertDescription> {/* 197 */}
            </Alert> {/* 198 */}
          )} {/* 199 */}
          
          <form onSubmit={handleSendMessage} className="flex gap-3"> {/* 200 */}
            <div className="flex-1 relative"> {/* 201 */}
              <Input // 202
                value={inputMessage} // 203
                onChange={(e) => setInputMessage(e.target.value)} // 204
                placeholder="Pregunta sobre análisis financiero, compara acciones..." // 205
                className="pr-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl" // 206
                disabled={isGenerating || appState.dailyUsage >= appState.maxDailyUsage} // 207
                maxLength={500} // 208
              /> {/* 209 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400"> {/* 210 */}
                {inputMessage.length}/500 {/* 211 */}
              </div> {/* 212 */}
            </div> {/* 213 */}
            <Button  // 214
              type="submit" // 215
              disabled={isGenerating || !inputMessage.trim() || appState.dailyUsage >= appState.maxDailyUsage} // 216
              className="px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200" // 217
            > {/* 218 */}
              {isGenerating ? ( // 219
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> // 220
              ) : ( // 221
                <Send className="w-5 h-5" /> // 222
              )} {/* 223 */}
            </Button> {/* 224 */}
          </form> {/* 225 */}
          
          {isGenerating && ( // 226
            <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"> {/* 227 */}
              <div className="flex items-center gap-2"> {/* 228 */}
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /> {/* 229 */}
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> {/* 230 */}
              </div> {/* 231 */}
              <span className="text-blue-700 font-medium"> {/* 232 */}
                Maverlang-AI está analizando con IA avanzada... {/* 233 */}
              </span> {/* 234 */}
            </div> {/* 235 */}
          )} {/* 236 */}
        </div> {/* 237 */}
      </div> {/* 238 */}
    </div> {/* 239 */}
  ); // 240
}; // 241
