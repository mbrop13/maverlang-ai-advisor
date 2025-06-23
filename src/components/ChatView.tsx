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
  // 1. Estado para almacenar todos los mensajes del chat
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  // 2. Estado para el mensaje que está escribiendo el usuario
  const [inputMessage, setInputMessage] = useState('');
  // 3. ID único para identificar la conversación actual
  const [conversationId, setConversationId] = useState<string | null>(null);
  // 4. Referencia para hacer scroll automático al final
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 5. Hook personalizado para obtener datos financieros
  const { fetchFinancialData } = useFinancialData();
  // 6. Hook personalizado para análisis con IA
  const { analyzeFinancialData, extractSymbolsWithAI, isGenerating } = useGemini();
  // 7. Hook para mostrar notificaciones
  const { toast } = useToast();

  // 8. Función para hacer scroll automático al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 9. Efecto que se ejecuta cada vez que cambian los mensajes
  useEffect(() => {
    scrollToBottom(); // 10. Hacer scroll al final cuando hay nuevos mensajes
  }, [messages]);

  // 11. Función para iniciar una nueva conversación
  const startNewConversation = () => {
    setMessages([INITIAL_MESSAGE]); // 12. Resetear mensajes al mensaje inicial
    setConversationId(null);        // 13. Limpiar ID de conversación
    updateAppState({                // 14. Actualizar estado global
      currentConversation: null
    });
    toast({                        // 15. Mostrar notificación de éxito
      title: "Nueva conversación iniciada",
      description: "Puedes comenzar a hacer nuevas consultas.",
    });
  };

  // 16. Función principal que maneja el envío de mensajes
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // 17. Prevenir recarga de página
    
    // 18. Validar que hay mensaje y que la IA no está generando
    if (!inputMessage.trim() || isGenerating) return;
    
    // 19. Verificar límite diario de uso
    if (appState.dailyUsage >= appState.maxDailyUsage) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite diario de consultas.",
        variant: "destructive"
      });
      return; // 20. Salir si se alcanzó el límite
    }

    // 21. Guardar mensaje del usuario y limpiar input
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // 22. Crear nueva conversación si no existe
    if (!conversationId) {
      const newConversationId = Date.now().toString(); // 23. ID único basado en timestamp
      setConversationId(newConversationId);           // 24. Guardar ID
      updateAppState({                                // 25. Actualizar estado global
        currentConversation: newConversationId
      });
    }
    
    // 26. Crear objeto del mensaje del usuario
    const newUserMessage = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    // 27. Agregar mensaje del usuario al chat
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // === PASO 1: EXTRACCIÓN DE SÍMBOLOS ===
      // 28. Log para debug del paso 1
      console.log('🔍 PASO 1: Extrayendo símbolos para:', userMessage);
      // 29. Usar IA para extraer símbolos bursátiles del mensaje
      const symbols = await extractSymbolsWithAI(userMessage);
      // 30. Log para debug - símbolos encontrados
      console.log('✅ Símbolos extraídos:', symbols);
      
      // 31. Inicializar array para datos financieros
      let financialData: any[] = [];
      
      // === PASO 2: OBTENCIÓN DE DATOS FINANCIEROS ===
      // 32. Solo buscar datos si se encontraron símbolos
      if (symbols.length > 0) {
        // 33. Log para debug del paso 2
        console.log('📊 PASO 2: Obteniendo datos financieros para:', symbols);
        // 34. Obtener datos financieros reales de la API
        financialData = await fetchFinancialData(symbols);
        // 35. Log para debug - datos obtenidos
        console.log('✅ Datos obtenidos:', financialData);
        
        // 36. Crear mensaje con los datos financieros para mostrar al usuario
        const financialDataMessage = {
          id: Date.now().toString() + '_data',
          content: formatFinancialData(financialData), // 37. Formatear datos para display
          isUser: false,
          timestamp: new Date(),
          financialData,  // 38. Guardar datos raw para TradingView
          symbols        // 39. Guardar símbolos para TradingView
        };
        
        // 40. Mostrar datos financieros al usuario
        setMessages(prev => [...prev, financialDataMessage]);
        // 41. Pausa breve para mejor UX
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // === PASO 3: MOSTRAR INDICADOR DE PROCESAMIENTO ===
      // 42. Crear mensaje temporal de "pensando"
      const analysisThinkingMessage = {
        id: 'analysis_thinking',
        content: '',
        isUser: false,
        timestamp: new Date(),
        isThinking: true // 43. Flag para mostrar animación de carga
      };
      
      // 44. Mostrar indicador de que la IA está trabajando
      setMessages(prev => [...prev, analysisThinkingMessage]);
      
      // === PASO 4: GENERACIÓN DE ANÁLISIS CON IA ===
      // 45. Log para debug del paso 3
      console.log('🤖 PASO 3: Generando análisis con IA...');
      // 46. Generar análisis pasando mensaje original Y datos financieros
      const aiAnalysis = await analyzeFinancialData(userMessage, financialData);
      // 47. Log para debug - análisis completado
      console.log('✅ Análisis generado');
      
      // === PASO 5: MOSTRAR ANÁLISIS FINAL ===
      // 48. Remover mensaje de "pensando" y agregar análisis final
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'analysis_thinking'); // 49. Quitar mensaje temporal
        return [...filtered, {
          id: Date.now().toString() + '_analysis',
          content: aiAnalysis, // 50. Contenido del análisis generado
          isUser: false,
          timestamp: new Date()
        }];
      });
      
      // 51. Incrementar contador de uso diario
      updateAppState({
        dailyUsage: appState.dailyUsage + 1
      });
      
    } catch (error) {
      // 52. Log de error en el proceso completo
      console.error('❌ Error en el proceso:', error);
      
      // 53. Remover mensaje de "pensando" y mostrar error
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'analysis_thinking');
        return [...filtered, {
          id: Date.now().toString(),
          content: 'Lo siento, hubo un error procesando tu consulta. Por favor, inténtalo de nuevo.',
          isUser: false,
          timestamp: new Date()
        }];
      });
      
      // 54. Mostrar notificación de error al usuario
      toast({
        title: "Error",
        description: "Hubo un problema procesando tu consulta.",
        variant: "destructive"
      });
    }
  };

  // 55. Función para formatear datos financieros como texto markdown
  const formatFinancialData = (data: any[]) => {
    // 56. Retornar mensaje si no hay datos
    if (!data.length) return "No se encontraron datos financieros para los símbolos solicitados.";
    
    // 57. Iniciar contenido con encabezado
    let content = "## 📊 **Datos Financieros en Tiempo Real**\n\n";
    
    // 58. Iterar cada empresa y formatear sus datos
    data.forEach(item => {
      // 59. Seleccionar emoji según si subió o bajó
      const changeIcon = item.change > 0 ? '📈' : '📉';
      
      // 60. Agregar título de la empresa
      content += `### **${item.symbol} - ${item.name}**\n`;
      // 61. Agregar precio actual
      content += `💰 **Precio Actual:** $${item.price?.toFixed(2) || 'N/A'}\n`;
      // 62. Agregar cambio diario con signo
      content += `${changeIcon} **Cambio Diario:** ${item.change > 0 ? '+' : ''}${item.change?.toFixed(2) || 'N/A'} (${item.changesPercentage?.toFixed(2) || 'N/A'}%)\n`;
      
      // 63-69. Agregar métricas adicionales si están disponibles
      if (item.pe) content += `📊 **Ratio P/E:** ${item.pe.toFixed(2)}\n`;
      if (item.eps) content += `💵 **EPS:** $${item.eps.toFixed(2)}\n`;
      if (item.marketCap) content += `🏢 **Capitalización:** $${(item.marketCap / 1e9).toFixed(2)}B\n`;
      if (item.sector) content += `🏭 **Sector:** ${item.sector}\n`;
      if (item.industry) content += `🔧 **Industria:** ${item.industry}\n`;
      if (item.beta) content += `📈 **Beta:** ${item.beta.toFixed(2)}\n`;
      
      content += `\n`; // 70. Salto de línea entre empresas
    });
    
    // 71. Agregar nota sobre la fuente de datos
    content += `*Datos obtenidos en tiempo real*\n`;
    
    return content; // 72. Retornar contenido formateado
  };

  // 73. Calcular si está cerca del límite diario
  const isNearLimit = appState.dailyUsage >= appState.maxDailyUsage * 0.8;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

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
