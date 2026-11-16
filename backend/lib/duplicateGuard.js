// ============================================================================
// RYMEC ReClaim-iT: Duplicate & Fraud Guard (U15)
// ============================================================================

const { computeJaccardSimilarity } = require('./matching');

// In-memory rate limiting counters
const reportTimestampsByUser = new Map(); // userId -> Array of timestamps
const claimTimestampsByUser = new Map();  // userId -> Array of timestamps

const MAX_REPORTS_PER_HOUR = 5;
const MAX_CLAIMS_PER_DAY = 10;
const FRAUD_FLAG_THRESHOLD = 3;

function checkReportRateLimit(userId) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const timestamps = (reportTimestampsByUser.get(userId) || []).filter(t => t > oneHourAgo);
  
  if (timestamps.length >= MAX_REPORTS_PER_HOUR) {
    return {
      allowed: false,
      error: `Rate limit reached: Maximum ${MAX_REPORTS_PER_HOUR} reports per hour allowed. Please try again later.`
    };
  }
  
  timestamps.push(now);
  reportTimestampsByUser.set(userId, timestamps);
  return { allowed: true };
}

function checkClaimRateLimit(userId) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const timestamps = (claimTimestampsByUser.get(userId) || []).filter(t => t > oneDayAgo);
  
  if (timestamps.length >= MAX_CLAIMS_PER_DAY) {
    return {
      allowed: false,
      error: `Daily limit reached: Maximum ${MAX_CLAIMS_PER_DAY} claims per day allowed.`
    };
  }
  
  timestamps.push(now);
  claimTimestampsByUser.set(userId, timestamps);
  return { allowed: true };
}

/**
 * Checks for near-duplicate active reports by the same user.
 * @param {string} userId 
 * @param {Object} newReport - { title, description, category }
 * @param {Array} existingReports 
 * @returns {{ isDuplicate: boolean, matchedItem?: Object, similarity: number }}
 */
function checkDuplicateReport(userId, newReport, existingReports) {
  const userOpenReports = existingReports.filter(
    item => item.user_id === userId &&
            item.status === 'OPEN' &&
            item.category && newReport.category &&
            item.category.toLowerCase() === newReport.category.toLowerCase()
  );

  const newText = `${newReport.title || ''} ${newReport.description || ''}`;

  for (const item of userOpenReports) {
    const existingText = `${item.title || ''} ${item.description || ''}`;
    const sim = computeJaccardSimilarity(newText, existingText);
    if (sim >= 0.8) {
      return {
        isDuplicate: true,
        matchedItem: item,
        similarity: sim
      };
    }
  }

  return { isDuplicate: false, similarity: 0 };
}

module.exports = {
  checkReportRateLimit,
  checkClaimRateLimit,
  checkDuplicateReport,
  FRAUD_FLAG_THRESHOLD
};
