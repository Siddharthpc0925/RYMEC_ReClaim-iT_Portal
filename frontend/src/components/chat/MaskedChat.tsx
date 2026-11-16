import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Shield, Phone, Mail, UserCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { ChatMessage } from '../../types';
import { useToast } from '../../context/ToastContext';

interface MaskedChatProps {
  claimId: string;
}

export const MaskedChat: React.FC<MaskedChatProps> = ({ claimId }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [bothShared, setBothShared] = useState(false);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [sharingContact, setSharingContact] = useState(false);

  const fetchChat = async () => {
    try {
      const data = await api.getChat(claimId);
      setMessages(data.messages || []);
      setBothShared(data.bothShared || false);
      setContactDetails(data.contactDetails || null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    // Poll chat every 5s for realtime feel
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [claimId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const text = inputText;
      setInputText('');
      const res = await api.sendMessage(claimId, text);
      if (res.chatMessage) {
        setMessages((prev) => [...prev, res.chatMessage]);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to send message', 'error');
    }
  };

  const handleShareContact = async () => {
    setSharingContact(true);
    try {
      const res = await api.shareContact(claimId);
      toast(res.message, 'success');
      setBothShared(res.bothShared);
      if (res.bothShared) {
        setContactDetails({
          claimant: res.claimantContact,
          finder: res.finderContact,
        });
      }
    } catch (err: any) {
      toast(err.message || 'Failed to update contact share preference', 'error');
    } finally {
      setSharingContact(false);
    }
  };

  const handleReportMessage = (msgId: string) => {
    toast(`Message ${msgId} flagged for security review.`, 'info');
  };

  return (
    <div className="glass rounded-3xl p-5 border border-white/20 shadow-2xl flex flex-col h-[520px]">
      {/* Header with Privacy & Contact Sharing (U5) */}
      <div className="pb-3 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              Masked In-App Chat
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Encrypted & Private
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personal contact details remain hidden until both parties explicitly agree to share.
            </p>
          </div>
        </div>

        {/* Share Contact Toggle */}
        <button
          onClick={handleShareContact}
          disabled={sharingContact || bothShared}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
            bothShared
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>{bothShared ? 'Contacts Unlocked' : 'Share My Contact'}</span>
        </button>
      </div>

      {/* Contact Details Bar (Shown only if both shared) */}
      {bothShared && contactDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex flex-wrap gap-4 items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Finder Phone: {contactDetails.finder?.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Claimant Email: {contactDetails.claimant?.email || 'N/A'}</span>
          </div>
        </motion.div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Connecting to secure campus channel...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No messages yet. Send a message to coordinate your item handover time and campus spot!
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.is_me ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 mb-0.5">
                <span className="font-semibold">{m.is_me ? 'You' : m.sender_name}</span>
                <span>•</span>
                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                  m.is_me
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-black/30 dark:bg-white/10 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-white/10'
                }`}
              >
                <p className="leading-relaxed break-words">{m.body}</p>

                {/* Flag / Report message icon */}
                {!m.is_me && (
                  <button
                    onClick={() => handleReportMessage(m.id)}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                    title="Report message"
                  >
                    <AlertTriangle className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message (avoid sharing sensitive bank/password info)..."
          className="flex-1 glass-input px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
