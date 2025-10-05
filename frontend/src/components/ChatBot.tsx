import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageCircle, Zap, Lightbulb, TrendingUp, Target, Users, DollarSign } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PredefinedQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
  category: string;
}

const predefinedQuestions: PredefinedQuestion[] = [
  {
    id: 'market-analysis',
    question: 'How do I analyze my target market?',
    icon: <Target className="w-4 h-4" />,
    category: 'Market Research'
  },
  {
    id: 'competition',
    question: 'How can I identify my competitors?',
    icon: <Users className="w-4 h-4" />,
    category: 'Competitive Analysis'
  },
  {
    id: 'funding',
    question: 'What are the key funding strategies for startups?',
    icon: <DollarSign className="w-4 h-4" />,
    category: 'Funding'
  },
  {
    id: 'validation',
    question: 'How do I validate my startup idea?',
    icon: <Lightbulb className="w-4 h-4" />,
    category: 'Idea Validation'
  },
  {
    id: 'growth',
    question: 'What are the best growth strategies for early-stage startups?',
    icon: <TrendingUp className="w-4 h-4" />,
    category: 'Growth Strategy'
  },
  {
    id: 'platform',
    question: 'How does FoundrIQ help with startup validation?',
    icon: <Zap className="w-4 h-4" />,
    category: 'Platform Features'
  }
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I\'m the FoundrIQ assistant, powered by OpenRouter. I can help you with startup validation, market analysis, and business strategy. Choose a question below or ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPredefined, setShowPredefined] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input.trim();
    if (messageToSend === '') return;
    
    const newUserMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setShowPredefined(false);
    
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            { role: 'system', content: 'You are an AI assistant for FoundrIQ, an AI-powered startup validation platform. You help users analyze and validate their startup ideas using market research, competitive benchmarking, and strategy generation. Always be helpful, concise, and focus on providing valuable insights about startup validation, market analysis, and business strategy. You are powered by OpenRouter platform and can provide expert advice on entrepreneurship and business development.' },
            ...messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-5),
            newUserMessage
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredefinedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Handle enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-96 h-[500px] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-4 text-white font-bold flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              <div>
                <h3>FoundrIQ Assistant</h3>
                <div className="flex items-center text-xs opacity-90">
                  <Zap className="w-3 h-3 mr-1" />
                  Powered by OpenRouter
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:text-blue-100 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block px-4 py-2 rounded-xl max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {showPredefined && messages.length <= 1 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                  Quick Questions:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {predefinedQuestions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => handlePredefinedQuestion(question.question)}
                      className="text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 dark:text-blue-400 mt-0.5 group-hover:scale-110 transition-transform">
                          {question.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            {question.question}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {question.category}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-flex items-center px-4 py-3 rounded-xl rounded-tl-none bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Ask a question..."
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                disabled={isLoading || input.trim() === ''}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            <Zap className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;