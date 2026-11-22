import React from 'react';
import { Clock3, MapPin, Smartphone, KeyRound, Briefcase, Package } from 'lucide-react';
import { Item } from '../../types';

function relativeTime(value: string | number | Date | undefined): string {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const TypePill: React.FC<{ kind: 'LOST' | 'FOUND' | 'lost' | 'found' }> = ({ kind }) => {
  const isFound = String(kind).toUpperCase() === 'FOUND';
  return (
    <span className={`type-pill ${isFound ? 'type-found' : 'type-lost'}`}>
      {isFound ? 'Found' : 'Lost'}
    </span>
  );
};

export const StatusPill: React.FC<{ status: string; label?: string }> = ({ status, label }) => {
  const norm = String(status).toLowerCase();
  const text = label || (norm === 'returned' || norm === 'resolved' ? 'Resolved' : norm === 'matched' ? 'Matched' : 'Active');
  const visualState = ['pending', 'approved', 'rejected', 'resolved', 'returned'].includes(norm) 
    ? (norm === 'returned' ? 'resolved' : norm) 
    : 'active';

  return (
    <span className={`status-pill status-${visualState}`}>
      <span className="status-dot" />
      {text}
    </span>
  );
};

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const isFound = item.type === 'FOUND';
  const locationText = item.location_name || item.location_spot || (typeof item.location === 'string' ? item.location : 'Campus Grounds');

  return (
    <article className="item-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="item-card-link" aria-label={`${item.type} item: ${item.title}`}>
        <div className="item-card-image">
          {item.image_path ? (
            <img 
              src={item.image_path} 
              alt={item.title} 
              loading="lazy" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="image-fallback" aria-hidden="true">
              {item.category === 'Electronics' ? (
                <Smartphone size={24} />
              ) : item.category === 'Keys & cards' || item.category === 'ID card' ? (
                <KeyRound size={24} />
              ) : item.category === 'Bags & accessories' ? (
                <Briefcase size={24} />
              ) : (
                <Package size={24} />
              )}
            </div>
          )}
          <span className="image-type">
            {isFound ? 'Found' : 'Lost'}
          </span>
        </div>

        <div className="item-card-body">
          <div className="item-card-title-row">
            <h3>{item.title}</h3>
            <TypePill kind={item.type} />
          </div>

          <p className="item-card-description">{item.description}</p>

          <div className="item-card-meta">
            <span className="meta-part">
              <MapPin size={12} />
              <span>{locationText}</span>
            </span>
            <span className="meta-part">
              <Clock3 size={12} />
              <span>{relativeTime(item.created_at || item.event_time)}</span>
            </span>
          </div>

          <div className="item-card-meta item-card-bottom-meta" style={{ justifyContent: 'space-between' }}>
            <span>{item.category || 'General'}</span>
            <StatusPill 
              status={item.status} 
              label={
                item.status === 'RETURNED' || item.status === 'ARCHIVED' 
                  ? 'Resolved' 
                  : item.claims_count && item.claims_count > 0 
                    ? 'Claim pending' 
                    : 'Open'
              } 
            />
          </div>
        </div>
      </div>
    </article>
  );
};
