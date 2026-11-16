export type ItemType = 'LOST' | 'FOUND';
export type ItemStatus = 'OPEN' | 'MATCHED' | 'CLAIMED' | 'RETURNED' | 'ARCHIVED' | 'DONATED' | 'REMOVED';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  roll_no: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  points: number;
  fraud_claims: number;
  flagged: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  parent_zone: string;
  x: number;
  y: number;
}

export interface Item {
  id: string;
  user_id?: string | null;
  reporter_name?: string;
  reporter_roll?: string | null;
  reporter_phone?: string | null;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  colour: string;
  brand?: string | null;
  location_id?: string | null;
  location_name?: string;
  location_slug?: string;
  location_parent?: string;
  location_other?: string | null;
  occurred_at: string;
  image_path?: string | null;
  held_at?: string | null;
  verify_question?: string | null;
  is_anonymous: boolean;
  is_private?: boolean;
  id_roll_no?: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface MatchReason {
  score: number;
  reasons: string[];
}

export interface Match {
  id: string;
  score: number;
  reasons: string[];
  created_at: string;
  matchedItem: {
    id: string;
    title: string;
    category: string;
    type: ItemType;
    colour: string;
    location_name: string;
    image_path?: string;
    status: ItemStatus;
  } | null;
}

export interface Claim {
  id: string;
  item_id: string;
  item_title?: string;
  item_category?: string;
  item_colour?: string;
  item_location?: string;
  item_image?: string;
  item_status?: ItemStatus;
  claimant_id?: string;
  claimant_name?: string;
  claimant_roll?: string;
  message?: string;
  answer?: string;
  verify_question?: string;
  closeMatchHint?: boolean;
  status: ClaimStatus;
  handover_code?: string | null;
  handover_expires_at?: string | null;
  bothContactShared?: boolean;
  finderContact?: { name: string; phone?: string; email: string } | null;
  claimantContact?: { name: string; phone?: string; email: string } | null;
  created_at: string;
}

export interface CustodyEvent {
  id: string;
  item_id: string;
  claim_id?: string | null;
  actor_id?: string | null;
  action: string;
  note?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  is_me: boolean;
  body: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  keywords?: string | null;
  category?: string | null;
  location_id?: string | null;
  location_name?: string | null;
  created_at: string;
}

export interface Badge {
  user_id: string;
  badge: 'FIRST_RETURN' | 'HELPER' | 'CAMPUS_HERO';
  awarded_at: string;
}
