import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Share2, Tag, ArrowRight } from 'lucide-react';
import { Item } from '../../types';
import { ShareModal } from './ShareModal';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const [showShare, setShowShare] = useState(false);

  // Status badge styling
  const statusStyles: Record<string, string> = {
    OPEN: item.type === 'LOST'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    MATCHED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CLAIMED: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    RETURNED: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    ARCHIVED: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    DONATED: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        onClick={onClick}
        className="group relative cursor-pointer glass rounded-3xl overflow-hidden border border-white/20 shadow-xl hover:shadow-2xl hover:border-white/40 transition-all flex flex-col h-full"
      >
        {/* Top Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/60">
          <img
            src={item.image_path || (item.type === 'LOST' ? '/images/rymec-building.png' : '/images/rymec-campus.png')}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/rymec-campus.png';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md backdrop-blur-md ${
                item.type === 'LOST'
                  ? 'bg-rose-500/90 text-white border-rose-400'
                  : 'bg-emerald-600/90 text-white border-emerald-400'
              }`}
            >
              {item.type}
            </span>

            <div className="flex items-center gap-1.5">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md ${
                  statusStyles[item.status] || 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {item.status}
              </span>

              {/* Share button (U13) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShare(true);
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-colors"
                title="Share this listing"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Photo Metadata overlay */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-medium">
            <span className="flex items-center gap-1 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{item.location_name || 'Campus'}</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-300">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(item.occurred_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
              <Tag className="w-3 h-3" />
              <span>{item.category}</span>
              {item.colour && <span className="text-slate-400">• {item.colour}</span>}
              {item.brand && <span className="text-slate-400">• {item.brand}</span>}
            </div>

            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Card Footer */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
              By: {item.reporter_name}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </motion.div>

      {/* Share Modal Dialog */}
      {showShare && <ShareModal item={item} onClose={() => setShowShare(false)} />}
    </>
  );
};
