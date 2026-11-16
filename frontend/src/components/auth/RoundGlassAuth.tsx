import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  User,
  Hash,
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  Home as HomeIcon,
  CheckCircle2,
  Check,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { OtpOrbitVerification } from './OtpOrbitVerification';

interface RoundGlassAuthProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export type AuthMode = 'login' | 'register' | 'otp';

export const RoundGlassAuth: React.FC<RoundGlassAuthProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification State
  const [otpEmail, setOtpEmail] = useState('');

  // Login Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration Form Fields
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'STUDENT' as 'STUDENT' | 'FACULTY',
    usn_roll: '',
    email: '',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    accommodation: 'Day Scholar',
    designation: 'Assistant Professor',
    password: '',
    confirm_password: ''
  });

  if (!isOpen) return null;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Password Strength Meter
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score, text: 'Moderate', color: 'bg-amber-400' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-400' };
  };

  const pStrength = getPasswordStrength(formData.password);

  // 1. Password Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your College / Personal Email ID and password.');
      return;
    }
    setLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
      toast('Login successful! Welcome back.', 'success');
      onClose();
    } catch (err: any) {
      if (err.message && err.message.includes('verify your email')) {
        setOtpEmail(loginIdentifier.trim().toLowerCase());
        setMode('otp');
        toast('Please enter the 6-digit OTP sent to your registered email to verify.', 'info');
      } else {
        setError(err.message || 'Invalid credentials. Please verify and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Registration Submit with OTP Dispatch
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim() || !formData.usn_roll.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const finalEmail = formData.email.trim().toLowerCase();

      const res = await register({
        name: formData.full_name.trim(),
        full_name: formData.full_name.trim(),
        roll_no: formData.usn_roll.trim().toUpperCase(),
        usn_roll: formData.usn_roll.trim().toUpperCase(),
        email: finalEmail,
        password: formData.password,
        role: formData.role,
        branch: formData.branch,
        section: formData.section,
        academic_year: formData.academic_year,
        accommodation: formData.accommodation,
        hostel_block: formData.accommodation
      });

      const targetEmail = res.email || finalEmail;
      setOtpEmail(targetEmail);
      setMode('otp');
      toast(`The 6-digit code is sent to your entered email ID: ${targetEmail}`, 'success');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check roll number or employee ID.');
    } finally {
      setLoading(false);
    }
  };

  // 3. OTP Verification Submit
  const handleVerifyOtp = async (code: string) => {
    try {
      await verifyOtp(otpEmail, code);
      toast('Account verified successfully! You are now logged in.', 'success');
      onClose();
    } catch (err: any) {
      throw new Error(err.message || 'Invalid or expired OTP code.');
    }
  };

  // 4. Resend OTP Action
  const handleResendOtp = async () => {
    try {
      await resendOtp(otpEmail);
      toast(`A fresh verification OTP has been sent to ${otpEmail}.`, 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to resend OTP. Please wait a moment.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-2xl no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg ios-glass-card rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl text-white space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Institution Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 p-1 shadow-sm backdrop-blur-md">
              <img src="/images/vvs-logo.jpg" alt="RYMEC" className="w-full h-full object-contain rounded-xl" />
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            RYMEC <span className="text-brand-accent">ReClaim-iT</span>
          </h2>
          <p className="text-xs text-slate-300/80">
            Official Institutional Recovery & Identification Gateway
          </p>
        </div>

        {/* Mode Switcher Tabs (Only on Login/Register) */}
        {mode !== 'otp' && (
          <div className="flex rounded-2xl bg-black/30 p-1 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'ios-glass-btn-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-brand-royal text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Account
            </button>
          </div>
        )}

        {/* Step Indicator on Register */}
        {mode === 'register' && (
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-400/40 bg-sky-500/15 text-sky-300">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 text-navy-950 font-bold text-[10px]">
                1
              </span>
              Academic Details
            </span>
            <div className="w-4 h-px bg-white/20" />
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white font-bold text-[10px]">
                2
              </span>
              OTP Verification
            </span>
          </div>
        )}

        {/* Error Alert Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ─── 1. OTP ORBIT VERIFICATION VIEW ─── */}
        {mode === 'otp' ? (
          <div className="space-y-4">
            <OtpOrbitVerification
              email={otpEmail}
              title="Verify Email Address"
              subtitle={`The 6-digit code is sent to your entered email ID: ${otpEmail}`}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBack={() => setMode('register')}
            />
          </div>
        ) : mode === 'login' ? (
          /* ─── 2. CLEAN PASSWORD LOGIN VIEW ─── */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>College / Personal Email ID</span>
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. student@rymec.edu.in or your.name@gmail.com"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl ios-glass-btn-primary font-bold text-sm text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ─── 3. REGISTRATION VIEW (Student / Faculty, Accommodation, Branch) ─── */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Full Legal Name</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleFieldChange}
                placeholder="e.g. Rahul Patil"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            {/* Institutional Role Selector: ONLY Student or Faculty */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Institutional Role</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleFieldChange}
                className="w-full rounded-xl border border-white/15 bg-navy-900 py-2.5 px-3 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>

            {/* ─── STUDENT FIELDS ─── */}
            {formData.role === 'STUDENT' && (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <GraduationCap className="h-4 w-4" />
                  <span>Current Studying Details</span>
                </div>

                {/* Branch & Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Branch</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleFieldChange}
                      className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                    >
                      <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                      <option value="Data Science">Data Science (CSE-DS)</option>
                      <option value="CSE-Cyber Security">CSE-Cyber Security (CSE-CS)</option>
                      <option value="Information Science & Engineering">Information Science (ISE)</option>
                      <option value="Artificial Intelligence & ML">AI & Machine Learning (AIML)</option>
                      <option value="Electronics & Communication">Electronics & Comm. (ECE)</option>
                      <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Section</label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleFieldChange}
                      className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>
                </div>

                {/* Academic Year & Roll Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Academic Year</label>
                    <select
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleFieldChange}
                      className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Roll No / USN</label>
                    <input
                      type="text"
                      name="usn_roll"
                      required
                      value={formData.usn_roll}
                      onChange={handleFieldChange}
                      placeholder="e.g. 3BR21CS089"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 uppercase"
                    />
                  </div>
                </div>

                {/* Accommodation Box: Dayscholar, PG, Hostel */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <HomeIcon className="w-3 h-3 text-sky-400" />
                    <span>Accommodation</span>
                  </label>
                  <select
                    name="accommodation"
                    value={formData.accommodation}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
              </div>
            )}

            {/* ─── FACULTY FIELDS: Branch & Employee ID ─── */}
            {formData.role === 'FACULTY' && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Building2 className="h-4 w-4" />
                  <span>Faculty Department & Credentials</span>
                </div>

                {/* Faculty Branch Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Branch / Department</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleFieldChange}
                    className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Data Science">Data Science (CSE-DS)</option>
                    <option value="CSE-Cyber Security">CSE-Cyber Security (CSE-CS)</option>
                    <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML (AIML)</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                    <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Faculty / Employee ID</label>
                    <input
                      type="text"
                      name="usn_roll"
                      required
                      value={formData.usn_roll}
                      onChange={handleFieldChange}
                      placeholder="e.g. FAC-CSE-102"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleFieldChange}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Address with RYMEC-iSMART Dispatch Notice (Replaces Phone) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Email Address (College / Personal Gmail)</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleFieldChange}
                placeholder="e.g. student@rymec.edu.in or your.name@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                <span>OTP will be dispatched via RYMEC-iSMART</span>
                <span className="text-sky-300 font-mono">(rymec.ismart12@gmail.com)</span>
              </span>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleFieldChange}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleFieldChange}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${pStrength.score >= 1 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                  <div className={`h-full ${pStrength.score >= 2 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                  <div className={`h-full ${pStrength.score >= 3 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{pStrength.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl ios-glass-btn-primary font-bold text-sm text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Create Account & Send Verification OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Institutional Guarantee Note */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Official RYMEC-iSMART SMTP Gateway Security Protocol</span>
        </div>
      </motion.div>
    </div>
  );
};
