import React, { useState, useEffect } from 'react';
import { Award, Printer, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface CertificateProps {
  navigate: (route: string) => void;
}

export const Certificate: React.FC<CertificateProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError('Please sign in to view your Good Samaritan citation certificate.');
      setLoading(false);
      return;
    }

    api.getCertificate().then((res) => {
      setCertData(res.certificate);
    }).catch((err) => {
      setError(err.message || 'You must complete at least 1 item return to generate an official certificate.');
    }).finally(() => setLoading(false));
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center glass rounded-3xl animate-pulse text-xs text-slate-400">
        Generating official college citation credential...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-8 text-center glass rounded-3xl space-y-4">
        <Award className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Certificate Eligibility</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error}
        </p>
        <button
          onClick={() => navigate('/browse')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Action Header (no-print) */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-2 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Certificate Frame (U12) */}
      <div className="printable-card bg-slate-50 text-slate-900 p-10 sm:p-14 rounded-3xl border-8 border-double border-amber-600/60 shadow-2xl relative overflow-hidden space-y-8 text-center">
        {/* Decorative corner seals */}
        <div className="absolute top-4 left-4 text-xs font-serif text-amber-700 font-bold uppercase tracking-widest">
          RYMEC Ballari
        </div>
        <div className="absolute top-4 right-4 text-xs font-serif text-amber-700 font-bold uppercase tracking-widest">
          ID: {certData?.certificateId}
        </div>

        {/* Institution Header */}
        <div className="space-y-2 border-b-2 border-amber-600/30 pb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600 mx-auto shadow">
            <img src="/images/vvs-logo.jpg" alt="RYMEC" className="w-full h-full object-cover" />
          </div>
          <div className="text-xs font-bold tracking-widest text-slate-600 uppercase">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950">
            Rao Bahadur Y. Mahabaleswarappa Engineering College
          </h2>
          <div className="text-[11px] text-slate-600 font-medium">
            (Affiliated to Visvesvaraya Technological University, Belagavi & Approved by AICTE, New Delhi)
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="text-amber-700 font-bold text-xs uppercase tracking-widest">
            Citation of Honor & Civic Integrity
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 italic">
            Good Samaritan Campus Recognition
          </h1>
        </div>

        {/* Recipient Body */}
        <div className="space-y-4 max-w-xl mx-auto py-2">
          <p className="text-xs text-slate-600">This citation is proudly conferred upon</p>
          <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-serif border-b-2 border-slate-400 pb-1 inline-block px-8">
            {certData?.studentName}
          </div>
          <div className="text-xs font-mono font-bold text-slate-600">
            University Roll Number: {certData?.rollNumber}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
            In appreciation of outstanding personal honesty, civic responsibility, and active assistance in successfully locating, safeguarding, and returning lost campus property through the <span className="font-bold text-slate-900">RYMEC ReClaim-iT Portal</span>.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-3 bg-amber-500/10 rounded-2xl border border-amber-600/30 text-xs">
          <div>
            <div className="text-xl font-black text-slate-900">{certData?.itemsReturned}</div>
            <div className="text-[10px] uppercase font-bold text-slate-600">Items Returned</div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-700">{certData?.trustPoints}</div>
            <div className="text-[10px] uppercase font-bold text-slate-600">Trust Score Points</div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs max-w-lg mx-auto">
          <div className="space-y-1">
            <div className="font-serif italic font-bold text-sm text-slate-800">
              Dr. T. Hanumantha Reddy
            </div>
            <div className="text-[10px] text-slate-600">Principal, RYMEC Ballari</div>
          </div>

          <div className="space-y-1">
            <div className="font-serif italic font-bold text-sm text-slate-800">
              Campus Security & Proctor
            </div>
            <div className="text-[10px] text-slate-600">Student Welfare Officer</div>
          </div>
        </div>

        {/* Date & Official Validation Note */}
        <div className="text-[10px] text-slate-500 pt-4 flex items-center justify-between">
          <span>Issued Date: {certData?.issueDate}</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Official Campus Digital Credential
          </span>
        </div>
      </div>
    </div>
  );
};
