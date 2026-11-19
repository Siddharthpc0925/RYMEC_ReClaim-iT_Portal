import React, { useEffect, useState } from 'react';
import { ArrowUpRight, PackageCheck, Search, Sparkles, ShieldCheck } from 'lucide-react';
import { ItemCard, StatusPill } from '../components/items/ItemCard';
import { SearchBar, FilterState } from '../components/items/SearchBar';
import { api } from '../lib/api';
import { Item, Location } from '../types';

const DEFAULT_FILTERS: FilterState = {
  query: '',
  kind: 'all',
  category: 'all',
  location: 'all',
  recency: 'all',
  claimState: 'all'
};

interface HomeProps {
  navigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    Promise.all([
      api.getItems().catch(() => ({ items: [] })),
      api.getLocations().catch(() => ({ locations: [] }))
    ]).then(([itemsRes, locsRes]) => {
      if (!alive) return;
      setItems(itemsRes.items || []);
      setLocations(locsRes.locations || []);
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  // Filter items client-side
  const filteredItems = items.filter((item) => {
    // Kind filter
    if (filters.kind !== 'all') {
      if (item.type.toLowerCase() !== filters.kind.toLowerCase()) return false;
    }

    // Category filter
    if (filters.category !== 'all') {
      if (item.category !== filters.category) return false;
    }

    // Location filter
    if (filters.location !== 'all') {
      const locText = (item.location_name || item.location_spot || '').toLowerCase();
      if (!locText.includes(filters.location.toLowerCase())) return false;
    }

    // Recency filter
    if (filters.recency !== 'all') {
      const itemTime = new Date(item.created_at || item.event_time).getTime();
      const now = Date.now();
      const diffHours = (now - itemTime) / (1000 * 60 * 60);
      if (filters.recency === 'today' && diffHours > 24) return false;
      if (filters.recency === 'week' && diffHours > 24 * 7) return false;
      if (filters.recency === 'month' && diffHours > 24 * 30) return false;
    }

    // Claim state filter
    if (filters.claimState !== 'all') {
      if (filters.claimState === 'none' && (item.claims_count || 0) > 0) return false;
      if (filters.claimState === 'pending' && (!item.claims_count || item.claims_count === 0)) return false;
      if (filters.claimState === 'approved' && item.status !== 'CLAIMED' && item.status !== 'RETURNED') return false;
    }

    // Query search
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLoc = (item.location_name || item.location_spot || '').toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchCat) return false;
    }

    return true;
  });

  const activeReports = items.filter((i) => i.status === 'OPEN' || i.status === 'MATCHED').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;
  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const claimsCount = items.filter((i) => (i.claims_count || 0) > 0).length;

  return (
    <div className="page-wrap">
      {/* ── Reference Home Hero ── */}
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">RYMEC lost &amp; found · live board</p>
          <h1>
            Search campus.<br />
            <span>Skip the group-chat scroll.</span>
          </h1>
          <p className="lead">
            Lost something between classes at RYMEC? Found a small piece of somebody’s day? Put it on the board and help it find its way back.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => navigate('/report-lost')}
            >
              <Search size={15} />
              <span>I lost something</span>
            </button>
            <button
              className="button"
              type="button"
              onClick={() => navigate('/report-found')}
            >
              <PackageCheck size={15} />
              <span>I found something</span>
            </button>
          </div>
        </div>

        <div className="hero-art" aria-label={`${activeReports} active reports on the RYMEC campus board`}>
          <span className="hero-count">
            <span className="footer-signal" />
            Campus board · RYMEC live
          </span>
          <strong>{activeReports} active reports</strong>
          <span>{foundCount} found · {lostCount} still looking</span>
        </div>
      </section>

      {/* ── Around Campus Board ── */}
      <section aria-labelledby="board-title">
        <div className="section-heading">
          <div>
            <h2 id="board-title">Around campus</h2>
            <p>Reports shared by RYMEC students &amp; faculty, sorted by newest first.</p>
          </div>
          <span className="status-pill status-active">
            <span className="status-dot" />
            {claimsCount} claim(s) active
          </span>
        </div>

        <SearchBar
          filters={filters}
          onChange={setFilters}
          locations={locations}
        />

        <div className="feed-layout">
          <div>
            <div className="result-caption">
              <span>
                {loading
                  ? 'Looking through the board…'
                  : `${filteredItems.length} ${filteredItems.length === 1 ? 'report' : 'reports'} found`}
              </span>
              <span>Photos when available + details · Ballari Campus</span>
            </div>

            <div className="feed-list">
              {!loading &&
                filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => navigate(`/items/${item.id}`)}
                  />
                ))}

              {!loading && filteredItems.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Search size={21} />
                  </div>
                  <h3>No reports match those filters</h3>
                  <p>Try another keyword, clear campus spot filters, or check all categories.</p>
                  <button
                    className="button button-small"
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Feed Aside ── */}
          <aside className="feed-aside" aria-label="Board information">
            <section className="surface-card match-note">
              <div className="match-note-top">
                <span className="match-mode">Match hints</span>
                <Sparkles size={16} />
              </div>
              <h3>Lookalikes, surfaced.</h3>
              <p>
                RYMEC ReClaim-iT compares item details, colors, campus spots, and images to suggest reports that might be connected.
              </p>
              <button
                className="button button-small button-block"
                type="button"
                onClick={() => navigate('/report-lost')}
              >
                <span>Add a lost-item report</span>
                <ArrowUpRight size={13} />
              </button>
            </section>

            <div className="stat-strip" aria-label="Campus board counts">
              <div className="stat-row">
                <span>Found and waiting</span>
                <strong>{foundCount}</strong>
              </div>
              <div className="stat-row">
                <span>Still looking</span>
                <strong>{lostCount}</strong>
              </div>
              <div className="stat-row">
                <span>Handover desks</span>
                <strong>4 Kiosks</strong>
              </div>
            </div>

            <div className="surface-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>Safe Handover Desks</h4>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Drop items at Main Gate Security, Central Library Desk, or Admin Reception for 24/7 safe custody.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
