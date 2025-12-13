import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot,           // AI Robot iconi
  X, 
  Send, 
  Loader2, 
  Sparkles,      // AI sehrli effekti
  Sprout         // Agro mavzusi uchun
} from 'lucide-react';
// Framer Motion qo'shildi animatsiya uchun
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, Message } from '@/hooks/useChat';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Hook orqali mantiqni chaqiramiz
  const { messages, isLoading, sendMessage } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Avtomatik pastga scroll qilish
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const temp = inputValue;
    setInputValue('');
    await sendMessage(temp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Asosiy konteyner: faqat button joylashgan joyda pointer-events ishlaydi
    // Chat ochilganda esa pointer-events chat oynasiga o'tadi
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-5 font-sans pointer-events-none">
      
      {/* --- CHAT OYNASI (AnimatePresence bilan) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[360px] sm:w-[400px] h-[550px] max-h-[75vh] bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto origin-bottom-right"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-emerald-950/40 border-b border-emerald-500/20 p-4 flex items-center justify-between shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                   <Bot size={22} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    AgroAi <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                  </h3>
                  <p className="text-xs text-emerald-200/70">Online maslahatchi</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-emerald-100/70 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body (Xabarlar) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
              {messages.map((msg: Message) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`
                      max-w-[85%] p-3 text-sm rounded-2xl shadow-sm leading-relaxed backdrop-blur-sm
                      ${msg.sender === 'user' 
                        ? 'bg-emerald-600/90 text-white rounded-br-none border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                        : 'bg-slate-800/60 text-slate-100 border border-white/10 rounded-bl-none'}
                    `}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-1.5 mb-1 opacity-50">
                          <Bot size={12} /> <span className="text-[10px] font-semibold">AI</span>
                      </div>
                    )}
                    {msg.text}
                    <div className={`text-[10px] mt-1 text-right opacity-60 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/60 border border-white/10 p-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-emerald-500/20 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2 bg-slate-950/50 rounded-full px-4 py-2 border border-emerald-500/20 focus-within:border-emerald-500/60 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Savol bering..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className={`
                    p-2 rounded-full transition-all duration-300
                    ${inputValue.trim() 
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:scale-110 hover:bg-emerald-400 cursor-pointer' 
                      : 'text-slate-600 cursor-not-allowed'}
                  `}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <div className="text-center mt-2 flex items-center justify-center gap-1 opacity-40 hover:opacity-70 transition-opacity">
                  <Sprout size={10} className="text-emerald-400" />
                  <p className="text-[10px] text-slate-400">Powered by AgroAi</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LAUNCHER TUGMASI --- */}
      {/* pointer-events-auto shart, chunki asosiy div pointer-events-none */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative w-16 h-16 rounded-full 
          flex items-center justify-center 
          transition-all duration-300 transform hover:scale-105 active:scale-95
          shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]
          ${isOpen ? 'bg-red-500 rotate-90 shadow-red-500/40' : 'bg-gradient-to-br from-emerald-600 to-green-700'}
          text-white border border-white/10
          pointer-events-auto cursor-pointer
        `}
        aria-label="AgroAi Chat"
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <>
            <Bot size={32} className="relative z-10 drop-shadow-md" />
            <div className="absolute top-3 right-3 animate-pulse">
               <Sparkles size={12} className="text-yellow-300" />
            </div>
          </>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;