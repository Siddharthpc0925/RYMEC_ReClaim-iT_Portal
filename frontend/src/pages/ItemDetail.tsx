import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Tag,
  Shield,
  HelpCircle,
  Clock,
  Share2,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Eye,
  QrCode,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { Item, CustodyEvent, Match, Claim } from '../types';
import { MatchRing } from '../components/items/MatchRing';
import { ShareModal } from '../components/items/ShareModal';
import { MaskedChat } from '../components/chat/MaskedChat';

interface ItemDetailProps {
  itemId: string;
  navigate: (route: string) => void;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ itemId, navigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userClaim, setUserClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showShare, setShowShare] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAbuseModal, setShowAbuseModal] = useState(false);

  // Claim Form state
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Abuse Form state
  const [abuseReason, setAbuseReason] = useState('');
  const [submittingAbuse, setSubmittingAbuse] = useState(false);

  const fetchItemData = async () => {
    setLoading(true);
    try {
      const res = await api.getItemById(itemId);
      setItem(res.item);
      setCustodyEvents(res.custodyEvents || []);
      setMatches(res.matches || []);
      setUserClaim(res.userClaim || null);
    } catch (err: any) {
      toast(err.message || 'Error loading item details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [itemId]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to file an item ownership claim.', 'error');
      navigate('/login');
      return;
    }

    setSubmittingClaim(true);
    try {
      const res = await api.createClaim({
        item_id: item?.id,
        answer: claimAnswer.trim(),
        message: claimMessage.trim(),
      });
      toast(res.message, 'success');
      setShowClaimModal(false);
      setUserClaim(res.claim);
      fetchItemData();
    } catch (err: any) {
      toast(err.message || 'Failed to submit claim', 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleAbuseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abuseReason.trim()) return;

    setSubmittingAbuse(true);
    try {
      const res = await api.reportAbuse(item!.id, abuseReason.trim());
      toast(res.message, 'success');
      setShowAbuseModal(false);
      setAbuseReason('');
    } catch (err: any) {
      toast(err.message || 'Failed to submit abuse report', 'error');
    } finally {
      setSubmittingAbuse(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center glass rounded-3xl animate-pulse space-y-4">
        <div className="w-1/3 h-8 bg-white/10 rounded mx-auto" />
        <div className="w-1/2 h-4 bg-white/10 rounded mx-auto" />
        <div className="w-full h-80 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto p-8 text-center glass rounded-3xl space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold">Item Not Found</h2>
        <p className="text-xs text-slate-400">
          This record may be private, removed, or does not exist.
        </p>
        <button
          onClick={() => navigate('/browse')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const isFound = item.type === 'FOUND';

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/browse')}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          ← Back to Campus Directory
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShare(true)}
            className="px-3.5 py-1.5 rounded-full glass hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            Share Record
          </button>
          <button
            onClick={() => setShowAbuseModal(true)}
            className="p-2 rounded-full glass hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Report abuse or spam"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Item Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo & Key Badges (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass border border-white/20 shadow-2xl bg-black/40">
            <img
              src={item.image_path || (item.type === 'LOST' ? '/images/rymec-building.png' : '/images/rymec-campus.png')}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-lg backdrop-blur-md ${
                  item.type === 'LOST'
                    ? 'bg-rose-500/90 text-white border-rose-400'
                    : 'bg-emerald-600/90 text-white border-emerald-400'
                }`}
              >
                {item.type}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-900/90 text-white border border-white/20 backdrop-blur-md">
                {item.status}
              </span>
            </div>
          </div>

          {/* Custody Held At Info (Found items) */}
          {item.held_at && (
            <div className="p-4 rounded-2xl glass border border-white/10 text-xs space-y-1">
              <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                Current Physical Custody
              </div>
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Held At: {item.held_at}</span>
              </div>
            </div>
          )}

          {/* Reporter Profile Info */}
          <div className="p-4 rounded-2xl glass border border-white/10 text-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Reported By</div>
              <div className="font-semibold text-slate-200 mt-0.5">{item.reporter_name}</div>
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Challenge & Actions (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>{item.category}</span>
                {item.brand && <span>• {item.brand}</span>}
                {item.colour && <span>• {item.colour}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {item.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Location & Occurrence Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/10 dark:border-white/10 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" /> Location
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.location_name || 'Campus Grounds'}
                </div>
                {item.location_parent && (
                  <div className="text-[11px] text-slate-500">Zone: {item.location_parent}</div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" /> Date & Time
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(item.occurred_at).toLocaleDateString([], {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(item.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Verification Challenge Question (U4: shown on Found items) */}
            {isFound && item.verify_question && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Hidden-Detail Challenge Question (U4)</span>
                </div>
                <p className="text-slate-300 text-xs font-medium">"{item.verify_question}"</p>
                <p className="text-[10px] text-slate-400">
                  To claim this found item, answer this challenge correctly. The finder will review your answer side-by-side before approving handover.
                </p>
              </div>
            )}

            {/* Action Buttons: Claim / I Found This */}
            <div className="pt-2">
              {isFound ? (
                isOwner ? (
                  <div className="p-3 rounded-2xl bg-white/10 text-xs text-center text-slate-300 font-medium">
                    You reported this found item. View incoming claims in your Dashboard.
                  </div>
                ) : userClaim ? (
                  <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">Your Claim Status:</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-indigo-600 text-white">
                        {userClaim.status}
                      </span>
                    </div>
                    {userClaim.status === 'APPROVED' && userClaim.handover_code && (
                      <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200">
                        <div className="font-bold text-sm">🎉 Your Handover Code: {userClaim.handover_code}</div>
                        <div className="text-[11px] text-emerald-300 mt-0.5">
                          Present this 6-digit code or QR at /handover to complete collection!
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Claim Ownership Of This Item
                  </button>
                )
              ) : (
                /* Lost Item Actions */
                <button
                  onClick={() => navigate(`/report?type=FOUND&category=${item.category}`)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-bold shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  I Found This Item (Submit Found Match)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Masked In-App Chat (U5) - Active if user has claim or is owner */}
      {userClaim && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>Direct Handover Coordination Chat</span>
          </h2>
          <MaskedChat claimId={userClaim.id} />
        </section>
      )}

      {/* Possible Matches Panel (U1: Explainable Match Engine) */}
      {matches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Explainable Match Engine Results (U1)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Matching Campus Reports ({matches.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                onClick={() => m.matchedItem && navigate(`/items/${m.matchedItem.id}`)}
                className="glass rounded-3xl p-5 border border-white/20 shadow-xl hover:border-indigo-400 cursor-pointer transition-all flex items-start gap-4"
              >
                <MatchRing score={m.score} size={64} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {m.matchedItem?.title || 'Matched Campus Record'}
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {m.matchedItem?.type}
                    </span>
                  </div>

                  {/* Explainable match reasons (U1) */}
                  <div className="mt-2 space-y-1">
                    {m.reasons.map((r, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                    <span>Inspect Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chain of Custody Timeline (U3) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Immutable Audit Log</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Chain of Custody Timeline (U3)
        </h2>

        <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl">
          {custodyEvents.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-6">
              Initial report registered. No custody transitions yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/40">
              {custodyEvents.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-950" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <span className="font-bold text-indigo-400 uppercase tracking-wide">
                      {event.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{event.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Claim Modal Dialog (U4 Challenge Question) */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass rounded-3xl p-6 border border-white/20 shadow-2xl text-slate-100 space-y-4"
          >
            <h3 className="text-lg font-bold">Ownership Claim & Challenge Response</h3>
            <p className="text-xs text-slate-300">
              Answer the verification question set by the finder to verify your ownership.
            </p>

            {item.verify_question && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-xs">
                <span className="font-bold text-indigo-300">Challenge Question: </span>
                <span className="text-white">"{item.verify_question}"</span>
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Your Answer *
                </label>
                <input
                  type="text"
                  value={claimAnswer}
                  onChange={(e) => setClaimAnswer(e.target.value)}
                  placeholder="Type your answer clearly..."
                  required
                  className="w-full glass-input px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Message to Finder (Optional)
                </label>
                <textarea
                  rows={2}
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Where/when you lost it, or preferred meetup spot..."
                  className="w-full glass-input px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Abuse Report Modal Dialog */}
      {showAbuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass rounded-3xl p-6 border border-white/20 shadow-2xl text-slate-100 space-y-4"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h3>Report Inappropriate Listing</h3>
            </div>
            <p className="text-xs text-slate-300">
              Campus proctors review abuse complaints to ensure portal safety and authenticity.
            </p>

            <form onSubmit={handleAbuseSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={abuseReason}
                onChange={(e) => setAbuseReason(e.target.value)}
                placeholder="Reason (e.g. false post, spam, duplicate, offensive language)..."
                required
                className="w-full glass-input px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAbuseModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAbuse}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
                >
                  {submittingAbuse ? 'Submitting...' : 'Submit Abuse Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {showShare && <ShareModal item={item} onClose={() => setShowShare(false)} />}
    </div>
  );
};
