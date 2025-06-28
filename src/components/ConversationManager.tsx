
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Clock
} from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage: string;
  messageCount: number;
}

interface ConversationManagerProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export const ConversationManager = ({ 
  activeView, 
  setActiveView, 
  onNewConversation,
  onSelectConversation,
  currentConversationId 
}: ConversationManagerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Cargar conversaciones del localStorage al inicializar
  useEffect(() => {
    const savedConversations = localStorage.getItem('maverlang_conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt)
      })));
    }
  }, []);

  // Guardar conversaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('maverlang_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: `Conversación ${conversations.length + 1}`,
      createdAt: new Date(),
      lastMessage: 'Nueva conversación iniciada',
      messageCount: 0
    };

    setConversations(prev => [newConversation, ...prev]);
    onNewConversation();
    onSelectConversation(newConversation.id);
    setActiveView('chat');
  };

  const selectConversation = (conversationId: string) => {
    onSelectConversation(conversationId);
    setActiveView('chat');
    setIsExpanded(false);
  };

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // Si se elimina la conversación activa, crear una nueva
    if (currentConversationId === conversationId) {
      createNewConversation();
    }
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    ));
  };

  // Exponer función para actualizar conversaciones desde el componente padre
  React.useImperativeHandle(React.useRef(), () => ({
    updateConversation
  }));

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="relative">
      <Button
        variant={activeView === 'chat' ? "default" : "ghost"}
        className={`w-full justify-start p-4 h-auto transition-all duration-200 ${
          activeView === 'chat'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg' 
            : 'hover:bg-blue-50 hover:text-blue-700'
        }`}
        onClick={() => {
          setActiveView('chat');
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <MessageSquare className={`w-5 h-5 ${activeView === 'chat' ? 'text-white' : 'text-gray-500'}`} />
          <div className="flex-1 text-left">
            <div className={`font-medium ${activeView === 'chat' ? 'text-white' : 'text-gray-900'}`}>
              AI Assistant
            </div>
            <div className={`text-xs ${activeView === 'chat' ? 'text-blue-100' : 'text-gray-500'}`}>
              Chat con Maverlang-AI
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                createNewConversation();
              }}
              className={`p-1 h-auto ${activeView === 'chat' ? 'hover:bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
            {isExpanded ? (
              <ChevronUp className={`w-4 h-4 ${activeView === 'chat' ? 'text-white' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${activeView === 'chat' ? 'text-white' : 'text-gray-500'}`} />
            )}
          </div>
        </div>
      </Button>

      {/* Menu desplegable de conversaciones */}
      {isExpanded && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border max-h-80 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm">Conversaciones</span>
              <Button
                onClick={createNewConversation}
                size="sm"
                className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Nueva
              </Button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                    currentConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {conversation.title}
                        </h4>
                        {currentConversationId === conversation.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(conversation.createdAt)}</span>
                        </div>
                        <span>{conversation.messageCount} mensajes</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay conversaciones</p>
                <p className="text-xs mt-1">Crea tu primera conversación</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
