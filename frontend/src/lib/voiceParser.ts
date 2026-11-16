// ============================================================================
// RYMEC ReClaim-iT: Voice Report Speech Recognition & NLP Extractor (U8)
// ============================================================================

export interface ParsedVoiceReport {
  transcript: string;
  type?: 'LOST' | 'FOUND';
  category?: string;
  colour?: string;
  locationName?: string;
  locationSlug?: string;
  relativeTime?: string;
}

const CATEGORIES = [
  'ID card', 'Phone', 'Wallet', 'Keys', 'Bottle', 'Bag', 'Books',
  'Earphones', 'Laptop', 'Calculator', 'Umbrella', 'Clothing', 'Other'
];

const COLORS = [
  'Black', 'Blue', 'Red', 'Silver', 'White', 'Green', 'Yellow',
  'Brown', 'Pink', 'Grey', 'Gold', 'Purple'
];

const LOCATIONS = [
  { name: 'Central Library', slug: 'library', keywords: ['library', 'reading room', 'study hall'] },
  { name: 'Campus Canteen', slug: 'canteen', keywords: ['canteen', 'cafeteria', 'juice shop', 'food'] },
  { name: 'Main Gate', slug: 'main-gate', keywords: ['main gate', 'arch', 'entrance', 'security'] },
  { name: 'Bus Bay', slug: 'bus-bay', keywords: ['bus bay', 'bus', 'parking', 'cycle stand'] },
  { name: 'Mechanical Block', slug: 'block-mech', keywords: ['mechanical', 'workshop', 'mech'] },
  { name: 'Electrical Block', slug: 'block-ee', keywords: ['electrical', 'electronics', 'ee', 'ec'] },
  { name: 'CS & IT Labs', slug: 'cs-it-labs', keywords: ['cs', 'it', 'computer lab', 'programming lab'] },
  { name: 'Auditorium', slug: 'auditorium', keywords: ['auditorium', 'visvesvaraya', 'seminar'] },
  { name: 'Sports Ground', slug: 'sports-ground', keywords: ['sports', 'ground', 'cricket', 'pavilion'] },
  { name: 'Hostel Road', slug: 'hostel-road', keywords: ['hostel', 'dorm', 'gym', 'mess'] }
];

export function parseVoiceTranscript(text: string): ParsedVoiceReport {
  const lower = text.toLowerCase();
  const result: ParsedVoiceReport = { transcript: text };

  // Detect Type
  if (lower.includes('lost') || lower.includes('misplaced') || lower.includes('forgot') || lower.includes('dropped')) {
    result.type = 'LOST';
  } else if (lower.includes('found') || lower.includes('picked up') || lower.includes('discovered')) {
    result.type = 'FOUND';
  }

  // Detect Category
  for (const cat of CATEGORIES) {
    const reg = new RegExp(`\\b${cat.toLowerCase()}\\b`, 'i');
    if (reg.test(lower)) {
      result.category = cat;
      break;
    }
  }

  // Detect Colour
  for (const col of COLORS) {
    const reg = new RegExp(`\\b${col.toLowerCase()}\\b`, 'i');
    if (reg.test(lower)) {
      result.colour = col;
      break;
    }
  }

  // Detect Campus Location
  for (const loc of LOCATIONS) {
    if (loc.keywords.some(kw => lower.includes(kw))) {
      result.locationName = loc.name;
      result.locationSlug = loc.slug;
      break;
    }
  }

  // Relative Time Extraction
  if (lower.includes('yesterday evening') || lower.includes('yesterday night')) {
    result.relativeTime = 'Yesterday Evening';
  } else if (lower.includes('yesterday morning')) {
    result.relativeTime = 'Yesterday Morning';
  } else if (lower.includes('this morning')) {
    result.relativeTime = 'Today Morning';
  } else if (lower.includes('today afternoon') || lower.includes('at lunch')) {
    result.relativeTime = 'Today Afternoon';
  } else if (lower.includes('an hour ago') || lower.includes('just now')) {
    result.relativeTime = 'Just Now';
  }

  return result;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}
