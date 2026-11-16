const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../lib/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { sendEmailNotification, createProfessionalOtpTemplate } = require('../services/emailService');

// ──────────────────────────────────────────────────────────────
// POST /api/auth/register (With 6-Digit Email OTP Dispatch)
// ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      full_name,
      roll_no,
      usn_roll,
      email,
      phone,
      password,
      role = 'STUDENT',
      branch,
      section,
      academic_year,
      accommodation,
      hostel_block
    } = req.body;

    const resolvedName = (full_name || name || '').trim();
    const resolvedRoll = (usn_roll || roll_no || '').trim().toUpperCase();

    if (!resolvedName || !resolvedRoll || !password) {
      return res.status(400).json({ error: 'Full name, roll number/USN, and password are required.' });
    }

    const cleanRoll = resolvedRoll;
    const cleanEmail = (email || `${cleanRoll.toLowerCase()}@rymec.edu.in`).trim().toLowerCase();

    // Check duplicate roll number
    const existingRoll = db.profiles.find(p => p.roll_no === cleanRoll);
    if (existingRoll) {
      return res.status(400).json({ error: 'An account with this Roll Number/USN already exists.' });
    }

    // Check duplicate email
    const existingEmail = db.profiles.find(p => p.email === cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Generate 6-digit OTP
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    const newUser = {
      id: `user-${Date.now()}`,
      name: resolvedName,
      full_name: resolvedName,
      roll_no: cleanRoll,
      usn_roll: cleanRoll,
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      branch: branch || 'Computer Science & Engineering',
      section: section || 'A',
      academic_year: academic_year || '3rd Year',
      accommodation: accommodation || hostel_block || 'Day Scholar',
      password_hash: bcrypt.hashSync(password, 10),
      role: (role === 'ADMIN' || role === 'admin' || role === 'FACULTY' || role === 'faculty') ? 'FACULTY' : 'STUDENT',
      points: 0,
      fraud_claims: 0,
      flagged: false,
      is_verified: false,
      verification_code: verificationCode,
      created_at: new Date().toISOString()
    };

    db.profiles.push(newUser);

    // Send Real OTP Email via rymec.ismart12@gmail.com
    let emailResult = { emailSent: false };
    try {
      emailResult = await sendEmailNotification({
        to: cleanEmail,
        subject: 'Your Account Verification Code - RYMEC ReClaim-iT',
        eventType: 'otp',
        html: createProfessionalOtpTemplate({
          title: 'Account Verification Code',
          recipientName: resolvedName,
          code: verificationCode,
          purposeText: 'Thank you for registering on <strong>RYMEC ReClaim-iT</strong>. To verify your institutional credentials, enter this one-time verification code (OTP):'
        }),
        plainText: `Your RYMEC ReClaim-iT verification code is ${verificationCode}`
      });
    } catch (mailErr) {
      console.warn('Mail dispatch notice:', mailErr.message);
    }

    return res.status(201).json({
      message: `The 6-digit code is sent to your entered email ID: ${cleanEmail}`,
      email: cleanEmail,
      otpSent: true,
      needsVerification: true,
      emailSent: Boolean(emailResult && emailResult.emailSent)
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp (Validates OTP & Signs In)
// ──────────────────────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.profiles.find(p => p.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'Account not found with this email.' });
    }

    if (String(user.verification_code).trim() !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid verification OTP code. Please check and try again.' });
    }

    // Mark as verified
    user.is_verified = true;
    user.verification_code = null;

    const token = jwt.sign(
      { id: user.id, role: user.role, roll_no: user.roll_no },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeProfile = { ...user };
    delete safeProfile.password_hash;
    delete safeProfile.verification_code;

    return res.json({
      message: 'Email successfully verified! Welcome to RYMEC ReClaim-iT.',
      token,
      user: safeProfile
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ error: 'Server error during OTP verification: ' + err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp (Generates Fresh OTP & Sends)
// ──────────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const user = db.profiles.find(p => p.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'Account not found with this email.' });
    }

    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    user.verification_code = newCode;

    let emailResult = { emailSent: false };
    try {
      emailResult = await sendEmailNotification({
        to: cleanEmail,
        subject: 'Fresh Verification Code - RYMEC ReClaim-iT',
        eventType: 'otp',
        html: createProfessionalOtpTemplate({
          title: 'Fresh Verification Code',
          recipientName: user.name,
          code: newCode,
          purposeText: 'You requested a fresh verification code for <strong>RYMEC ReClaim-iT</strong>. Enter the one-time code below to complete verification:'
        }),
        plainText: `Your new RYMEC ReClaim-iT verification code is ${newCode}`
      });
    } catch (mailErr) {
      console.warn('Mail send error:', mailErr.message);
    }

    return res.json({
      message: `A fresh verification OTP has been sent to ${cleanEmail}. Please check your Gmail.`,
      emailSent: Boolean(emailResult && emailResult.emailSent)
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/send-login-otp (Passwordless / Instant OTP Login)
// ──────────────────────────────────────────────────────────────
router.post('/send-login-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or Roll Number is required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.profiles.find(
      p => p.email.toLowerCase() === cleanId || p.roll_no.toLowerCase() === cleanId
    );

    if (!user) {
      return res.status(404).json({ error: 'No account found matching this Email or Roll Number.' });
    }

    const loginCode = String(Math.floor(100000 + Math.random() * 900000));
    user.verification_code = loginCode;

    let emailResult = { emailSent: false };
    try {
      emailResult = await sendEmailNotification({
        to: user.email,
        subject: 'Login Security OTP - RYMEC ReClaim-iT',
        eventType: 'otp',
        html: createProfessionalOtpTemplate({
          title: 'Instant Sign-In Verification Code',
          recipientName: user.name,
          code: loginCode,
          purposeText: 'Here is your one-time verification code (OTP) to securely sign into your RYMEC ReClaim-iT portal account:'
        }),
        plainText: `Your RYMEC ReClaim-iT login OTP is ${loginCode}`
      });
    } catch (mailErr) {
      console.warn('Login OTP send error:', mailErr.message);
    }

    return res.json({
      message: `Login OTP sent to ${user.email}. Please check your Gmail.`,
      email: user.email,
      emailSent: Boolean(emailResult && emailResult.emailSent)
    });
  } catch (err) {
    console.error('Send login OTP error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/login (Standard Password Sign-In)
// ──────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Roll Number and password are required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.profiles.find(
      p => p.email.toLowerCase() === cleanId || p.roll_no.toLowerCase() === cleanId
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    if (user.is_verified === false) {
      return res.status(403).json({
        error: 'Please verify your email address with OTP to continue.',
        needsVerification: true,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, roll_no: user.roll_no },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeProfile = { ...user };
    delete safeProfile.password_hash;
    delete safeProfile.verification_code;

    return res.json({
      message: 'Login successful',
      token,
      user: safeProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const safeProfile = { ...req.user };
  delete safeProfile.password_hash;
  delete safeProfile.verification_code;

  const userBadges = db.badges.filter(b => b.user_id === req.user.id);
  const unreadNotifs = db.notifications.filter(n => n.user_id === req.user.id && !n.is_read).length;

  return res.json({
    user: safeProfile,
    badges: userBadges,
    unreadNotifications: unreadNotifs
  });
});

// ──────────────────────────────────────────────────────────────
// PUT /api/auth/change-password (Account Settings)
// ──────────────────────────────────────────────────────────────
router.put('/change-password', authenticate, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = db.profiles.find(p => p.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const isValid = bcrypt.compareSync(current_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    user.password_hash = bcrypt.hashSync(new_password, 10);
    return res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to change password: ' + err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// PUT /api/auth/profile (Update Profile in Account Settings)
// ──────────────────────────────────────────────────────────────
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, phone, branch, section, academic_year, accommodation } = req.body;
    const user = db.profiles.find(p => p.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
      user.full_name = name.trim();
    }
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;
    if (branch) user.branch = branch;
    if (section) user.section = section;
    if (academic_year) user.academic_year = academic_year;
    if (accommodation) {
      user.accommodation = accommodation;
      user.hostel_block = accommodation;
    }

    const safeProfile = { ...user };
    delete safeProfile.password_hash;
    delete safeProfile.verification_code;

    return res.json({ message: 'Profile updated successfully!', user: safeProfile });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

module.exports = router;
