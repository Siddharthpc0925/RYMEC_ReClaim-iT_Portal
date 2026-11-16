import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Shield, MapPin } from 'lucide-react';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

export const ReClaimChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Namaskara! I am your RYMEC ReClaim-iT campus assistant. Ask me how to report a lost item, verify a handover, or where to deposit found belongings.'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const lower = userText.toLowerCase();
    setInput('');

    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    // Simulated Smart Campus Rules
    setTimeout(() => {
      let botResponse = "I can help you with reporting lost belongings, searching matching records, or scanning handover codes. You can also visit the Security Office near the Main Gate.";

      if (lower.includes('id') || lower.includes('roll') || lower.includes('card')) {
        botResponse = "Student ID cards reported found are handled with special privacy protection! When reported with a roll number, the card is hidden from public view and a private alert is sent directly to the owner.";
      } else if (lower.includes('handover') || lower.includes('code') || lower.includes('qr')) {
        botResponse = "When a claim is approved, the claimant gets a secure 6-digit handover code. At meetup, the finder or security desk enters or scans it at the '/handover' page to complete the return and earn +20 points!";
      } else if (lower.includes('where') || lower.includes('library') || lower.includes('canteen') || lower.includes('location')) {
        botResponse = "We cover 10 major campus zones including the Central Library, Canteen, CS & IT Labs, Mechanical Workshop, Electrical Block, and the Main Security Arch Gate.";
      } else if (lower.includes('point') || lower.includes('badge') || lower.includes('certificate')) {
        botResponse = "Finders receive +20 Trust Points for every returned item! Completing at least 1 verified return qualifies you for the official RYMEC Good Samaritan Citation of Honor.";
      } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('security')) {
        botResponse = "The Campus Security Desk is stationed at the RYMEC Main Gate. Phone: +91 94480 12345, Email: reclaim@rymec.edu.in.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 450);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="ios-glass-btn-primary p-4 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer group"
          title="Open RYMEC Assistant"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-navy-950 animate-pulse" />
        </motion.button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 sm:w-96 rounded-3xl ios-glass-card shadow-2xl border border-white/25 flex flex-col h-[460px] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/15 bg-navy-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-royal text-white flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">ReClaim-iT AI Assistant</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online • Campus Guide
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-brand-royal text-white rounded-tr-sm'
                        : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-navy-950/60 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about lost items, ID cards, drop box..."
                className="flex-1 glass-input px-3.5 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-brand-royal hover:bg-blue-600 text-white shadow-md active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
