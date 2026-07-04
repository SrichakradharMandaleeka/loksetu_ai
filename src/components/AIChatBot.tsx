import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '../types';

export const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "wel_001",
      sender: "ai",
      text: "Namaste! I am the Loksetu AI Assistant. I have live access to all citizen feedback and project funding portfolios in Lucknow Central. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages
        })
      });

      if (!response.ok) throw new Error("Chat api failed");
      const data = await response.json();

      const aiReply: ChatMessage = {
        id: "ai_" + Math.random().toString(36).substr(2, 9),
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: "err_" + Math.random().toString(36).substr(2, 9),
        sender: "ai",
        text: "Apologies, I encountered an issue connecting to the AI grid server. Please verify your GEMINI_API_KEY, or double check if the server is offline.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(inputText);
    }
  };

  const quickQuestions = [
    "What is the highest priority issue?",
    "Which villages need water projects?",
    "Show me projects under ₹40 Lakh",
    "Summarize Gomti Bridge status"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group pulse-red"
        >
          <Bot className="h-6 w-6" />
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
          
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Query Loksetu AI
          </div>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Sparkles className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <span className="font-display font-bold text-sm tracking-tight flex items-center gap-1">
                  Loksetu AI Assistant
                </span>
                <p className="text-[10px] font-medium text-emerald-200">
                  Powered by Gemini 3.5 Flash
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20 custom-scrollbar">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex items-start gap-2 max-w-[85%]`}>
                    {isAi && (
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 dark:bg-blue-950/40 dark:text-blue-400 mt-1">
                        AI
                      </div>
                    )}
                    <div>
                      <div className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                        isAi 
                          ? 'bg-white text-slate-800 border border-slate-200/60 shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' 
                          : 'bg-blue-600 text-white shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-1 block px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-mono">AI Analysing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick recommendations panel (only show on fresh chats) */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-wrap gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[10px] font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-900 rounded-lg px-2.5 py-1 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/40 dark:bg-slate-900/60 dark:border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Query projects, categories, budgets..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
