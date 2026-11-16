import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { api } from '../lib/api';

interface LeaderboardProps {
  navigate: (route: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ navigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then((res) => {
      setStudents(res.leaderboard || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>RYMEC Good Samaritan Roll of Honor (U12)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Monthly Integrity Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Recognizing students who uphold campus honesty through verified returns and mutual handovers.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {students.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
          {/* Rank 2 */}
          <div className="glass rounded-3xl p-5 border border-white/20 text-center space-y-3 order-2 sm:order-1">
            <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 font-black text-lg flex items-center justify-center mx-auto border border-slate-400/40">
              #2
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{students[1]?.displayName}</h3>
              <p className="text-xs text-slate-400">{students[1]?.returnsCount || 0} Successful Returns</p>
            </div>
            <div className="text-lg font-black text-slate-200">{students[1]?.points || 0} pts</div>
          </div>

          {/* Rank 1 (Tallest) */}
          <div className="glass rounded-[32px] p-6 border-2 border-amber-400/50 shadow-2xl text-center space-y-3 order-1 sm:order-2 bg-amber-500/10 sm:-translate-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Monthly Campus Champion
              </span>
              <h3 className="font-black text-base sm:text-lg text-white mt-1">
                {students[0]?.displayName}
              </h3>
              <p className="text-xs text-amber-200/80">{students[0]?.returnsCount || 0} Verified Returns</p>
            </div>
            <div className="text-2xl font-black text-amber-400">{students[0]?.points || 0} pts</div>
          </div>

          {/* Rank 3 */}
          <div className="glass rounded-3xl p-5 border border-white/20 text-center space-y-3 order-3">
            <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-500 font-black text-lg flex items-center justify-center mx-auto border border-amber-600/40">
              #3
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{students[2]?.displayName}</h3>
              <p className="text-xs text-slate-400">{students[2]?.returnsCount || 0} Successful Returns</p>
            </div>
            <div className="text-lg font-black text-slate-200">{students[2]?.points || 0} pts</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h4 className="font-bold text-sm text-white">Full Campus Rankings</h4>
          <button
            onClick={() => navigate('/certificate')}
            className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>View My Citation Certificate</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading student rankings...</div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {students.map((student, idx) => (
              <div
                key={student.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono font-bold text-slate-400 text-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {student.displayName}
                    </span>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{student.returnsCount} items returned</span>
                      {student.badges?.map((b: string) => (
                        <span key={b} className="px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="font-bold text-amber-400 text-sm">
                  {student.points} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
