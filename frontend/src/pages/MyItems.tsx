import React, { useEffect, useState } from 'react';
import { 
  Archive, 
  ArrowUpRight, 
  Check, 
  Clock3, 
  MapPin, 
  PackageCheck, 
  ShieldCheck, 
  X,
  QrCode
} from 'lucide-react';
import { TypePill, StatusPill } from '../components/items/ItemCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Item, Claim } from '../types';

interface MyItemsProps {
  navigate: (route: string) => void;
}

export const MyItems: React.FC<MyItemsProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<Claim[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [view, setView] = useState<'all' | 'active' | 'resolved'>('all');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const [itemsRes, incomingRes, myClaimsRes] = await Promise.all([
        api.getItems({ my_items: 'true' }).catch(() => ({ items: [] })),
        api.getIncomingClaims().catch(() => ({ claims: [] })),
        api.getMyClaims().catch(() => ({ claims: [] }))
      ]);
      setMyItems(itemsRes.items || []);
      setIncomingClaims(incomingRes.claims || []);
      setMyClaims(myClaimsRes.claims || []);
    } catch (err: any) {
      setError(err.message || 'Could not load your items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateItemStatus = async (item: Item, newStatus: string) => {
    setBusyId(item.id);
    setError('');
    try {
      await api.updateItem(item.id, { status: newStatus });
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Could not update status');
    } finally {
      setBusyId('');
    }
  };

  const reviewClaim = async (claimId: string, decision: 'APPROVE' | 'REJECT') => {
    setBusyId(claimId);
    setError('');
    try {
      await api.decideClaim(claimId, decision);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Could not process claim');
    } finally {
      setBusyId('');
    }
  };

  const visibleReports = myItems.filter((item) => {
    if (view === 'all') return true;
    if (view === 'active') return item.status === 'OPEN' || item.status === 'MATCHED';
    if (view === 'resolved') return item.status === 'RETURNED' || item.status === 'ARCHIVED';
    return true;
  });

  const activeCount = myItems.filter((i) => i.status === 'OPEN' || i.status === 'MATCHED').length;
  const pendingClaims = incomingClaims.filter((c) => c.status === 'PENDING');

  return (
    <div className="page-wrap">
      {/* ── Page Header ── */}
      <header className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">Your campus activity</p>
          <h1>My items &amp; claims.</h1>
          <p className="lead">
            Keep an eye on your reports and the students who’ve shared a verification clue.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => navigate('/report-found')}
        >
          <PackageCheck size={15} />
          <span>Add a found item</span>
        </button>
      </header>

      {/* ── Statistics Strip ── */}
      <section className="dashboard-stats" aria-label="Your report statistics">
        <div className="dashboard-stat">
          <div>
            <span>Your reports</span>
            <strong>{myItems.length}</strong>
          </div>
          <Archive size={18} />
        </div>
        <div className="dashboard-stat">
          <div>
            <span>Still active</span>
            <strong>{activeCount}</strong>
          </div>
          <MapPin size={18} />
        </div>
        <div className="dashboard-stat">
          <div>
            <span>Claims to review</span>
            <strong>{pendingClaims.length}</strong>
          </div>
          <ShieldCheck size={18} />
        </div>
      </section>

      {error && (
        <div className="notice-card" role="alert" style={{ borderColor: 'rgba(255,135,144,0.3)', color: '#ff9a9f', marginBottom: '16px' }}>
          <ShieldCheck size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Your Reports Section ── */}
      <section aria-labelledby="reports-heading">
        <div className="dashboard-section-heading">
          <h2 id="reports-heading">Your reports</h2>
          <button className="back-link tiny" onClick={() => navigate('/')}>
            <span>Browse board</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="dashboard-tabs" role="tablist" aria-label="Filter your reports">
          {[
            ['all', 'All reports'],
            ['active', 'Active'],
            ['resolved', 'Resolved']
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              role="tab"
              aria-selected={view === val}
              className={`dashboard-tab${view === val ? ' active' : ''}`}
              onClick={() => setView(val as any)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="my-items-list">
          {visibleReports.map((item) => (
            <article className="my-item-row" key={item.id}>
              <div className="my-item-thumb">
                {item.image_path ? (
                  <img src={item.image_path} alt={item.title} />
                ) : (
                  <span>{item.category === 'Electronics' ? '📱' : '◈'}</span>
                )}
              </div>

              <div className="my-item-copy">
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                  <TypePill kind={item.type} />
                  <StatusPill status={item.status} />
                </div>
                <h3 onClick={() => navigate(`/items/${item.id}`)} style={{ cursor: 'pointer' }}>
                  {item.title}
                </h3>
                <div className="my-item-meta">
                  <span>
                    <MapPin size={11} className="inline mr-1" />
                    {item.location_name || item.location_spot || 'Campus'}
                  </span>
                  <span>
                    <Clock3 size={11} className="inline mr-1" />
                    {item.claims_count || 0} claim(s)
                  </span>
                </div>
              </div>

              <div className="my-item-actions">
                <button
                  className="button button-small"
                  type="button"
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  View report
                </button>
                <button
                  className="button button-small"
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() =>
                    updateItemStatus(item, item.status === 'RETURNED' ? 'OPEN' : 'RETURNED')
                  }
                >
                  {item.status === 'RETURNED' ? 'Reopen' : 'Mark resolved'}
                </button>
              </div>
            </article>
          ))}

          {!loading && visibleReports.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Archive size={20} />
              </div>
              <h3>No reports in this view</h3>
              <p>Reports you create on RYMEC ReClaim-iT will appear here with live claim updates.</p>
              <button
                className="button button-small"
                onClick={() => navigate('/report-lost')}
              >
                Report a lost item
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Claims on Your Reports ── */}
      <section aria-labelledby="claims-heading" style={{ marginTop: '30px' }}>
        <div className="dashboard-section-heading">
          <h2 id="claims-heading">Claims on your reports</h2>
          <span className="status-pill status-pending">{pendingClaims.length} pending</span>
        </div>

        <div className="my-items-list">
          {pendingClaims.map((claim) => (
            <article className="claim-preview" key={claim.id}>
              <p>
                <strong>{claim.claimant_name || 'A student'}</strong> submitted verification for{' '}
                <span 
                  className="text-emerald-400 font-bold cursor-pointer underline" 
                  onClick={() => navigate(`/items/${claim.item_id}`)}
                >
                  {claim.item_title || 'your reported item'}
                </span>
                <br />
                <span className="muted">“{claim.message || claim.verification_answers}”</span>
              </p>
              <div className="claim-actions">
                <button
                  className="button button-primary button-small"
                  type="button"
                  disabled={busyId === claim.id}
                  onClick={() => reviewClaim(claim.id, 'APPROVE')}
                >
                  <Check size={13} />
                  <span>Approve</span>
                </button>
                <button
                  className="button button-danger button-small"
                  type="button"
                  disabled={busyId === claim.id}
                  onClick={() => reviewClaim(claim.id, 'REJECT')}
                >
                  <X size={13} />
                  <span>Reject</span>
                </button>
              </div>
            </article>
          ))}

          {pendingClaims.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <ShieldCheck size={20} />
              </div>
              <h3>Nothing waiting for review</h3>
              <p>If another student submits a claim on your report, their verification detail will show up here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Claims You Submitted ── */}
      {myClaims.length > 0 && (
        <section aria-labelledby="your-claims-heading" style={{ marginTop: '30px' }}>
          <div className="dashboard-section-heading">
            <h2 id="your-claims-heading">Claims you submitted</h2>
          </div>
          <div className="my-items-list">
            {myClaims.map((claim) => (
              <article className="my-item-row" key={claim.id}>
                <div className="my-item-thumb">
                  <span>◈</span>
                </div>
                <div className="my-item-copy">
                  <StatusPill status={claim.status} label={`Claim ${claim.status}`} />
                  <h3 onClick={() => navigate(`/items/${claim.item_id}`)} style={{ cursor: 'pointer' }}>
                    {claim.item_title || 'Item claim'}
                  </h3>
                  <div className="my-item-meta">
                    <span>Submitted {new Date(claim.created_at).toLocaleDateString()}</span>
                    {claim.handover_code && (
                      <span className="text-emerald-400 font-mono font-bold">
                        Code: {claim.handover_code}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="button button-small"
                  type="button"
                  onClick={() => navigate(`/items/${claim.item_id}`)}
                >
                  <span>View</span>
                  <ArrowUpRight size={12} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Handover Notice */}
      <div className="notice-card" style={{ marginTop: '24px' }}>
        <QrCode size={16} />
        <span>
          When a claim is approved, the owner receives a 6-digit handover code. Verify this code in person at the campus security kiosk or via the Handover Desk.
        </span>
      </div>
    </div>
  );
};
