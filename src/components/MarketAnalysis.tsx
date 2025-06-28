
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useGemini } from '@/hooks/useGemini';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: number;
  isPositive: boolean;
}

interface MarketAnalysisProps {
  marketIndices: MarketData[];
  marketData: any[];
}

export const MarketAnalysis = ({ marketIndices, marketData }: MarketAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { analyzeFinancialData, isGenerating } = useGemini();
  const { toast } = useToast();

  const generateMarketAnalysis = async () => {
    try {
      console.log('🧠 Generando análisis de mercado con IA...');
      
      // Preparar el contexto del mercado
      const marketContext = `Analiza el estado actual del mercado financiero basándote en estos datos:

ÍNDICES PRINCIPALES:
${marketIndices.map(index => `
- ${index.name}: ${index.value} (${index.change}, ${index.changePercent.toFixed(2)}%)
`).join('')}

ACCIONES INDIVIDUALES:
${marketData.map(stock => `
- ${stock.symbol} (${stock.name}): $${stock.price} (${stock.change > 0 ? '+' : ''}${stock.change}, ${stock.changesPercentage}%)
`).join('')}

Por favor proporciona un análisis completo que incluya:
1. Resumen del sentimiento general del mercado
2. Análisis de los índices principales
3. Sectores con mejor y peor rendimiento
4. Recomendaciones generales
5. Factores a monitorear`;

      const aiAnalysis = await analyzeFinancialData(marketContext, marketData);
      setAnalysis(aiAnalysis);
      setShowAnalysis(true);
      
      toast({
        title: "Análisis completado",
        description: "El análisis de mercado ha sido generado exitosamente",
      });

    } catch (error) {
      console.error('❌ Error generando análisis:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el análisis de mercado",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 bg-white shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Análisis de Mercado con IA</h3>
        </div>
        <Button
          onClick={generateMarketAnalysis}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generar Análisis
            </>
          )}
        </Button>
      </div>

      {!showAnalysis && !isGenerating && (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Análisis Inteligente del Mercado</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Haz clic en "Generar Análisis" para obtener un análisis completo del estado actual del mercado usando IA avanzada.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Análisis de Tendencias
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Recomendaciones
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Factores de Riesgo
            </Badge>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600 animate-bounce" />
            </div>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Analizando el mercado...</h4>
          <p className="text-gray-600">La IA está procesando los datos del mercado para generar insights valiosos.</p>
        </div>
      )}

      {showAnalysis && analysis && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-800">Análisis Generado por IA</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              {analysis.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <Button
            onClick={() => setShowAnalysis(false)}
            variant="outline"
            className="w-full"
          >
            Generar Nuevo Análisis
          </Button>
        </div>
      )}
    </Card>
  );
};
