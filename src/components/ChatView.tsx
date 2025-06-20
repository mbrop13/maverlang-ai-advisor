
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatMessage } from './ChatMessage';
import { useFinancialData } from '../hooks/useFinancialData';
import { useGemini } from '../hooks/useGemini';
import { useToast } from '@/hooks/use-toast';
import { Send, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface ChatViewProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

const INITIAL_MESSAGE = {
  id: '1',
  content: `¡Hola! Soy **Maverlang-AI**, tu asesor financiero personal potenciado por IA avanzada. 

## 🚀 ¿En qué puedo ayudarte?

💹 **Análisis de Acciones:** Evaluación profunda de empresas y su rendimiento
📊 **Comparativas:** Análisis detallado entre diferentes inversiones  
📈 **Datos en Tiempo Real:** Información financiera actualizada al minuto
🎯 **Estrategias Personalizadas:** Recomendaciones basadas en tu perfil
🔍 **Análisis Técnico:** Interpretación de patrones y tendencias

**Ejemplos de consultas:**
- "Analiza Apple vs Microsoft"
- "¿Cómo está Tesla hoy?"
- "Compara tecnológicas del S&P 500"
- "Dame una estrategia para invertir $10,000"

¡Pregúntame lo que necesites saber sobre inversiones! 💼✨`,
  isUser: false,
  timestamp: new Date()
};

export const ChatView = ({ appState, updateAppState }: ChatViewProps) => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { fetchFinancialData } = useFinancialData();
  const { analyzeFinancialData, extractSymbolsWithAI, isGenerating } = useGemini();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new conversation
  const startNewConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
    updateAppState({
      currentConversation: null
    });
    toast({
      title: "Nueva conversación iniciada",
      description: "Puedes comenzar a hacer nuevas consultas.",
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isGenerating) return;
    
    if (appState.dailyUsage >= appState.maxDailyUsage) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite diario de consultas.",
        variant: "destructive"
      });
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Create conversation ID if it doesn't exist
    if (!conversationId) {
      const newConversationId = Date.now().toString();
      setConversationId(newConversationId);
      updateAppState({
        currentConversation: newConversationId
      });
    }
    
    const newUserMessage = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      console.log('Extrayendo símbolos con IA para:', userMessage);
      const symbols = await extractSymbolsWithAI(userMessage);
      console.log('Símbolos extraídos por IA:', symbols);
      
      let financialData: any[] = [];
      if (symbols.length > 0) {
        console.log('Obteniendo datos financieros para:', symbols);
        financialData = await fetchFinancialData(symbols);
        console.log('Datos financieros obtenidos:', financialData);
        
        const financialDataMessage = {
          id: Date.now().toString() + '_data',
          content: formatFinancialData(financialData),
          isUser: false,
          timestamp: new Date(),
          financialData,
          symbols
        };
        
        setMessages(prev => [...prev, financialDataMessage]);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      const analysisThinkingMessage = {
        id: 'analysis_thinking',
        content: '',
        isUser: false,
        timestamp: new Date(),
        isThinking: true
      };
      
      setMessages(prev => [...prev, analysisThinkingMessage]);
      
      const aiAnalysis = await analyzeFinancialData(userMessage, financialData);
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'analysis_thinking');
        return [...filtered, {
          id: Date.now().toString() + '_analysis',
          content: aiAnalysis,
          isUser: false,
          timestamp: new Date()
        }];
      });
      
      updateAppState({
        dailyUsage: appState.dailyUsage + 1
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'analysis_thinking');
        return [...filtered, {
          id: Date.now().toString(),
          content: 'Lo siento, hubo un error procesando tu consulta. Por favor, inténtalo de nuevo.',
          isUser: false,
          timestamp: new Date()
        }];
      });
      
      toast({
        title: "Error",
        description: "Hubo un problema procesando tu consulta.",
        variant: "destructive"
      });
    }
  };

  const formatFinancialData = (data: any[]) => {
    if (!data.length) return "No se encontraron datos financieros para los símbolos solicitados.";
    
    let content = "## 📊 **Datos Financieros Obtenidos**\n\n";
    
    data.forEach(item => {
      const changeIcon = item.change > 0 ? '📈' : '📉';
      
      content += `### **${item.symbol} - ${item.name}**\n`;
      content += `💰 **Precio:** $${item.price?.toFixed(2)}\n`;
      content += `${changeIcon} **Cambio:** ${item.change > 0 ? '+' : ''}${item.change?.toFixed(2)} (${item.changesPercentage?.toFixed(2)}%)\n`;
      content += `📊 **P/E:** ${item.pe?.toFixed(2) || 'N/A'}\n`;
      content += `💵 **EPS:** $${item.eps?.toFixed(2) || 'N/A'}\n`;
      content += `🏢 **Cap. Mercado:** $${(item.marketCap / 1e9)?.toFixed(2)}B\n`;
      content += `🏭 **Sector:** ${item.sector || 'N/A'}\n`;
      content += `🔧 **Industria:** ${item.industry || 'N/A'}\n\n`;
    });
    
    return content;
  };

  const isNearLimit = appState.dailyUsage >= appState.maxDailyUsage * 0.8;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header with new conversation button */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Chat con Maverlang-AI</h2>
          <Button
            onClick={startNewConversation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Nueva Conversación
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          {isNearLimit && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                ⚠️ Te quedan pocas consultas para hoy. Úsalas sabiamente.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre análisis financiero, compara acciones..."
                className="pr-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                disabled={isGenerating || appState.dailyUsage >= appState.maxDailyUsage}
                maxLength={500}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                {inputMessage.length}/500
              </div>
            </div>
            <Button 
              type="submit"
              disabled={isGenerating || !inputMessage.trim() || appState.dailyUsage >= appState.maxDailyUsage}
              className="px-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          
          {isGenerating && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <span className="text-blue-700 font-medium">
                Maverlang-AI está analizando con IA avanzada...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
