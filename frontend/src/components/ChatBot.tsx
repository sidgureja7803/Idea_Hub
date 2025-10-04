import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m the FoundrIQ assistant. I can answer questions about startup validation, our platform, or help you analyze your business idea.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            { role: 'system', content: 'You are an AI assistant for FoundrIQ, an AI-powered startup validation platform. You help users analyze and validate their startup ideas using market research, competitive benchmarking, and strategy generation. Always be helpful, concise, and focus on providing valuable insights about startup validation, market analysis, and business strategy. If asked about technical details, mention that FoundrIQ uses Cerebras for AI inference, Docker for containerization, and Llama models for natural language understanding.' },
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
          <div className="bg-blue-600 dark:bg-blue-700 p-4 text-white font-bold flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              <h3>FoundrIQ Assistant</h3>
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
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ChatBot;