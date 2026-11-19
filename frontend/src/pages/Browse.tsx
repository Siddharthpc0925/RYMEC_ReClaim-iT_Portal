import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, Tag, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Item, Location, CAMPUS_CATEGORIES } from '../types';
import { api } from '../lib/api';
import { ItemCard } from '../components/items/ItemCard';

interface BrowseProps {
  navigate: (route: string) => void;
  initialSearch?: string;
}

const CATEGORIES = ['All', ...CAMPUS_CATEGORIES];

export const Browse: React.FC<BrowseProps> = ({ navigate, initialSearch = '' }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState<'All' | 'LOST' | 'FOUND'>('All');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    api.getLocations().then((res) => setLocations(res.locations || [])).catch(console.error);
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.getItems({
        search,
        type: type === 'All' ? '' : type,
        category: category === 'All' ? '' : category,
        location: location === 'All' ? '' : location,
        status: status === 'All' ? '' : status,
        sort,
        page,
        limit: 9,
      });
      setItems(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalItems || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, category, location, status, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const clearFilters = () => {
    setSearch('');
    setType('All');
    setCategory('All');
    setLocation('All');
    setStatus('All');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Campus Records Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and filter verified lost and found reports across RYMEC campus.
          </p>
        </div>

        {/* Total Badge */}
        <div className="self-start sm:self-auto px-4 py-2 rounded-2xl glass border border-white/20 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
          Showing {totalItems} record{totalItems === 1 ? '' : 's'}
        </div>
      </div>

      {/* Main Filter Glass Card */}
      <div className="glass rounded-3xl p-5 border border-white/20 shadow-xl space-y-4">
        {/* Search Bar + Type Toggle */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword (e.g. black wallet, Casio calculator, bike keys)..."
              className="w-full pl-11 pr-24 py-2.5 rounded-2xl glass-input text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
            >
              Search
            </button>
          </form>

          {/* Type Segmented Buttons */}
          <div className="flex items-center gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
            {(['All', 'LOST', 'FOUND'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPage(1);
                }}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  type === t
                    ? t === 'LOST'
                      ? 'bg-rose-500 text-white shadow-md'
                      : t === 'FOUND'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 pr-1 flex-shrink-0">
            <Tag className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Row: Location, Status, Sort & Clear */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
          {/* Location Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Campus Location</label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white bg-transparent focus:outline-none"
            >
              <option value="All" className="bg-slate-900 text-white">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white bg-transparent focus:outline-none"
            >
              <option value="All" className="bg-slate-900 text-white">All Statuses</option>
              <option value="OPEN" className="bg-slate-900 text-white">OPEN</option>
              <option value="MATCHED" className="bg-slate-900 text-white">MATCHED</option>
              <option value="CLAIMED" className="bg-slate-900 text-white">CLAIMED</option>
              <option value="RETURNED" className="bg-slate-900 text-white">RETURNED</option>
              <option value="ARCHIVED" className="bg-slate-900 text-white">ARCHIVED</option>
              <option value="DONATED" className="bg-slate-900 text-white">DONATED</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white bg-transparent focus:outline-none"
            >
              <option value="newest" className="bg-slate-900 text-white">Newest First</option>
              <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass rounded-3xl p-4 h-72 animate-pulse flex flex-col justify-between">
              <div className="w-full h-36 bg-white/10 rounded-2xl" />
              <div className="space-y-2">
                <div className="w-1/3 h-4 bg-white/10 rounded" />
                <div className="w-3/4 h-5 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 text-center glass rounded-3xl border border-white/20 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Campus Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We couldn't find any lost or found reports matching your current search parameters. Try resetting filters or report this item.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              Clear Filters
            </button>
            <button
              onClick={() => navigate('/report')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
            >
              Report New Item
            </button>
          </div>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl glass hover:bg-white/20 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl glass hover:bg-white/20 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
