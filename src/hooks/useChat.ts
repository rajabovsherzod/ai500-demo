import { useState, useCallback } from 'react';
    import { sendChatMessage, ChatHistoryItem } from '@/api/chat-api'; // API import qilindi
    import { toast } from 'sonner';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const useChat = () => {
  // Boshlang'ich xabar
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Assalomu alaykum! Men AgroAi aqlli yordamchisiman. Issiqxonangiz bo'yicha qanday yordam bera olaman?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 1. Foydalanuvchi xabarini UI ga chiqarish
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Optimistik update: darhol chatga qo'shamiz
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. History ni tayyorlash (API uchun)
      // Oxirgi xabarni o'z ichiga olmaydi, faqat oldingilarini jo'natamiz
      const history: ChatHistoryItem[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.text
      }));

      // 3. API ga so'rov yuborish
      const response = await sendChatMessage({
        message: text,
        history: history
      });

      // 4. Bot javobini qabul qilish va UI ga chiqarish
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply, // API dan kelgan "reply" maydoni
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat API Error:", error);
      toast.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      
      // Xatolik xabarini chatga ham qo'shish (ixtiyoriy)
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: "Kechirasiz, server bilan bog'lanishda xatolik yuz berdi.",
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]); // messages o'zgarganda history ham yangilanadi

  return { messages, isLoading, sendMessage };
};