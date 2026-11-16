import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Hash, 
  GraduationCap, 
  Building2, 
  Home as HomeIcon,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RegisterProps {
  navigate: (route: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ navigate }) => {
  const { register } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [accommodation, setAccommodation] = useState('Day Scholar');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim() || !email.trim() || !password.trim()) {
      toast('Please complete all mandatory registration fields.', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await register({
        name: name.trim(),
        full_name: name.trim(),
        roll_no: rollNo.trim().toUpperCase(),
        usn_roll: rollNo.trim().toUpperCase(),
        email: cleanEmail,
        password: password,
        role: role,
        branch: branch,
        section: section,
        academic_year: role === 'FACULTY' ? 'Faculty Member' : academicYear,
        accommodation: accommodation,
        hostel_block: accommodation
      });
      toast(`Verification code dispatched to ${cleanEmail}. Please verify.`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Registration failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 shadow-lg">
          <UserPlus className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Create RYMEC Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Join RYMEC ReClaim-iT to report, match, track, and recover campus belongings.
        </p>
      </div>

      {/* Registration Card */}
      <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        {/* Role Toggle: Student vs Faculty */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'STUDENT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('FACULTY')}
            className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'FACULTY'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Faculty</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Naik"
                required
                className="w-full glass-input pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {role === 'STUDENT' ? 'University Roll Number / USN *' : 'Faculty / Employee ID *'}
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder={role === 'STUDENT' ? 'e.g. 3BR22CS110' : 'e.g. FAC-CSE-102'}
                required
                className="w-full glass-input pl-10 pr-4 py-2 text-xs uppercase font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address (College / Personal Gmail) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@rymec.edu.in or your.name@gmail.com"
                required
                className="w-full glass-input pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              OTP will be dispatched via RYMEC-iSMART (rymec.ismart12@gmail.com)
            </span>
          </div>

          {/* Branch / Department Dropdown with Data Science and CSE-Cyber Security */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department / Branch *
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full glass-input px-3.5 py-2 text-xs text-slate-900 dark:text-white bg-slate-900/80 focus:outline-none cursor-pointer"
            >
              <option value="Computer Science & Engineering">Computer Science (CSE)</option>
              <option value="Data Science">Data Science (CSE-DS)</option>
              <option value="CSE-Cyber Security">CSE-Cyber Security (CSE-CS)</option>
              <option value="Information Science & Engineering">Information Science (ISE)</option>
              <option value="Artificial Intelligence & ML">AI & Machine Learning (AIML)</option>
              <option value="Electronics & Communication">Electronics & Comm. (ECE)</option>
              <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
              <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
              <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
            </select>
          </div>

          {/* Section & Academic Year (Student) */}
          {role === 'STUDENT' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-900/80 focus:outline-none"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-900/80 focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          )}

          {/* Accommodation Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HomeIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accommodation Type</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Day Scholar', 'PG', 'Hostel'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAccommodation(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    accommodation === type
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'glass text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full glass-input pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-black/10 dark:border-white/10">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-400 font-bold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
