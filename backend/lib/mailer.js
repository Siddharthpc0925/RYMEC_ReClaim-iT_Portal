// ============================================================================
// RYMEC ReClaim-iT: Email Notification Service (C7 Mock / Console Logger)
// ============================================================================

function sendEmail({ to, subject, body, itemTitle, metadata = {} }) {
  console.log('\n============================================================');
  console.log('📧 [MOCK EMAIL DISPATCHED] ->', to);
  console.log('📌 SUBJECT:', subject);
  if (itemTitle) console.log('🏷️  ITEM:', itemTitle);
  console.log('📄 BODY:', body);
  if (Object.keys(metadata).length > 0) {
    console.log('⚙️  METADATA:', JSON.stringify(metadata, null, 2));
  }
  console.log('============================================================\n');
  return Promise.resolve({ success: true, to, timestamp: new Date().toISOString() });
}

module.exports = { sendEmail };
