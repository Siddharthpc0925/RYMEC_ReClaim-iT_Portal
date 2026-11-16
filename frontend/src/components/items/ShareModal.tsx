import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { Item } from '../../types';

interface ShareModalProps {
  item: Item | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const itemUrl = `${window.location.origin}/items/${item.id}`;
  const shareText = `🔍 [RYMEC ReClaim-iT] ${item.type === 'LOST' ? 'LOST' : 'FOUND'}: "${item.title}" (${item.category}) reported at ${item.location_name || 'RYMEC Campus'}.\n\nIf you have information, view live record here: ${itemUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(itemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `RYMEC ReClaim-iT: ${item.title}`,
          text: shareText,
          url: itemUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md glass rounded-3xl p-6 shadow-2xl border border-white/20 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">Share Campus Listing</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp / Social Card Preview (U13) */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/15 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <img src="/images/vvs-logo.jpg" alt="RYMEC" className="w-4 h-4 rounded-full" />
                RYMEC ReClaim-iT
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  item.type === 'LOST'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {item.type}
              </span>
            </div>

            <div className="flex gap-3 mt-2">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/30 border border-white/10 flex-shrink-0">
                <img
                  src={item.image_path || '/images/rymec-building.png'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1">{item.description}</p>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-2">
                  <span>📍 {item.location_name || 'Campus'}</span>
                  <span>📅 {new Date(item.occurred_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Group
            </button>

            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/10 text-xs">
            <input
              type="text"
              readOnly
              value={itemUrl}
              className="flex-1 bg-transparent text-slate-300 text-xs truncate focus:outline-none px-1"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
