
import React from 'react'; // 1
import { Card } from '@/components/ui/card'; // 2
import { Avatar } from '@/components/ui/avatar'; // 3
import { Badge } from '@/components/ui/badge'; // 4
import { TradingViewWidget } from './TradingViewWidget'; // 5
import { User, Bot, Sparkles, TrendingUp } from 'lucide-react'; // 6

interface Message { // 7
  id: string; // 8
  content: string; // 9
  isUser: boolean; // 10
  timestamp: Date; // 11
  financialData?: any[]; // 12
  symbols?: string[]; // 13
  isThinking?: boolean; // 14
} // 15

interface ChatMessageProps { // 16
  message: Message; // 17
} // 18

export const ChatMessage = ({ message }: ChatMessageProps) => { // 19
  const formatContent = (content: string) => { // 20
    return content // 21
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 22
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // 23
      .replace(/\n/g, '<br>') // 24
      .replace(/###\s(.*?)(?=<br>|$)/g, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>') // 25
      .replace(/##\s(.*?)(?=<br>|$)/g, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>') // 26
      .replace(/•\s/g, '• '); // 27
  }; // 28

  if (message.isThinking) { // 29
    return ( // 30
      <div className="flex items-start gap-4 max-w-3xl"> {/* 31 */}
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md"> {/* 32 */}
          <Sparkles className="w-5 h-5 text-white animate-pulse" /> {/* 33 */}
        </div> {/* 34 */}
        <Card className="flex-1 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md"> {/* 35 */}
          <div className="flex items-center gap-3"> {/* 36 */}
            <div className="flex gap-1"> {/* 37 */}
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div> {/* 38 */}
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div> {/* 39 */}
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div> {/* 40 */}
            </div> {/* 41 */}
            <span className="text-blue-700 font-medium"> {/* 42 */}
              Maverlang-AI está procesando tu consulta... {/* 43 */}
            </span> {/* 44 */}
          </div> {/* 45 */}
        </Card> {/* 46 */}
      </div> {/* 47 */}
    ); // 48
  } // 49

  return ( // 50
    <div className={`flex gap-4 ${message.isUser ? 'justify-end' : ''} max-w-none`}> {/* 51 */}
      {!message.isUser && ( // 52
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md"> {/* 53 */}
          <Bot className="w-5 h-5 text-white" /> {/* 54 */}
        </div> {/* 55 */}
      )} {/* 56 */}
      
      <div className={`flex-1 max-w-4xl ${message.isUser ? 'flex justify-end' : ''}`}> {/* 57 */}
        <Card className={`p-6 shadow-md hover:shadow-lg transition-shadow ${ // 58
          message.isUser  // 59
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white max-w-2xl'  // 60
            : 'bg-white border-gray-200' // 61
        }`}> {/* 62 */}
          {!message.isUser && message.financialData && ( // 63
            <div className="mb-4 flex items-center gap-2"> {/* 64 */}
              <TrendingUp className="w-4 h-4 text-blue-600" /> {/* 65 */}
              <span className="text-sm font-medium text-blue-700">Datos Financieros</span> {/* 66 */}
              <div className="flex gap-1"> {/* 67 */}
                {message.symbols?.map((symbol) => ( // 68
                  <Badge key={symbol} variant="outline" className="text-xs"> {/* 69 */}
                    {symbol} {/* 70 */}
                  </Badge> // 71
                ))} {/* 72 */}
              </div> {/* 73 */}
            </div> {/* 74 */}
          )} {/* 75 */}
          
          <div  // 76
            className={`prose max-w-none ${message.isUser ? 'text-white prose-invert' : 'text-gray-900'}`} // 77
            dangerouslySetInnerHTML={{  // 78
              __html: formatContent(message.content)  // 79
            }} // 80
          /> {/* 81 */}
          
          {message.symbols && message.symbols.length > 0 && ( // 82
            <TradingViewWidget symbols={message.symbols} /> // 83
          )} {/* 84 */}
          
          <div className={`text-xs mt-4 pt-3 border-t ${ // 85
            message.isUser  // 86
              ? 'text-blue-100 border-blue-400'  // 87
              : 'text-gray-500 border-gray-200' // 88
          }`}> {/* 89 */}
            {message.timestamp.toLocaleTimeString()} {/* 90 */}
          </div> {/* 91 */}
        </Card> {/* 92 */}
      </div> {/* 93 */}
      
      {message.isUser && ( // 94
        <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md"> {/* 95 */}
          <User className="w-5 h-5 text-white" /> {/* 96 */}
        </div> {/* 97 */}
      )} {/* 98 */}
    </div> {/* 99 */}
  ); // 100
}; // 101
