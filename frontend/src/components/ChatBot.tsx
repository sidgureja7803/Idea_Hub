/**
 * ChatBot Component
 * An interactive chatbot for the landing page that answers user questions
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Sample answers for common questions
const PREDEFINED_ANSWERS: Record<string, string> = {
  "what is FoundrIQ": "FoundrIQ is an AI-powered platform that helps founders analyze and validate startup ideas using real-time market research, cultural alignment insights, competitive benchmarking, and strategy generation.",
  "how does it work": "Our platform uses 8 specialized AI agents working in sequence: from idea interpretation to market research, TAM/SAM analysis, cultural alignment assessment, competition scanning, feasibility evaluation, strategy recommendation, and final report generation.",
  "what features do you offer": "We offer AI-powered market research, TAM/SAM/SOM calculation, cultural alignment assessment, competition analysis, feasibility assessments, and personalized strategy recommendations - all packaged in a modern dashboard with PDF/Markdown export options.",
  "how much does it cost": "We offer different pricing plans starting with a free tier for basic idea validation. For detailed pricing, please check our pricing page or create an account to see all available options.",
  "what technology do you use": "We use React, TypeScript and Vite for the frontend, with Node.js and Express for the backend. Our AI capabilities are powered by LangChain, LangGraph, and models like Gemini and OpenAI, with data retrieval through Tavily.",
  "can i download my reports": "Yes! Once you've submitted an idea for analysis, you can download your results as a PDF or Markdown file from your dashboard.",
  "how accurate are the results": "Our platform combines multiple data sources and AI models to provide insights based on the most current available information. While highly accurate, we recommend using the analysis as one of several inputs in your decision-making process.",
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi there! 👋 I'm your FoundrIQ assistant. Ask me anything about our platform, how it works, or startup validation!", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = generateResponse(userMessage.text);
      setMessages(prevMessages => [...prevMessages, {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };
  
  // Simple response generation based on keywords
  const generateResponse = (question: string): string => {
    const normalizedQuestion = question.toLowerCase();
    
    // Check for predefined answers
    for (const [key, answer] of Object.entries(PREDEFINED_ANSWERS)) {
      if (normalizedQuestion.includes(key)) {
        return answer;
      }
    }
    
    // Default responses if no match found
    const defaultResponses = [
      "That's a great question! To get a detailed answer, I'd recommend creating an account and exploring our platform.",
      "Interesting question! This is something our full analysis can help with after you sign up.",
      "Thanks for asking! The best way to find out is to submit your startup idea and see our comprehensive analysis.",
      "Great point! Our AI agents can provide specific insights on this after analyzing your idea.",
      "I'd need more context to answer that fully. Why not create an account and submit your idea for a complete analysis?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };
  
  return (
    <>
      {/* Floating chat button */}
      <motion.button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <span className="text-xl">×</span>
        ) : (
          <MessageSquare size={20} />
        )}
      </motion.button>
      
      {/* Chat window */}
      <motion.div 
        className={`fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700 flex flex-col`}
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ 
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : 20,
          height: isOpen ? 500 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Chat header */}
        <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-medium">FoundrIQ Assistant</h3>
          <Sparkles size={16} className="ml-1" />
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`max-w-[80%] rounded-2xl py-2 px-4 ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === 'user' ? (
                    <User size={14} className="text-blue-200" />
                  ) : (
                    <Bot size={14} className="text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p>{message.text}</p>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-none py-2 px-4">
                <div className="flex gap-1">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            type="submit"
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={18} />
          </motion.button>
        </form>
      </motion.div>
    </>
  );
};

export default ChatBot;
