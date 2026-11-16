import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  Shield,
  HelpCircle,
  EyeOff,
  AlertCircle,
  Check,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { Location, ItemType } from '../types';
import { extractDominantColor } from '../lib/colorExtractor';
import { parseVoiceTranscript, isSpeechRecognitionSupported } from '../lib/voiceParser';
import { CampusMapSvg } from '../components/campus/CampusMapSvg';

interface ReportProps {
  navigate: (route: string) => void;
  defaultType?: ItemType;
  defaultLocationSlug?: string;
}

const CATEGORIES = [
  'ID card', 'Phone', 'Wallet', 'Keys', 'Bottle', 'Bag', 'Books',
  'Earphones', 'Laptop', 'Calculator', 'Umbrella', 'Clothing', 'Other'
];

export const Report: React.FC<ReportProps> = ({
  navigate,
  defaultType = 'LOST',
  defaultLocationSlug = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wallet');
  const [description, setDescription] = useState('');
  const [colour, setColour] = useState('Black');
  const [brand, setBrand] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationOther, setLocationOther] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [imagePath, setImagePath] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Found-specific fields
  const [heldAt, setHeldAt] = useState<'With me' | 'Security office' | 'Department office'>('With me');
  const [verifyQuestion, setVerifyQuestion] = useState('');
  const [verifyAnswer, setVerifyAnswer] = useState('');
  const [idRollNo, setIdRollNo] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Voice Recording State (U8)
  const [isRecording, setIsRecording] = useState(false);
  const [voiceParsed, setVoiceParsed] = useState<any>(null);

  // Duplicate Warning Modal (U15)
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  // Campus map expand
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    api.getLocations().then((res) => {
      const locs: Location[] = res.locations || [];
      setLocations(locs);
      if (defaultLocationSlug) {
        const found = locs.find((l) => l.slug === defaultLocationSlug);
        if (found) setLocationId(found.id);
      } else if (locs.length > 0 && !locationId) {
        setLocationId(locs[0].id);
      }
    }).catch(console.error);
  }, [defaultLocationSlug]);

  // Handle Photo selection and U7 Canvas Color Extraction
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast('Photo size exceeds 3 MB limit. Please select a smaller photo.', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setImagePath(previewUrl);

    // Extract dominant color automatically (U7)
    try {
      const detectedColor = await extractDominantColor(file);
      setColour(detectedColor);
      toast(`Dominant colour detected as "${detectedColor}" from photo.`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Voice Report (U8)
  const handleVoiceToggle = () => {
    if (!isSpeechRecognitionSupported()) {
      toast('Speech Recognition is not supported in this browser. Please use Chrome/Edge.', 'error');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast('Listening... Speak clearly (e.g. "I lost a black wallet near the library yesterday afternoon")', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const parsed = parseVoiceTranscript(transcript);
        setVoiceParsed(parsed);
        setIsRecording(false);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
        toast('Voice transcription failed or was cancelled.', 'error');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const applyVoiceParsed = () => {
    if (!voiceParsed) return;
    if (voiceParsed.type) setType(voiceParsed.type);
    if (voiceParsed.category) setCategory(voiceParsed.category);
    if (voiceParsed.colour) setColour(voiceParsed.colour);
    if (voiceParsed.locationSlug) {
      const matchLoc = locations.find((l) => l.slug === voiceParsed.locationSlug);
      if (matchLoc) setLocationId(matchLoc.id);
    }
    if (!title && voiceParsed.category) {
      setTitle(`${voiceParsed.colour || ''} ${voiceParsed.category}`.trim());
    }
    setDescription(voiceParsed.transcript);
    setVoiceParsed(null);
    toast('Voice details applied to form fields!', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast('Please sign in with your student or staff credentials to report.', 'error');
      navigate('/login');
      return;
    }

    if (!title.trim() || !category || !description.trim()) {
      toast('Please fill out the title, category, and description.', 'error');
      return;
    }

    // Found validation (U4)
    if (type === 'FOUND' && category !== 'ID card' && (!verifyQuestion.trim() || !verifyAnswer.trim())) {
      toast('Please provide a secret verification question and answer to protect against false claims.', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type,
        title: title.trim(),
        category,
        description: description.trim(),
        colour,
        brand: brand.trim() || null,
        location_id: locationId || null,
        location_other: locationOther.trim() || null,
        occurred_at: occurredAt,
        image_path: imagePath || (type === 'LOST' ? '/images/rymec-building.png' : '/images/rymec-campus.png'),
        held_at: type === 'FOUND' ? heldAt : null,
        verify_question: type === 'FOUND' ? verifyQuestion.trim() : null,
        verify_answer: type === 'FOUND' ? verifyAnswer.trim() : null,
        is_anonymous: isAnonymous,
        id_roll_no: category === 'ID card' && type === 'FOUND' ? idRollNo.trim().toUpperCase() : null
      };

      const res = await api.createItem(payload);

      if (res.isPrivate) {
        toast('Found ID Card matched to student profile! Marked private and notified student directly.', 'success');
        navigate('/dashboard');
      } else {
        toast(`Report submitted successfully! Found ${res.matchesFound} potential matches.`, 'success');
        navigate(`/items/${res.item.id}`);
      }
    } catch (err: any) {
      // Check if duplicate report warning returned (U15)
      if (err.message && err.message.includes('Duplicate Report Warning')) {
        toast('A similar report was already detected.', 'error');
      } else {
        toast(err.message || 'Submission failed. Please check your inputs.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          File a Campus Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Structured reporting ensures swift verification, privacy protection, and automated match alerts.
        </p>
      </div>

      {/* Main Glass Form Card */}
      <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Lost / Found Segmented Slider Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Report Type
            </label>
            <div className="relative p-1 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 flex">
              <button
                type="button"
                onClick={() => setType('LOST')}
                className={`relative flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all z-10 flex items-center justify-center gap-2 ${
                  type === 'LOST' ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {type === 'LOST' && (
                  <motion.div
                    layoutId="reportTypeThumb"
                    className="absolute inset-0 bg-rose-500 rounded-xl shadow-lg"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  I Lost An Item
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType('FOUND')}
                className={`relative flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all z-10 flex items-center justify-center gap-2 ${
                  type === 'FOUND' ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {type === 'FOUND' && (
                  <motion.div
                    layoutId="reportTypeThumb"
                    className="absolute inset-0 bg-emerald-600 rounded-xl shadow-lg"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  I Found An Item
                </span>
              </button>
            </div>
          </div>

          {/* Voice Report Bar (U8) */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span>Voice Auto-Fill Assistant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                    Speech API
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap mic and speak your report naturally to populate form fields.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Listening...' : 'Start Voice Report'}</span>
            </button>
          </div>

          {/* Voice Parsed Confirmation Box */}
          {voiceParsed && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-400/40 text-xs space-y-2 text-indigo-200"
            >
              <div className="font-bold flex items-center justify-between">
                <span>Recognized Speech: "{voiceParsed.transcript}"</span>
                <button
                  type="button"
                  onClick={applyVoiceParsed}
                  className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-[11px]"
                >
                  Apply To Form
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                <div>Type: <span className="font-bold text-white">{voiceParsed.type || 'N/A'}</span></div>
                <div>Category: <span className="font-bold text-white">{voiceParsed.category || 'N/A'}</span></div>
                <div>Colour: <span className="font-bold text-white">{voiceParsed.colour || 'N/A'}</span></div>
                <div>Location: <span className="font-bold text-white">{voiceParsed.locationName || 'N/A'}</span></div>
              </div>
            </motion.div>
          )}

          {/* 2. Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Item Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. WildHorn Black Leather Wallet"
                required
                className="w-full glass-input px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* U2: If ID Card & Found -> Ask for Student Roll Number */}
          {type === 'FOUND' && category === 'ID card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Shield className="w-4 h-4" />
                <span>U2 Instant ID Notification Engine</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Enter the Roll Number printed on this student ID card (e.g. 3BR21CS001). The system will privately alert the student directly without publishing their identity or card publicly.
              </p>
              <input
                type="text"
                value={idRollNo}
                onChange={(e) => setIdRollNo(e.target.value)}
                placeholder="Enter Student Roll Number (e.g. 3BR21CS001)"
                className="w-full glass-input px-3.5 py-2 text-xs uppercase tracking-wide font-mono text-white placeholder:text-slate-500 focus:outline-none"
              />
            </motion.div>
          )}

          {/* 3. Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide distinctive marks, stickers, engraving, scratches, condition or context..."
              required
              className="w-full glass-input px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none"
            />
          </div>

          {/* 4. Colour, Brand & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dominant Colour *
              </label>
              <input
                type="text"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Black, Silver, Blue"
                required
                className="w-full glass-input px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Brand / Make (Optional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Casio, Dell, Milton"
                className="w-full glass-input px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Date & Time Occurred *
              </label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
                className="w-full glass-input px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Campus Location & Interactive Map Picker (U10) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Campus Location *
              </label>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs text-indigo-500 font-semibold hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                {showMapPicker ? 'Hide Campus Map' : 'Select on Interactive Campus Map'}
              </button>
            </div>

            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                  {loc.name} ({loc.parent_zone})
                </option>
              ))}
            </select>

            {/* Interactive SVG Map Picker */}
            {showMapPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2"
              >
                <CampusMapSvg
                  locations={locations}
                  selectedLocationId={locationId}
                  onSelectLocation={(loc) => setLocationId(loc.id)}
                />
              </motion.div>
            )}
          </div>

          {/* 6. Photo Upload with U7 Canvas Sampling */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload Item Photo (U7 Auto-Colour Detection)
            </label>
            <div className="p-4 rounded-2xl border-2 border-dashed border-white/20 glass hover:border-indigo-400 transition-colors flex flex-col sm:flex-row items-center gap-4">
              {photoPreview ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/20 flex-shrink-0">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  JPG, PNG or WEBP up to 3 MB. Canvas engine auto-detects dominant colour.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Found Items: Custody & Challenge Question (U4, C2, U14) */}
          {type === 'FOUND' && (
            <div className="p-5 rounded-3xl glass border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Found Item Custody & Verification Question (U4)</span>
              </div>

              {/* Held At */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Currently Held At *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['With me', 'Security office', 'Department office'] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHeldAt(h)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        heldAt === h
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenge Question & Answer */}
              {category !== 'ID card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <span>Verification Question *</span>
                      <span className="text-[10px] text-slate-400">(Visible to claimants)</span>
                    </label>
                    <input
                      type="text"
                      value={verifyQuestion}
                      onChange={(e) => setVerifyQuestion(e.target.value)}
                      placeholder="e.g. What is the lock-screen wallpaper?"
                      required={type === 'FOUND'}
                      className="w-full glass-input px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <span>Secret Answer *</span>
                      <span className="text-[10px] text-slate-400">(Stored as SHA-256 hash)</span>
                    </label>
                    <input
                      type="text"
                      value={verifyAnswer}
                      onChange={(e) => setVerifyAnswer(e.target.value)}
                      placeholder="e.g. Spider-Man poster"
                      required={type === 'FOUND'}
                      className="w-full glass-input px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Anonymous Drop-off Mode (U14) */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded bg-black/30 border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="anonCheck" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Post anonymously (Your name is hidden everywhere; holder is listed as Security Office)</span>
                </label>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] ${
                type === 'LOST'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25'
              }`}
            >
              {loading ? 'Submitting & Computing Matches...' : type === 'LOST' ? 'Publish Lost Item Report' : 'Register Found Item Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
