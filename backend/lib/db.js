// ============================================================================
// RYMEC ReClaim-iT: In-Memory / Persisted Campus Data Store & Engine
// ============================================================================

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { scoreMatch } = require('./matching');
const { sendEmail } = require('./mailer');

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function sha256(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

function levenshteinDistance(a, b) {
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 1. Campus Locations
const locations = [
  { id: 'loc-1', slug: 'library', name: 'Central Library & Reading Hall', parent_zone: 'Academic Core', x: 28.5, y: 35.0 },
  { id: 'loc-2', slug: 'canteen', name: 'Campus Canteen & Cafeteria', parent_zone: 'Student Amenities', x: 62.0, y: 48.0 },
  { id: 'loc-3', slug: 'main-gate', name: 'RYMEC Main Arch Gate', parent_zone: 'Security & Entrance', x: 50.0, y: 92.0 },
  { id: 'loc-4', slug: 'bus-bay', name: 'College Bus Bay & Parking', parent_zone: 'Transit Zone', x: 82.0, y: 75.0 },
  { id: 'loc-5', slug: 'block-mech', name: 'Mechanical Block & Workshops', parent_zone: 'Engineering Wings', x: 22.0, y: 65.0 },
  { id: 'loc-6', slug: 'block-ee', name: 'Electrical & Electronics Block', parent_zone: 'Engineering Wings', x: 42.0, y: 60.0 },
  { id: 'loc-7', slug: 'cs-it-labs', name: 'CS & IT Laboratory Complex', parent_zone: 'Computing Center', x: 38.0, y: 25.0 },
  { id: 'loc-8', slug: 'auditorium', name: 'Sir M. Visvesvaraya Auditorium', parent_zone: 'Central Facility', x: 70.0, y: 28.0 },
  { id: 'loc-9', slug: 'sports-ground', name: 'Sports Pavilion & Cricket Ground', parent_zone: 'Athletics Zone', x: 80.0, y: 18.0 },
  { id: 'loc-10', slug: 'hostel-road', name: 'Hostel Avenue & Gym Block', parent_zone: 'Residential Zone', x: 15.0, y: 85.0 }
];

// 2. Profiles (Populated with Neon Cloud PostgreSQL Institutional Users)
const passwordAdmin = hashPassword('Admin@123');

const initialNeonUsers = [
  {
    id: 'user-admin',
    name: 'Campus Security Desk',
    full_name: 'Campus Security Desk',
    roll_no: 'ADM-001',
    usn_roll: 'ADM-001',
    email: 'admin@college.edu',
    password_hash: passwordAdmin,
    phone: '+91 94480 12345',
    role: 'ADMIN',
    points: 0,
    fraud_claims: 0,
    flagged: false,
    is_verified: true,
    verification_code: null,
    created_at: '2026-11-01T00:00:00.000Z'
  },
  {
    id: '1',
    name: 'Rahul Sharma',
    full_name: 'Rahul Sharma',
    roll_no: '3BR21CS045',
    usn_roll: '3BR21CS045',
    email: 'student.rahul@rymec.edu.in',
    password_hash: '$2a$10$PzOIMn0Nb.pwcG8zh7iuHOg.Nf7YvRd5enolejTnaoPWS.ZQCWTq2',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: 'Final Year (2025-2026)',
    accommodation: 'Aryabhata Block-B Room 304',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-01T14:23:47.825Z'
  },
  {
    id: '2',
    name: 'Prof. Anita Deshmukh',
    full_name: 'Prof. Anita Deshmukh',
    roll_no: 'FAC-002',
    usn_roll: 'FAC-002',
    email: 'lecturer.anita@rymec.edu.in',
    password_hash: '$2a$10$PzOIMn0Nb.pwcG8zh7iuHOg.Nf7YvRd5enolejTnaoPWS.ZQCWTq2',
    role: 'FACULTY',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    is_verified: true,
    verification_code: null,
    points: 20,
    created_at: '2026-11-01T14:23:48.425Z'
  },
  {
    id: '3',
    name: 'Dr. Mallikarjun G.',
    full_name: 'Dr. Mallikarjun G.',
    roll_no: 'WRD-003',
    usn_roll: 'WRD-003',
    email: 'warden.mallikarjun@rymec.edu.in',
    password_hash: '$2a$10$PzOIMn0Nb.pwcG8zh7iuHOg.Nf7YvRd5enolejTnaoPWS.ZQCWTq2',
    role: 'ADMIN',
    hostel_block: 'Aryabhata Boys Hostel Block-B',
    accommodation: 'Aryabhata Boys Hostel Block-B',
    is_verified: true,
    verification_code: null,
    points: 20,
    created_at: '2026-11-01T14:23:49.000Z'
  },
  {
    id: '4',
    name: 'Dr. Veerendra Kumar',
    full_name: 'Dr. Veerendra Kumar',
    roll_no: 'HOD-CSE',
    usn_roll: 'HOD-CSE',
    email: 'hod.cse@rymec.edu.in',
    password_hash: '$2a$10$PzOIMn0Nb.pwcG8zh7iuHOg.Nf7YvRd5enolejTnaoPWS.ZQCWTq2',
    role: 'ADMIN',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    is_verified: true,
    verification_code: null,
    points: 25,
    created_at: '2026-11-01T14:23:49.680Z'
  },
  {
    id: '5',
    name: 'Dr. Priya Kulkarni',
    full_name: 'Dr. Priya Kulkarni',
    roll_no: 'MNT-005',
    usn_roll: 'MNT-005',
    email: 'mentor.priya@rymec.edu.in',
    password_hash: '$2a$10$PzOIMn0Nb.pwcG8zh7iuHOg.Nf7YvRd5enolejTnaoPWS.ZQCWTq2',
    role: 'FACULTY',
    department: 'Student Welfare & Mentorship',
    is_verified: true,
    verification_code: null,
    points: 15,
    created_at: '2026-11-01T14:23:50.245Z'
  },
  {
    id: '6',
    name: 'Dr. T. Hanumantha Reddy',
    full_name: 'Dr. T. Hanumantha Reddy',
    roll_no: 'PRIN-001',
    usn_roll: 'PRIN-001',
    email: 'principal@rymec.edu.in',
    password_hash: '$2a$10$PzOIMn0Nb.pwcG8zh7iuHOg.Nf7YvRd5enolejTnaoPWS.ZQCWTq2',
    role: 'ADMIN',
    is_verified: true,
    verification_code: null,
    points: 50,
    created_at: '2026-11-01T14:23:50.990Z'
  },
  {
    id: '7',
    name: 'V NAGA PHANENDRA',
    full_name: 'V NAGA PHANENDRA',
    roll_no: '3VC24CS144',
    usn_roll: '3VC24CS144',
    email: 'naga.v.np.vakkalagadda.4532@gmail.com',
    password_hash: '$2a$10$E1FpxiPIKGgeRRsksNMro.Bl4cbTQwfqXmZw.P4u.sYfnZng.0puS',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'C',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    hostel_block: 'Day Scholar',
    is_verified: true,
    verification_code: '196946',
    points: 10,
    created_at: '2026-11-10T15:07:37.051Z'
  },
  {
    id: '8',
    name: 'Vikram Joshi',
    full_name: 'Vikram Joshi',
    roll_no: '3BR21CS108',
    usn_roll: '3BR21CS108',
    email: 'student.vikram1794669410796@rymec.edu.in',
    password_hash: '$2a$10$6eqEdqH2zMugidzYgaWaP.RGPY5pO1eTf3AfaOdy/pSnlg3nNFqdq',
    role: 'STUDENT',
    department: 'Artificial Intelligence & ML',
    branch: 'Artificial Intelligence & ML',
    section: 'A',
    academic_year: '4th Year',
    accommodation: 'Aryabhata Block-A',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-14T15:17:14.404Z'
  },
  {
    id: '9',
    name: 'DEMO',
    full_name: 'DEMO',
    roll_no: 'HOD-DEMO1',
    usn_roll: 'HOD-DEMO1',
    email: 'steven.steve.rogers.0207@gmail.com',
    password_hash: '$2a$10$2EVNt4kyUYia6oNbEJZhM.e1b/FuEGQ/xlndqy4/mm08KnxbjTw7y',
    role: 'ADMIN',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    is_verified: true,
    verification_code: null,
    points: 15,
    created_at: '2026-11-15T07:46:39.706Z'
  },
  {
    id: '10',
    name: 'DEMO',
    full_name: 'DEMO',
    roll_no: 'HOD-DEMO2',
    usn_roll: 'HOD-DEMO2',
    email: 'steven.steve.rogers0207@gmail.com',
    password_hash: '$2a$10$Fr8wPsIUh8ubXHORmN4JYOn4X1fjnmQ0YGFSPUILnCdEQymh9F6K.',
    role: 'ADMIN',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    is_verified: true,
    verification_code: null,
    points: 15,
    created_at: '2026-11-15T07:48:43.576Z'
  },
  {
    id: '13',
    name: 'CHINTU',
    full_name: 'CHINTU',
    roll_no: 'WRD-CHINTU',
    usn_roll: 'WRD-CHINTU',
    email: 'gopalvenu.k06@gmail.com',
    password_hash: '$2a$10$veJQNjiVvht2YZs/g.o.8ehslCNAFmqAeTA/CXDmeYKb2IA8omXO.',
    role: 'ADMIN',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    is_verified: false,
    verification_code: '886750',
    points: 5,
    created_at: '2026-11-15T08:44:10.668Z'
  },
  {
    id: '15',
    name: 'SUMANTH GODINAL',
    full_name: 'SUMANTH GODINAL',
    roll_no: '3VC24CS135',
    usn_roll: '3vc24cs135',
    email: 'sumanthgodinal369@gmail.com',
    password_hash: '$2a$10$ZWkO2WQyCWqUHjIti35CYehh37xsLTlN0ASHJV6YI0Pe.V.Xq3gLu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'C',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-15T08:56:32.587Z'
  },
  {
    id: '16',
    name: 'Akshay G',
    full_name: 'Akshay  G',
    roll_no: '3VC24CS007-OLD',
    usn_roll: '3vc24cs007',
    email: 'rymec/akshaygakshay24@gmail.com',
    password_hash: '$2a$10$FU1W6SZPwP42KMW7m.Ne3uJ.DtGB7gytLGT6b.2Lo/z9YVundT1vy',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'B',
    academic_year: '3rd Year',
    is_verified: false,
    verification_code: '353739',
    points: 5,
    created_at: '2026-11-15T12:53:24.523Z'
  },
  {
    id: '17',
    name: 'Test User',
    full_name: 'Test User',
    roll_no: '3BR21CS999',
    usn_roll: '3BR21CS999',
    email: 'testuser.demo@gmail.com',
    password_hash: '$2a$10$qUqx9g/cYt144hlHfyZeaO9UpDcwdGgOLzcqWamrBrs9q/dCUjJaK',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    is_verified: false,
    verification_code: '478098',
    points: 5,
    created_at: '2026-11-15T13:50:13.920Z'
  },
  {
    id: '18',
    name: 'Rohit Kumar',
    full_name: 'Rohit Kumar',
    roll_no: '3VC22CS075',
    usn_roll: '3VC22CS075',
    email: 'rohit.student.rymec@gmail.com',
    password_hash: '$2a$10$5C7DFhIylmYsSTKL6MBJROWZ/O7FzZDiiskaA9t7BH5qJIbycduPu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    is_verified: false,
    verification_code: '100558',
    points: 5,
    created_at: '2026-11-15T14:15:14.248Z'
  },
  {
    id: '19',
    name: 'Akshay G',
    full_name: 'Akshay G',
    roll_no: '3VC24CS007',
    usn_roll: '3vc24cs007',
    email: 'akshaygakshay24@gmail.com',
    password_hash: '$2a$10$Ss6RLQKsiAIC4igM6flfz.q4ucds6wpXSRnvuEGyiigBDbWpgH7au',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'B',
    academic_year: '3rd Year',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-16T08:05:00.167Z'
  },
  {
    id: '20',
    name: 'Shashank c',
    full_name: 'Shashank c',
    roll_no: '3VC24IS071',
    usn_roll: '3vc24is071',
    email: 'cshashank403@gmail.com',
    password_hash: '$2a$10$T/muw/oykcXTF./5LCDo9Oylu8xEfXdhbp1BYS9.157OmEKhHW8AO',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-16T13:23:24.703Z'
  },
  {
    id: '21',
    name: 'Akash',
    full_name: 'Akash',
    roll_no: '3VC24CI040',
    usn_roll: '3VC24CI040',
    email: 'akashagalur45@gmail.com',
    password_hash: '$2a$10$ceGS4zdLIGfTbc2zWNmYneeVhL3wJILK0XwS3Tuk5ceGY.6CIUkPO',
    role: 'STUDENT',
    department: 'Artificial Intelligence & ML',
    branch: 'Artificial Intelligence & ML',
    section: 'A',
    academic_year: '3rd Year',
    accommodation: 'PG',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-16T15:20:01.360Z'
  },
  {
    id: '22',
    name: 'Srujan Gondbal',
    full_name: 'Srujan Gondbal',
    roll_no: '3VC24IS077',
    usn_roll: '3vc24is077 ',
    email: 'srujangondbal584101@gmail.com',
    password_hash: '$2a$10$QHOWaqBF5R9.pgeY9Rp4dOGWmAG1jdZKiPxs3l.LVF8J4VrJtzokq',
    role: 'STUDENT',
    department: 'Information Science & Engineering',
    branch: 'Information Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    accommodation: 'PG',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-16T15:26:05.116Z'
  },
  {
    id: '23',
    name: 'VINAY REDDY.B',
    full_name: 'VINAY REDDY.B',
    roll_no: '3VC24CS149',
    usn_roll: '3VC24CS149',
    email: 'vinaybdh.rymec@gmail.com',
    password_hash: '$2a$10$ShHSSzRI5jmBUhgguEKMOu6vzGnfOEysr3cV4SgDkNsZfAWIyByAu',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'C',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    is_verified: true,
    verification_code: null,
    points: 10,
    created_at: '2026-11-17T08:07:30.266Z'
  }
];

const profiles = [...initialNeonUsers];

// 3. Badges Initial Table (Clean)
const badges = [];

// 4. Points Ledger (Clean)
const pointsLedger = [];

// 5. Items (Clean)
const items = [];

// 6. Pre-computed Matches (Clean)
const matches = [];

// 7. Claims (Clean)
const claims = [];

// 8. Custody Events (Clean)
const custodyEvents = [];

// 9. Messages (Clean)
const messages = [];

// 10. Saved Searches (Clean)
const savedSearches = [];

// 11. Notifications (Clean)
const notifications = [];

// 12. Abuse Reports (Clean)
const abuseReports = [];

// 13. Audit & Activity Logs (Records every user step with campus location)
const auditLogs = [
  {
    id: 'log-seed-1',
    timestamp: new Date().toISOString(),
    user_id: 'user-admin',
    user_name: 'Campus Security Desk',
    user_email: 'admin@college.edu',
    role: 'ADMIN',
    action: 'SYSTEM_STARTUP',
    location_name: 'RYMEC Main Arch Gate',
    campus_zone: 'Security & Entrance',
    details: 'Security desk monitoring initialized and online',
    ip_address: '10.37.146.1'
  }
];

function logUserActivity(payload) {
  const logEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    user_id: payload.user_id || 'guest',
    user_name: payload.user_name || 'Anonymous User',
    user_email: payload.user_email || 'N/A',
    role: payload.role || 'STUDENT',
    action: payload.action || 'PORTAL_ACTION',
    location_name: payload.location_name || 'Online Portal',
    campus_zone: payload.campus_zone || 'Campus Web Gateway',
    details: payload.details || '',
    ip_address: payload.ip_address || '127.0.0.1'
  };
  auditLogs.unshift(logEntry);
  if (auditLogs.length > 500) auditLogs.pop();
  return logEntry;
}

// Database Helper methods
const db = {
  locations,
  profiles,
  badges,
  pointsLedger,
  items,
  matches,
  claims,
  custodyEvents,
  messages,
  savedSearches,
  notifications,
  abuseReports,
  auditLogs,
  logUserActivity,

  // Public items view generator (filters private, masks anonymous)
  getPublicItems(currentUser = null) {
    return items
      .filter(item => {
        if (item.status === 'REMOVED') return false;
        if (item.is_private) {
          if (!currentUser) return false;
          const isAdmin = currentUser.role === 'ADMIN';
          const isOwner = item.user_id === currentUser.id;
          const isTargetedStudent = item.id_roll_no && item.id_roll_no === currentUser.roll_no;
          return isAdmin || isOwner || isTargetedStudent;
        }
        return true;
      })
      .map(item => {
        const loc = locations.find(l => l.id === item.location_id);
        const owner = profiles.find(p => p.id === item.user_id);
        const isAnon = Boolean(item.is_anonymous);
        const showOwner = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === item.user_id);

        return {
          id: item.id,
          user_id: isAnon && !showOwner ? null : item.user_id,
          reporter_name: isAnon && !showOwner ? 'Anonymous Student' : (owner ? owner.name : 'Campus Member'),
          reporter_roll: isAnon && !showOwner ? null : (owner ? owner.roll_no : null),
          type: item.type,
          title: item.title,
          category: item.category,
          description: item.description,
          colour: item.colour,
          brand: item.brand,
          location_id: item.location_id,
          location_name: loc ? loc.name : (item.location_other || 'Campus Grounds'),
          location_slug: loc ? loc.slug : 'general',
          location_parent: loc ? loc.parent_zone : 'Campus',
          location_other: item.location_other,
          occurred_at: item.occurred_at,
          image_path: item.image_path,
          held_at: item.held_at,
          verify_question: item.verify_question, // question is public
          is_anonymous: item.is_anonymous,
          is_private: item.is_private,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
  },

  getItemById(id, currentUser = null) {
    const item = items.find(i => i.id === id);
    if (!item) return null;
    if (item.status === 'REMOVED') return null;

    if (item.is_private) {
      if (!currentUser) return null;
      const isAdmin = currentUser.role === 'ADMIN';
      const isOwner = item.user_id === currentUser.id;
      const isTargeted = item.id_roll_no && item.id_roll_no === currentUser.roll_no;
      if (!isAdmin && !isOwner && !isTargeted) return null;
    }

    const loc = locations.find(l => l.id === item.location_id);
    const owner = profiles.find(p => p.id === item.user_id);
    const isAnon = Boolean(item.is_anonymous);
    const showOwner = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === item.user_id);

    return {
      ...item,
      reporter_name: isAnon && !showOwner ? 'Anonymous Student' : (owner ? owner.name : 'Campus Member'),
      reporter_roll: isAnon && !showOwner ? null : (owner ? owner.roll_no : null),
      reporter_phone: showOwner && owner ? owner.phone : null,
      location_name: loc ? loc.name : (item.location_other || 'Campus Grounds'),
      location_slug: loc ? loc.slug : 'general',
      location_parent: loc ? loc.parent_zone : 'Campus',
      // Strictly protect verify_answer_hash from client
      verify_answer_hash: undefined,
      id_roll_no: currentUser && (currentUser.role === 'ADMIN' || currentUser.roll_no === item.id_roll_no) ? item.id_roll_no : undefined
    };
  },

  // Run match engine when an item is created
  runMatchingForNewItem(newItem) {
    const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';
    const loc = locations.find(l => l.id === newItem.location_id);
    const candidates = items.filter(i => i.type === oppositeType && (i.status === 'OPEN' || i.status === 'MATCHED'));

    const createdMatches = [];

    for (const candidate of candidates) {
      const candLoc = locations.find(l => l.id === candidate.location_id);
      const lostItem = newItem.type === 'LOST' ? newItem : candidate;
      const foundItem = newItem.type === 'FOUND' ? newItem : candidate;

      const scored = scoreMatch(
        {
          ...lostItem,
          location_parent: (newItem.type === 'LOST' ? loc : candLoc)?.parent_zone
        },
        {
          ...foundItem,
          location_parent: (newItem.type === 'FOUND' ? loc : candLoc)?.parent_zone
        }
      );

      if (scored.score >= 50) {
        // Upsert match
        const existingIdx = matches.findIndex(
          m => m.lost_item_id === lostItem.id && m.found_item_id === foundItem.id
        );
        const matchObj = {
          id: existingIdx >= 0 ? matches[existingIdx].id : `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lost_item_id: lostItem.id,
          found_item_id: foundItem.id,
          score: scored.score,
          reasons: scored.reasons,
          created_at: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          matches[existingIdx] = matchObj;
        } else {
          matches.push(matchObj);
        }

        // Update item statuses to MATCHED if OPEN
        if (lostItem.status === 'OPEN') lostItem.status = 'MATCHED';
        if (foundItem.status === 'OPEN') foundItem.status = 'MATCHED';

        createdMatches.push(matchObj);

        // Notify both owners
        notifications.push({
          id: `notif-${Date.now()}-lost`,
          user_id: lostItem.user_id,
          message: `Match Found (${scored.score}%): A matching item "${foundItem.title}" was reported.`,
          link: `/items/${foundItem.id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });

        notifications.push({
          id: `notif-${Date.now()}-found`,
          user_id: foundItem.user_id,
          message: `Match Found (${scored.score}%): A matching report "${lostItem.title}" was reported.`,
          link: `/items/${lostItem.id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });

        // Mock email
        const lostOwner = profiles.find(p => p.id === lostItem.user_id);
        const foundOwner = profiles.find(p => p.id === foundItem.user_id);
        if (lostOwner) {
          sendEmail({
            to: lostOwner.email,
            subject: `[RYMEC ReClaim-iT] Possible Match for ${lostItem.title} (${scored.score}%)`,
            body: `A found item matching your lost report was posted. Reasons: ${scored.reasons.join(', ')}`,
            itemTitle: lostItem.title
          });
        }
        if (foundOwner) {
          sendEmail({
            to: foundOwner.email,
            subject: `[RYMEC ReClaim-iT] Match Notification (${scored.score}%)`,
            body: `A lost report matching your found item was registered.`,
            itemTitle: foundItem.title
          });
        }
      }
    }

    // U6: Match against saved searches if newItem is FOUND
    if (newItem.type === 'FOUND') {
      for (const search of savedSearches) {
        let matchesSearch = false;
        if (search.category && search.category.toLowerCase() === newItem.category.toLowerCase()) {
          matchesSearch = true;
        }
        if (search.location_id && search.location_id === newItem.location_id) {
          matchesSearch = true;
        }
        if (search.keywords && (
          newItem.title.toLowerCase().includes(search.keywords.toLowerCase()) ||
          newItem.description.toLowerCase().includes(search.keywords.toLowerCase())
        )) {
          matchesSearch = true;
        }

        if (matchesSearch) {
          notifications.push({
            id: `notif-${Date.now()}-watch`,
            user_id: search.user_id,
            message: `Watchlist Alert! A found item matching your saved alert "${search.keywords || search.category}" was posted.`,
            link: `/items/${newItem.id}`,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return createdMatches;
  },

  // Handover Verification (U3)
  verifyHandover(enteredCode, verifierUser) {
    const cleanCode = enteredCode.trim();
    const hash = sha256(cleanCode);
    const now = new Date();

    const claim = claims.find(c => c.handover_code_hash === hash && c.status === 'APPROVED');
    if (!claim) {
      return { success: false, error: 'Invalid handover code. Please check the 6-digit code or QR provided by claimant.' };
    }

    if (claim.handover_expires_at && new Date(claim.handover_expires_at) < now) {
      return { success: false, error: 'This handover code has expired (valid for 48 hours). Please request a new claim approval.' };
    }

    const item = items.find(i => i.id === claim.item_id);
    if (!item) {
      return { success: false, error: 'Associated item record not found.' };
    }

    // Update statuses
    item.status = 'RETURNED';
    item.updated_at = now.toISOString();

    // Log custody events
    custodyEvents.push({
      id: `ce-${Date.now()}-hv`,
      item_id: item.id,
      claim_id: claim.id,
      actor_id: verifierUser ? verifierUser.id : null,
      action: 'HANDOVER_VERIFIED',
      note: `6-digit handover code verified in person by ${verifierUser ? verifierUser.name : 'Desk Officer'}.`,
      created_at: now.toISOString()
    });

    custodyEvents.push({
      id: `ce-${Date.now()}-ret`,
      item_id: item.id,
      claim_id: claim.id,
      actor_id: claim.claimant_id,
      action: 'RETURNED',
      note: 'Item successfully returned to rightful owner. Case closed.',
      created_at: now.toISOString()
    });

    // U12: Award points and badges
    // Finder gets +20 points
    const finder = profiles.find(p => p.id === item.user_id);
    if (finder) {
      finder.points = (finder.points || 0) + 20;
      pointsLedger.push({
        id: `pl-${Date.now()}-f`,
        user_id: finder.id,
        reason: `Returned item: ${item.title} (+20 pts)`,
        points: 20,
        created_at: now.toISOString()
      });

      // Check badges for finder
      const totalReturns = pointsLedger.filter(p => p.user_id === finder.id && p.reason.startsWith('Returned item')).length;
      if (totalReturns >= 1 && !badges.some(b => b.user_id === finder.id && b.badge === 'FIRST_RETURN')) {
        badges.push({ user_id: finder.id, badge: 'FIRST_RETURN', awarded_at: now.toISOString() });
      }
      if (totalReturns >= 5 && !badges.some(b => b.user_id === finder.id && b.badge === 'HELPER')) {
        badges.push({ user_id: finder.id, badge: 'HELPER', awarded_at: now.toISOString() });
      }
      if (totalReturns >= 10 && !badges.some(b => b.user_id === finder.id && b.badge === 'CAMPUS_HERO')) {
        badges.push({ user_id: finder.id, badge: 'CAMPUS_HERO', awarded_at: now.toISOString() });
      }
    }

    // Claimant gets +2 points
    const claimant = profiles.find(p => p.id === claim.claimant_id);
    if (claimant) {
      claimant.points = (claimant.points || 0) + 2;
      pointsLedger.push({
        id: `pl-${Date.now()}-c`,
        user_id: claimant.id,
        reason: `Completed handover for: ${item.title} (+2 pts)`,
        points: 2,
        created_at: now.toISOString()
      });
    }

    // Notify parties
    notifications.push({
      id: `notif-${Date.now()}-ret1`,
      user_id: item.user_id,
      message: `🎉 Handover complete! "${item.title}" marked as RETURNED. You earned +20 points!`,
      link: `/items/${item.id}`,
      is_read: false,
      created_at: now.toISOString()
    });

    notifications.push({
      id: `notif-${Date.now()}-ret2`,
      user_id: claim.claimant_id,
      message: `🎉 You received "${item.title}". Thank you for using RYMEC ReClaim-iT!`,
      link: `/items/${item.id}`,
      is_read: false,
      created_at: now.toISOString()
    });

    return {
      success: true,
      item,
      claim,
      pointsAwarded: { finder: 20, claimant: 2 }
    };
  },

  // Asynchronous Neon Cloud PostgreSQL Integration Helpers
  async findUser(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();

    // 1. Try querying Neon Postgres live
    try {
      const p = getPool();
      if (p) {
        const res = await p.query(
          'SELECT * FROM public.users WHERE LOWER(TRIM(email)) = $1 OR LOWER(TRIM(usn_roll)) = $1 LIMIT 1',
          [clean]
        );
        if (res.rows.length > 0) {
          const profile = mapNeonRowToProfile(res.rows[0]);
          const idx = profiles.findIndex(u => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase());
          if (idx >= 0) {
            profiles[idx] = { ...profiles[idx], ...profile };
            return profiles[idx];
          } else {
            profiles.push(profile);
            return profile;
          }
        }
      }
    } catch (err) {
      // Offline or network error: fallback gracefully
    }

    // 2. Fallback to in-memory profiles (preloaded with all Neon database users)
    return profiles.find(
      p => (p.email && p.email.toLowerCase() === clean) ||
           (p.roll_no && p.roll_no.toLowerCase() === clean) ||
           (p.usn_roll && p.usn_roll.toLowerCase() === clean)
    ) || null;
  },

  async saveUserToDatabase(user) {
    // 1. Upsert into in-memory profiles immediately
    const existingIdx = profiles.findIndex(p => p.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      profiles[existingIdx] = { ...profiles[existingIdx], ...user };
    } else {
      profiles.push(user);
    }

    // 2. Persist to Neon Postgres
    try {
      const p = getPool();
      if (p) {
        let dbRole = 'student';
        const r = (user.role || '').toLowerCase();
        if (r === 'admin') dbRole = 'principal';
        else if (r === 'faculty') dbRole = 'lecturer';
        else if (['student', 'lecturer', 'warden', 'hod', 'mentor', 'principal'].includes(r)) dbRole = r;

        const res = await p.query(
          `INSERT INTO public.users (
            full_name, email, password_hash, role, usn_roll, department, branch, section, academic_year, hostel_block, is_verified, verification_code, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            password_hash = EXCLUDED.password_hash,
            usn_roll = EXCLUDED.usn_roll,
            branch = EXCLUDED.branch,
            is_verified = EXCLUDED.is_verified,
            verification_code = EXCLUDED.verification_code,
            updated_at = NOW()
          RETURNING *`,
          [
            user.name || user.full_name,
            user.email.toLowerCase().trim(),
            user.password_hash,
            dbRole,
            user.roll_no || user.usn_roll,
            user.department || user.branch || 'Computer Science & Engineering',
            user.branch || 'Computer Science & Engineering',
            user.section || 'A',
            user.academic_year || '3rd Year',
            user.accommodation || user.hostel_block || 'Day Scholar',
            Boolean(user.is_verified),
            user.verification_code || null
          ]
        );
        if (res.rows.length > 0) {
          const saved = mapNeonRowToProfile(res.rows[0]);
          user.id = saved.id;
        }
      }
    } catch (err) {
      console.warn('[DB] Live Neon insert warning:', err.message);
    }
    return user;
  },

  async updateUserVerification(email, isVerified, verificationCode) {
    const cleanEmail = email.toLowerCase().trim();
    const user = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (user) {
      user.is_verified = isVerified;
      user.verification_code = verificationCode;
    }

    try {
      const p = getPool();
      if (p) {
        await p.query(
          'UPDATE public.users SET is_verified = $1, verification_code = $2, updated_at = NOW() WHERE LOWER(TRIM(email)) = $3',
          [Boolean(isVerified), verificationCode || null, cleanEmail]
        );
      }
    } catch (err) {
      console.warn('[DB] Update verification in Neon warning:', err.message);
    }
    return user;
  },

  async getAllDatabaseUsers() {
    try {
      const p = getPool();
      if (p) {
        const res = await p.query(
          'SELECT id, full_name, email, role, usn_roll, department, branch, section, academic_year, hostel_block, is_verified, created_at FROM public.users ORDER BY id ASC'
        );
        if (res.rows.length > 0) {
          return res.rows.map(mapNeonRowToProfile);
        }
      }
    } catch (err) {
      console.warn('[DB] getAllDatabaseUsers Neon query warning:', err.message);
    }
    return profiles;
  }
};

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Pfy0XE7TnhMN@ep-raspy-river-ar9edhbp-pooler.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require';

let pool = null;
function getPool() {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        max: 5
      });
      pool.on('error', (err) => {
        console.warn('[Postgres Pool Warning]:', err.message);
      });
    } catch (e) {
      console.warn('[Postgres Pool Init Error]:', e.message);
    }
  }
  return pool;
}

function normalizeRole(role) {
  const r = (role || '').toLowerCase();
  if (['admin', 'principal', 'hod', 'warden'].includes(r)) return 'ADMIN';
  if (['lecturer', 'mentor', 'faculty'].includes(r)) return 'FACULTY';
  return 'STUDENT';
}

function mapNeonRowToProfile(row) {
  return {
    id: String(row.id),
    name: row.full_name,
    full_name: row.full_name,
    roll_no: (row.usn_roll || (row.email ? row.email.split('@')[0] : `USER-${row.id}`)).trim().toUpperCase(),
    usn_roll: (row.usn_roll || (row.email ? row.email.split('@')[0] : `USER-${row.id}`)).trim().toUpperCase(),
    email: (row.email || '').toLowerCase().trim(),
    password_hash: row.password_hash,
    phone: row.phone || null,
    role: normalizeRole(row.role),
    original_role: row.role,
    department: row.department,
    branch: row.branch || row.department || 'Computer Science & Engineering',
    section: row.section || 'A',
    academic_year: row.academic_year || '3rd Year',
    accommodation: row.hostel_block || 'Day Scholar',
    points: 10,
    fraud_claims: 0,
    flagged: false,
    is_verified: row.is_verified === true || row.is_verified === 'true' || row.is_verified === 1,
    verification_code: row.verification_code || null,
    created_at: row.created_at || new Date().toISOString()
  };
}

module.exports = {
  db,
  sha256,
  levenshteinDistance
};
