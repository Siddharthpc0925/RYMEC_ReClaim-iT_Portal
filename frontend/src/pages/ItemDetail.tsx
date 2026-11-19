import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Clock3, 
  MapPin, 
  MessageCircle, 
  PackageCheck, 
  ShieldCheck, 
  Sparkles, 
  QrCode,
  AlertCircle
} from 'lucide-react';
import { TypePill, StatusPill } from '../components/items/ItemCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Item } from '../types';

function exactDate(value: string | number | Date | undefined): string {
  if (!value) return 'Time not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Time not specified'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

interface ItemDetailProps {
  itemId: string;
  navigate: (route: string) => void;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ itemId, navigate }) => {
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimDetails, setClaimDetails] = useState('');
  const [claimAnswer, setClaimAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState('');

  const loadItem = async () => {
    try {
      const res = await api.getItemById(itemId);
      setItem(res.item);
    } catch (err: any) {
      setError(err.message || 'Could not load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to file an ownership claim.');
      return;
    }
    if (claimDetails.trim().length < 8) {
      setError('Please provide specific identifying detail (at least 8 characters).');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.createClaim({
        item_id: itemId,
        message: claimDetails.trim(),
        answer: claimAnswer.trim() || undefined
      });
      setClaimSuccess(true);
      setClaimOpen(false);
      loadItem();
    } catch (err: any) {
      setError(err.message || 'Could not submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="details-topline">
          <button className="back-link" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to the board
          </button>
        </div>
        <div className="empty-state">
          <h3>Looking through report details…</h3>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-wrap">
        <div className="details-topline">
          <button className="back-link" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to the board
          </button>
        </div>
        <div className="empty-state">
          <div className="empty-icon">
            <PackageCheck size={21} />
          </div>
          <h3>That report isn’t on the board</h3>
          <p>It may have been resolved, removed, or the link may be out of date.</p>
          <button className="button button-small" onClick={() => navigate('/')}>
            Explore reports
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && String(user.id) === String(item.user_id);
  const locationText = item.location_name || item.location_spot || 'RYMEC Campus Core';
  const matches = (item as any).potential_matches || (item as any).matches || [];

  return (
    <div className="page-wrap">
      {/* ── Top Line ── */}
      <div className="details-topline">
        <button className="back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to the board
        </button>
        <span>/</span>
        <span>Report details</span>
      </div>

      <div className="detail-layout">
        {/* Left Column: Photo & Suggested Matches */}
        <div>
          <div className="detail-photo">
            {item.image_path ? (
              <img 
                src={item.image_path} 
                alt={item.title} 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="image-fallback" aria-label="No photo provided">
                {item.category === 'Electronics' ? '📱' : item.category === 'Keys & cards' ? '🔑' : '◈'}
                <span className="tiny text-slate-400 mt-2 block">No photo provided</span>
              </div>
            )}
            <div className="detail-photo-caption">
              <TypePill kind={item.type} />
              <span className="tiny">
                {item.image_path ? 'Photo uploaded with notice' : 'No photo uploaded'}
              </span>
            </div>
          </div>

          {/* Potential Matches / Lookalikes */}
          {matches.length > 0 && (
            <section className="surface-card detail-card" style={{ marginTop: '14px' }}>
              <div className="match-note-top">
                <span className="match-mode">Suggested lookalikes · AI matching</span>
                <Sparkles size={16} />
              </div>
              <p className="field-hint">
                Suggestions compare category, nearby campus spot, timestamp delta, and semantic description.
              </p>
              <div className="match-list">
                {matches.map((m: any) => (
                  <div 
                    key={m.id} 
                    className="match-item"
                    onClick={() => navigate(`/items/${m.id}`)}
                  >
                    {m.image_path ? (
                      <img src={m.image_path} alt="" />
                    ) : (
                      <div className="match-thumb-fallback">◈</div>
                    )}
                    <span className="match-item-copy">
                      <strong>{m.title}</strong>
                      <span>{m.match_reason || `${m.category} · ${m.location_name || 'Campus'}`}</span>
                    </span>
                    <span className="match-score">
                      {Math.round((m.similarity_score || 0.85) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Copy & Claim Action */}
        <div className="detail-copy">
          <section className="surface-card detail-card">
            <div className="detail-title-row">
              <div>
                <TypePill kind={item.type} />
                <h1 style={{ marginTop: '8px' }}>{item.title}</h1>
              </div>
              <StatusPill status={item.status} />
            </div>

            <p className="detail-description">{item.description}</p>

            {/* Meta Grid */}
            <div className="detail-meta-grid">
              <div className="detail-meta">
                <MapPin size={16} />
                <span>
                  Campus spot
                  <strong>{locationText}</strong>
                </span>
              </div>
              <div className="detail-meta">
                <Clock3 size={16} />
                <span>
                  Reported
                  <strong>{exactDate(item.created_at)}</strong>
                </span>
              </div>
              <div className="detail-meta">
                <Clock3 size={16} />
                <span>
                  {item.type === 'FOUND' ? 'Found around' : 'Last seen'}
                  <strong>{exactDate(item.event_time || item.created_at)}</strong>
                </span>
              </div>
              <div className="detail-meta">
                <ShieldCheck size={16} />
                <span>
                  Status
                  <strong>{item.status}</strong>
                </span>
              </div>
            </div>

            {/* Handover Code Banner (if matched / claim approved) */}
            {(item.status === 'CLAIMED' || item.status === 'MATCHED') && (
              <div className="notice-card" style={{ marginTop: '16px', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
                <QrCode size={18} className="text-emerald-400" />
                <div>
                  <strong className="text-white block">Handover In Progress</strong>
                  <span>Verify the 6-digit TOTP code in person at the campus security desk or via the Handover page.</span>
                </div>
              </div>
            )}

            {/* Claim Action Button */}
            {!isOwner && item.status === 'OPEN' && (
              <button
                className="button button-primary button-block detail-action"
                type="button"
                onClick={() => setClaimOpen(!claimOpen)}
              >
                <MessageCircle size={15} />
                <span>{claimSuccess ? 'Claim submitted · awaiting review' : 'I think this is mine'}</span>
              </button>
            )}

            {isOwner && (
              <div className="notice-card" style={{ marginTop: '16px' }}>
                <ShieldCheck size={16} />
                <span>You posted this report. You can track incoming claims in your My Items tab.</span>
              </div>
            )}

            {/* Inline Claim Submission Form */}
            {claimOpen && !isOwner && (
              <form className="claim-form" onSubmit={submitClaim}>
                <h3>Help verify ownership</h3>
                <p className="field-hint">
                  Share a distinctive identifying detail not mentioned in the public description (e.g. serial number, lockscreen image, contents).
                </p>

                {error && <span className="field-error">{error}</span>}

                {/* Secret Question if Finder configured one */}
                {item.secret_question && (
                  <div className="form-field full">
                    <label className="text-amber-300 font-bold">
                      Finder's Verification Question: “{item.secret_question}”
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your answer to this question..."
                      value={claimAnswer}
                      onChange={(e) => setClaimAnswer(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-field full">
                  <label>Your identifying proof / details</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe specific markings, stickers, or internal contents..."
                    value={claimDetails}
                    onChange={(e) => setClaimDetails(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    className="button button-quiet button-small"
                    onClick={() => setClaimOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-primary button-small"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Send verification claim'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Institutional Custody Card */}
          <div className="surface-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} className="text-emerald-400" />
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>Institutional Safe Handover</h4>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5' }}>
              Handovers can take place at the Main Security Gate or Library Circulation Counter. Always inspect property before exchanging 6-digit confirmation codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
