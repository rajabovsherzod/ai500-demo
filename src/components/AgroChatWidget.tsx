// src/components/AgroChatWidget.tsx

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useChat, Message } from '../hooks/useChat'; // Hook import qilindi

const AgroChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sendMessage } = useChat();
  
  // Avtomatik pastga tushish uchun ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Har safar xabar o'zgarganda pastga tushirish
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const tempInput = inputValue;
    setInputValue(''); // Inputni tozalash
    await sendMessage(tempInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
      
      {/* CHAT OYNASI */}
      <div
        className={`
          transition-all duration-300 ease-in-out origin-bottom-right
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
          w-[350px] sm:w-[380px] h-[500px] max-h-[80vh]
          bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
          flex flex-col overflow-hidden
        `}
      >
        {/* Header */}
        <div className="bg-green-600 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
               {/* Logo o'rniga belgi */}
               <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">AgroAi Yordam</h3>
              <p className="text-xs text-green-100 opacity-90">Online yordamchi</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Xabarlar ro'yxati (Body) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
          {messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.sender === 'user' 
                    ? 'bg-green-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'}
                `}
              >
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indikatori (Typing effect) */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input qismi (Footer) */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-green-500 transition-colors">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Savolingizni yozing..."
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className={`
                p-2 rounded-full transition-all duration-200
                ${inputValue.trim() 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}
              `}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-400">Powered by AgroAi</p>
          </div>
        </div>
      </div>

      {/* TUGMA (Launcher) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-full shadow-[0_4px_20px_rgba(22,163,74,0.4)] 
          flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-red-500 rotate-90' : 'bg-green-600 rotate-0'}
          text-white
        `}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default AgroChatWidget;