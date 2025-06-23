
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TradingViewWidget } from './TradingViewWidget';
import { User, Bot, Sparkles, TrendingUp } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  financialData?: any[];
  symbols?: string[];
  isThinking?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/###\s(.*?)(?=<br>|$)/g, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
      .replace(/##\s(.*?)(?=<br>|$)/g, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/•\s/g, '• ');
  };

  if (message.isThinking) {
    return (
      <div className="flex items-start gap-4 max-w-3xl">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <Card className="flex-1 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-blue-700 font-medium">
              Maverlang-AI está procesando tu consulta...
            </span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${message.isUser ? 'justify-end' : ''} max-w-none`}>
      {!message.isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`flex-1 max-w-4xl ${message.isUser ? 'flex justify-end' : ''}`}>
        <Card className={`p-6 shadow-md hover:shadow-lg transition-shadow ${
          message.isUser 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white max-w-2xl' 
            : 'bg-white border-gray-200'
        }`}>
          {!message.isUser && message.financialData && (
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Datos Financieros</span>
              <div className="flex gap-1">
                {message.symbols?.map((symbol) => (
                  <Badge key={symbol} variant="outline" className="text-xs">
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div 
            className={`prose max-w-none ${message.isUser ? 'text-white prose-invert' : 'text-gray-900'}`}
            dangerouslySetInnerHTML={{ 
              __html: formatContent(message.content) 
            }}
          />
          
          {message.symbols && message.symbols.length > 0 && (
            <TradingViewWidget symbols={message.symbols} />
          )}
          
          <div className={`text-xs mt-4 pt-3 border-t ${
            message.isUser 
              ? 'text-blue-100 border-blue-400' 
              : 'text-gray-500 border-gray-200'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </Card>
      </div>
      
      {message.isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};
