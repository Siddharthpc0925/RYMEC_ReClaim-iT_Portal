import React, { useEffect, useState } from 'react';
import { ArrowUpRight, PackageCheck, Search, ShieldCheck, Compass } from 'lucide-react';
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
      const selected = filters.category.toLowerCase();
      const itemCat = (item.category || '').toLowerCase();
      const matchDirect = itemCat === selected;
      const matchPartial = selected.includes(itemCat) || itemCat.includes(selected);
      const keywords = selected.split(/[\s,&/]+/).filter(w => w.length > 2);
      const matchKeyword = keywords.some(k => itemCat.includes(k));
      if (!matchDirect && !matchPartial && !matchKeyword) return false;
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
          <p className="eyebrow">Institutional Lost &amp; Found Registry · Ballari</p>
          <h1>
            Search campus lost &amp; found.<br />
            <span>Direct recovery across RYMEC Ballari.</span>
          </h1>
          <p className="lead">
            Report misplaced personal property or check custody safe drop desks at RYMEC. Automated match engine pairs corresponding reports.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => navigate('/report-lost')}
            >
              <Search size={15} />
              <span>Report lost item</span>
            </button>
            <button
              className="button"
              type="button"
              onClick={() => navigate('/report-found')}
            >
              <PackageCheck size={15} />
              <span>Report found item</span>
            </button>
          </div>
        </div>

        <div className="hero-art" aria-label={`${activeReports} active reports on the RYMEC campus board`}>
          <div className="hero-count">
            <span className="status-dot" style={{ background: '#10b981' }} />
            <span>Active registry status</span>
          </div>
          <div>
            <strong>{activeReports} reports</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              {foundCount} found items in custody · {lostCount} open searches
            </p>
          </div>
        </div>
      </section>

      {/* ── Around Campus Board ── */}
      <section aria-labelledby="board-title">
        <div className="section-heading">
          <div>
            <h2 id="board-title">Campus item directory</h2>
            <p>Verified institutional reports ordered by latest submission.</p>
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
                  ? 'Accessing registry...'
                  : `${filteredItems.length} ${filteredItems.length === 1 ? 'report' : 'reports'} listed`}
              </span>
              <span>Ballari Campus · Zone verified</span>
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
                    <Search size={20} />
                  </div>
                  <h3>No matching reports found</h3>
                  <p>Try modifying your search keywords or resetting filters.</p>
                  <button
                    className="button button-small"
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Feed Aside ── */}
          <aside className="feed-aside" aria-label="Board information">
            <section className="surface-card match-note">
              <div className="match-note-top">
                <span className="match-mode">Algorithmic matching</span>
                <Compass size={16} />
              </div>
              <h3>Explainable match engine</h3>
              <p>
                Calculates similarity across item category, primary color, campus zones, and timestamps to pair corresponding notices.
              </p>
              <button
                className="button button-small button-block"
                type="button"
                onClick={() => navigate('/report-lost')}
              >
                <span>Report lost item</span>
                <ArrowUpRight size={13} />
              </button>
            </section>

            <div className="stat-strip" aria-label="Campus board counts">
              <div className="stat-row">
                <span>Items in custody</span>
                <strong>{foundCount}</strong>
              </div>
              <div className="stat-row">
                <span>Open searches</span>
                <strong>{lostCount}</strong>
              </div>
              <div className="stat-row">
                <span>Handover desks</span>
                <strong>4 safe kiosks</strong>
              </div>
            </div>

            <div className="surface-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Safe Handover Desks</h4>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Custody drop locations at Main Gate Security, Central Library Desk, and Administrative Block.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
