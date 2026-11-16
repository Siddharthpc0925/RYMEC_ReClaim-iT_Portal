import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  Inbox,
  Bookmark,
  Award,
  Bell,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Plus,
  QrCode,
  Tag,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { Item, Claim, SavedSearch, NotificationItem, Location } from '../types';

interface DashboardProps {
  navigate: (route: string) => void;
}

type TabType = 'reports' | 'my-claims' | 'incoming' | 'watchlist' | 'points' | 'notifications';

export const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
  const { user, badges, refreshUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<Claim[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // New Watchlist Form
  const [watchKeywords, setWatchKeywords] = useState('');
  const [watchCategory, setWatchCategory] = useState('');
  const [watchLocation, setWatchLocation] = useState('');

  // Selected QR modal
  const [selectedQrClaim, setSelectedQrClaim] = useState<Claim | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [itemsRes, myClaimsRes, incClaimsRes, watchRes, notifRes, locRes] = await Promise.all([
        api.getItems(),
        api.getMyClaims(),
        api.getIncomingClaims(),
        api.getWatchlist(),
        api.getNotifications(),
        api.getLocations(),
      ]);

      // Filter reports posted by this user
      setMyItems((itemsRes.items || []).filter((i: Item) => i.user_id === user.id));
      setMyClaims(myClaimsRes.claims || []);
      setIncomingClaims(incClaimsRes.claims || []);
      setSavedSearches(watchRes.savedSearches || []);
      setNotifications(notifRes.notifications || []);
      setLocations(locRes.locations || []);
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Claim Decision Handler (Approve / Reject)
  const handleClaimDecision = async (claimId: string, decision: 'APPROVE' | 'REJECT', isFraud = false) => {
    try {
      const res = await api.decideClaim(claimId, decision, isFraud);
      toast(res.message, 'success');
      await fetchDashboardData();
    } catch (err: any) {
      toast(err.message || 'Error processing decision', 'error');
    }
  };

  // Add Watchlist Alert
  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchKeywords && !watchCategory && !watchLocation) {
      toast('Please enter keywords, a category or choose a location.', 'error');
      return;
    }
    try {
      const res = await api.createWatchlist({
        keywords: watchKeywords,
        category: watchCategory || null,
        location_id: watchLocation || null,
      });
      toast(res.message, 'success');
      setWatchKeywords('');
      setWatchCategory('');
      setWatchLocation('');
      fetchDashboardData();
    } catch (err: any) {
      toast(err.message || 'Failed to save watchlist', 'error');
    }
  };

  // Delete Watchlist
  const handleDeleteWatchlist = async (id: string) => {
    try {
      await api.deleteWatchlist(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      toast('Watchlist alert removed.', 'info');
    } catch (err) {
      toast('Failed to delete watchlist', 'error');
    }
  };

  // Delete Item Report
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this report?')) return;
    try {
      await api.deleteItem(itemId);
      toast('Report deleted.', 'success');
      fetchDashboardData();
    } catch (err) {
      toast('Failed to delete report', 'error');
    }
  };

  const tabs = [
    { id: 'reports', label: 'My Reports', count: myItems.length, icon: FileText },
    { id: 'my-claims', label: 'My Claims', count: myClaims.length, icon: Clock },
    { id: 'incoming', label: 'Incoming Claims', count: incomingClaims.length, icon: Inbox },
    { id: 'watchlist', label: 'Watchlist', count: savedSearches.length, icon: Bookmark },
    { id: 'points', label: 'Points & Badges', count: user?.points || 0, icon: Award },
    { id: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.is_read).length, icon: Bell },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header Profile Summary */}
      <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-2xl font-black shadow-lg">
            {user?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                {user?.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3 justify-center sm:justify-start">
              <span>Roll: {user?.roll_no}</span>
              <span>•</span>
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Points & Certificate Button (U12) */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 text-center">
            <div className="text-2xl font-black text-amber-400">{user?.points || 0}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Points</div>
          </div>

          <button
            onClick={() => navigate('/certificate')}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Citation Certificate</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-black/10 dark:border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reports Filed By You</h3>
            <button
              onClick={() => navigate('/report')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              File New Report
            </button>
          </div>

          {myItems.length === 0 ? (
            <div className="p-12 text-center glass rounded-3xl text-xs text-slate-400">
              You haven't filed any lost or found reports yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-3xl p-5 border border-white/20 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.type === 'LOST'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white mt-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-3">
                      <span>📍 {item.location_name || 'Campus'}</span>
                      <span>📅 {new Date(item.occurred_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10 text-xs">
                    <button
                      onClick={() => navigate(`/items/${item.id}`)}
                      className="text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Claims (With U3 Handover Code & QR) */}
      {activeTab === 'my-claims' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Claims You Have Filed</h3>

          {myClaims.length === 0 ? (
            <div className="p-12 text-center glass rounded-3xl text-xs text-slate-400">
              You haven't claimed any found items yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="glass rounded-3xl p-5 border border-white/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{claim.item_title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          claim.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Your Submitted Answer: "{claim.answer}"</p>
                  </div>

                  {/* If Approved, show Handover Code & QR (U3) */}
                  {claim.status === 'APPROVED' && claim.handover_code && (
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl bg-indigo-950/80 border border-indigo-400/40 text-center">
                        <div className="text-[10px] text-indigo-300 font-bold uppercase">6-Digit Code</div>
                        <div className="text-lg font-mono font-black text-white">{claim.handover_code}</div>
                      </div>

                      <button
                        onClick={() => setSelectedQrClaim(claim)}
                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Show QR Code"
                      >
                        <QrCode className="w-5 h-5 text-indigo-400" />
                      </button>

                      <button
                        onClick={() => navigate(`/items/${claim.item_id}`)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                      >
                        Coordinate Meetup
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Incoming Claims (U4 Challenge Question Verification) */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Claims Submitted on Items You Found (U4 Verification)
          </h3>

          {incomingClaims.length === 0 ? (
            <div className="p-12 text-center glass rounded-3xl text-xs text-slate-400">
              No claims pending review on your found items.
            </div>
          ) : (
            <div className="space-y-4">
              {incomingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="glass rounded-3xl p-6 border border-white/20 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div>
                      <h4 className="font-bold text-sm text-white">Item: {claim.item_title}</h4>
                      <p className="text-xs text-slate-400">
                        Claimant: {claim.claimant_name} ({claim.claimant_roll})
                      </p>
                    </div>
                    <span
                      className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  {/* Side-by-side challenge question comparison (U4) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Your Verification Question
                      </span>
                      <p className="text-indigo-300 font-medium">"{claim.verify_question || 'N/A'}"</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Claimant's Submitted Answer
                        </span>
                        {claim.closeMatchHint && (
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            Exact / Close Match
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium">"{claim.claimant_answer}"</p>
                    </div>
                  </div>

                  {claim.message && (
                    <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="font-semibold text-slate-400">Note from claimant:</span> {claim.message}
                    </div>
                  )}

                  {/* Actions for Pending Claims */}
                  {claim.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleClaimDecision(claim.id, 'REJECT', false)}
                        className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition-colors"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleClaimDecision(claim.id, 'APPROVE')}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        Approve & Issue Handover Code
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Smart Watchlist (U6) */}
      {activeTab === 'watchlist' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>Save a Standing Campus Watchlist Alert (U6)</span>
            </h3>
            <p className="text-xs text-slate-400">
              When a matching found item is reported anywhere on campus, you will receive an instant proactive notification!
            </p>

            <form onSubmit={handleAddWatchlist} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                value={watchKeywords}
                onChange={(e) => setWatchKeywords(e.target.value)}
                placeholder="Keywords (e.g. wildhorn wallet, airpods)"
                className="glass-input px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none"
              />

              <select
                value={watchCategory}
                onChange={(e) => setWatchCategory(e.target.value)}
                className="glass-input px-3 py-2 text-white bg-transparent focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-white">Any Category</option>
                {['ID card', 'Phone', 'Wallet', 'Keys', 'Bottle', 'Bag', 'Books', 'Earphones', 'Laptop', 'Calculator'].map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>

              <select
                value={watchLocation}
                onChange={(e) => setWatchLocation(e.target.value)}
                className="glass-input px-3 py-2 text-white bg-transparent focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-white">Any Campus Zone</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">{loc.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow"
              >
                Add Standing Alert
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Active Watchlist Searches</h4>
            {savedSearches.length === 0 ? (
              <div className="p-8 text-center glass rounded-2xl text-xs text-slate-400">
                No active standing searches saved.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedSearches.map((s) => (
                  <div key={s.id} className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{s.keywords || s.category || 'Campus Watch'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {s.category && <span>Category: {s.category} • </span>}
                        {s.location_name && <span>Location: {s.location_name}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWatchlist(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Points & Badges (U12) */}
      {activeTab === 'points' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-3xl border border-white/20 text-center space-y-2">
              <div className="text-3xl font-black text-amber-400">{user?.points || 0}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Total Trust Score
              </div>
              <p className="text-[11px] text-slate-400">
                +20 on returned item • +2 on claim handover
              </p>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/20 text-center space-y-2">
              <div className="text-3xl font-black text-indigo-400">{badges.length}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Badges Unlocked
              </div>
              <p className="text-[11px] text-slate-400">
                Earned through honest campus actions
              </p>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/20 text-center space-y-2 flex flex-col justify-center items-center">
              <Award className="w-8 h-8 text-amber-400" />
              <button
                onClick={() => navigate('/certificate')}
                className="mt-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
              >
                View Printable Citation
              </button>
            </div>
          </div>

          {/* Badges List */}
          <div className="glass p-6 rounded-3xl border border-white/20 space-y-4">
            <h4 className="text-sm font-bold text-white">Campus Honor Badges</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2 text-center">
                <div className="text-2xl">🌱</div>
                <div className="font-bold text-xs text-white">FIRST_RETURN</div>
                <p className="text-[10px] text-slate-400">Completed 1 verified item return</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2 text-center">
                <div className="text-2xl">🤝</div>
                <div className="font-bold text-xs text-white">HELPER</div>
                <p className="text-[10px] text-slate-400">Completed 5 verified item returns</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2 text-center">
                <div className="text-2xl">🏆</div>
                <div className="font-bold text-xs text-white">CAMPUS_HERO</div>
                <p className="text-[10px] text-slate-400">Completed 10+ verified item returns</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Notifications (C7) */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Notifications</h3>
            <button
              onClick={async () => {
                await api.markAllNotificationsRead();
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                refreshUser();
              }}
              className="text-xs text-indigo-400 font-semibold hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => n.link && navigate(n.link)}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  n.is_read
                    ? 'glass opacity-70 border-white/10'
                    : 'bg-indigo-500/15 border-indigo-500/40 text-white'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {n.link && <ExternalLink className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Handover QR Modal (U3) */}
      {selectedQrClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm glass rounded-3xl p-6 border border-white/20 shadow-2xl text-center space-y-4"
          >
            <h3 className="font-bold text-base text-white">Handover QR Verification</h3>
            <p className="text-xs text-slate-300">
              Present this QR to the finder or security desk to scan and confirm physical handover.
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <QRCodeSVG
                value={`https://reclaim.rymec.edu.in/handover?code=${selectedQrClaim.handover_code}`}
                size={180}
              />
            </div>

            <div className="text-2xl font-mono font-black text-indigo-400 tracking-widest">
              {selectedQrClaim.handover_code}
            </div>

            <button
              onClick={() => setSelectedQrClaim(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
