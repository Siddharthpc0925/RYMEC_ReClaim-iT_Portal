import React, { useState, useEffect } from 'react';
import { MapPin, PlusCircle, ArrowLeft, Clock, Shield } from 'lucide-react';
import { api } from '../lib/api';
import { Item, Location } from '../types';
import { ItemCard } from '../components/items/ItemCard';

interface NearLocationProps {
  slug: string;
  navigate: (route: string) => void;
}

export const NearLocation: React.FC<NearLocationProps> = ({ slug, navigate }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const locRes = await api.getLocations();
        const foundLoc = (locRes.locations || []).find((l: Location) => l.slug === slug);
        setLocation(foundLoc || null);

        const itemsRes = await api.getItems({
          location: slug,
          type: 'FOUND',
          limit: 12,
        });
        setItems(itemsRes.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header Back Button */}
      <button
        onClick={() => navigate('/browse')}
        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
      </button>

      {/* Location Banner (U9) */}
      <div className="glass rounded-[32px] p-6 sm:p-10 border border-white/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Campus Location Zone</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {location ? location.name : 'Campus Hub'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Showing all items reported found in or near <span className="text-white font-semibold">{location?.name || slug}</span> ({location?.parent_zone || 'Campus Zone'}).
          </p>
        </div>

        {/* 1-Tap "I Found Something Here" Button (U9) */}
        <button
          onClick={() => navigate(`/report?type=FOUND&locationSlug=${slug}`)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>I Found Something Here</span>
        </button>
      </div>

      {/* Found Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Items Found Near This Spot ({items.length})
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass rounded-3xl p-4 h-64 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center glass rounded-3xl border border-white/20 text-slate-400 space-y-3">
            <Shield className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No unclaimed items found here recently</h4>
            <p className="text-xs max-w-sm mx-auto">
              If you found a misplaced student belonging at {location?.name || 'this location'}, click above to report it!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
