// ============================================================================
// RYMEC ReClaim-iT: Pure Explainable Match Engine (U1)
// ============================================================================

const COLOR_SYNONYMS = {
  gray: 'grey',
  grey: 'grey',
  silver: 'grey',
  navy: 'blue',
  sky: 'blue',
  cyan: 'blue',
  blue: 'blue',
  tan: 'brown',
  khaki: 'brown',
  brown: 'brown',
  crimson: 'red',
  scarlet: 'red',
  maroon: 'red',
  red: 'red',
  gold: 'yellow',
  amber: 'yellow',
  yellow: 'yellow',
  emerald: 'green',
  olive: 'green',
  green: 'green',
  purple: 'violet',
  violet: 'violet',
  lavender: 'violet',
  pink: 'pink',
  rose: 'pink',
  black: 'black',
  charcoal: 'black',
  white: 'white',
  ivory: 'white'
};

const STOPWORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'near', 'by', 'with', 'and', 'or', 'of',
  'is', 'was', 'my', 'it', 'for', 'to', 'from', 'this', 'that', 'found', 'lost',
  'has', 'had', 'have', 'i', 'me', 'please', 'help', 'contact', 'yesterday'
]);

function normalizeColor(color) {
  if (!color) return '';
  const clean = color.trim().toLowerCase();
  for (const [key, normalized] of Object.entries(COLOR_SYNONYMS)) {
    if (clean.includes(key)) return normalized;
  }
  return clean;
}

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

function computeJaccardSimilarity(textA, textB) {
  const setA = new Set(tokenize(textA));
  const setB = new Set(tokenize(textB));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Compare a Lost item to a Found item and generate a score out of 100 with explainable reasons.
 * @param {Object} lostItem - { category, location_id, location_parent, occurred_at, colour, brand, title, description }
 * @param {Object} foundItem - { category, location_id, location_parent, occurred_at, colour, brand, title, description }
 * @returns {{ score: number, reasons: string[] }}
 */
function scoreMatch(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // 1. Category match (+30)
  if (lostItem.category && foundItem.category &&
      lostItem.category.trim().toLowerCase() === foundItem.category.trim().toLowerCase()) {
    score += 30;
    reasons.push('Same category (' + lostItem.category + ')');
  }

  // 2. Location match (+25 for same place, +12 for same parent zone)
  if (lostItem.location_id && foundItem.location_id && lostItem.location_id === foundItem.location_id) {
    score += 25;
    reasons.push('Exact location match');
  } else if (lostItem.location_parent && foundItem.location_parent &&
             lostItem.location_parent.trim().toLowerCase() === foundItem.location_parent.trim().toLowerCase()) {
    score += 12;
    reasons.push('Same campus zone (' + lostItem.location_parent + ')');
  }

  // 3. Date proximity
  if (lostItem.occurred_at && foundItem.occurred_at) {
    const lostDate = new Date(lostItem.occurred_at).getTime();
    const foundDate = new Date(foundItem.occurred_at).getTime();
    const diffDays = (foundDate - lostDate) / (1000 * 60 * 60 * 24);

    if (diffDays < -1) {
      // Penalty: found earlier than loss minus 1 day
      score -= 10;
      reasons.push('Date mismatch (found date precedes lost date)');
    } else if (diffDays >= -1 && diffDays <= 3) {
      score += 15;
      const dayDiffRounded = Math.max(0, Math.round(diffDays));
      reasons.push(dayDiffRounded === 0 ? 'Reported on the same day' : `Found ${dayDiffRounded} day(s) after loss`);
    } else if (diffDays > 3 && diffDays <= 7) {
      score += 8;
      const dayDiffRounded = Math.round(diffDays);
      reasons.push(`Found ${dayDiffRounded} days after loss`);
    }
  }

  // 4. Colour match (+10)
  const normLostColor = normalizeColor(lostItem.colour);
  const normFoundColor = normalizeColor(foundItem.colour);
  if (normLostColor && normFoundColor && normLostColor === normFoundColor) {
    score += 10;
    reasons.push('Matching colour (' + (lostItem.colour || foundItem.colour) + ')');
  }

  // 5. Brand match (+10)
  if (lostItem.brand && foundItem.brand) {
    const b1 = lostItem.brand.trim().toLowerCase();
    const b2 = foundItem.brand.trim().toLowerCase();
    if (b1 === b2 || b1.includes(b2) || b2.includes(b1)) {
      score += 10;
      reasons.push('Brand match (' + lostItem.brand + ')');
    }
  }

  // 6. Text similarity (up to +10)
  const textA = `${lostItem.title || ''} ${lostItem.description || ''}`;
  const textB = `${foundItem.title || ''} ${foundItem.description || ''}`;
  const sim = computeJaccardSimilarity(textA, textB);
  if (sim > 0.05) {
    const textPoints = Math.min(10, Math.round(sim * 10));
    if (textPoints > 0) {
      score += textPoints;
      reasons.push(`Description similarity (+${textPoints} pts)`);
    }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: finalScore,
    reasons
  };
}

module.exports = {
  scoreMatch,
  normalizeColor,
  computeJaccardSimilarity
};
