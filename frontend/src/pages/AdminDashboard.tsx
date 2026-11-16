import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  RotateCw,
  Gift,
  FileCheck,
  CheckCircle,
  Flag,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { CampusMapSvg } from '../components/campus/CampusMapSvg';
import { Location } from '../types';

interface AdminDashboardProps {
  navigate: (route: string) => void;
}

const PIE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#f43f5e'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [claimsQueue, setClaimsQueue] = useState<any[]>([]);
  const [abuseReports, setAbuseReports] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningMaintenance, setRunningMaintenance] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, claimsRes, abuseRes, usersRes, locRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminClaims(),
        api.getAdminAbuseReports(),
        api.getAdminUsers(),
        api.getLocations(),
      ]);

      setStats(statsRes);
      setClaimsQueue(claimsRes.claims || []);
      setAbuseReports(abuseRes.reports || []);
      setUsersList(usersRes.users || []);
      setLocations(locRes.locations || []);
    } catch (err: any) {
      toast(err.message || 'Error fetching admin intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunMaintenance = async () => {
    setRunningMaintenance(true);
    try {
      const res = await api.runMaintenance();
      toast(res.message, 'success');
      fetchAdminData();
    } catch (err: any) {
      toast(err.message || 'Maintenance failed', 'error');
    } finally {
      setRunningMaintenance(false);
    }
  };

  const handleResolveAbuse = async (id: string) => {
    try {
      await api.resolveAbuseReport(id);
      toast('Abuse report marked as resolved.', 'success');
      setAbuseReports((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    } catch (err) {
      toast('Failed to resolve abuse report', 'error');
    }
  };

  const handleToggleFlag = async (userId: string) => {
    try {
      const res = await api.toggleUserFlag(userId);
      toast(res.message, 'info');
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, flagged: !u.flagged } : u))
      );
    } catch (err) {
      toast('Failed to toggle flag', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center glass rounded-3xl animate-pulse text-xs text-slate-400">
        Loading RYMEC Campus Security Core...
      </div>
    );
  }

  // Create hotspot counts dictionary for heatmap
  const hotspotCounts: Record<string, number> = {};
  if (stats?.hotspotData) {
    stats.hotspotData.forEach((h: any) => {
      hotspotCounts[h.id] = h.count;
    });
  }

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Campus Security Desk Terminal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Admin & Prevention Insights
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/posters')}
            className="px-4 py-2.5 rounded-xl glass hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Printable QR Posters</span>
          </button>

          <button
            onClick={handleRunMaintenance}
            disabled={runningMaintenance}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <RotateCw className={`w-4 h-4 ${runningMaintenance ? 'animate-spin' : ''}`} />
            <span>{runningMaintenance ? 'Running...' : 'Run Maintenance Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/20 space-y-1">
          <div className="text-2xl font-black text-white">{stats?.summary?.totalItems || 0}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Items Logged</div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/20 space-y-1">
          <div className="text-2xl font-black text-emerald-400">{stats?.summary?.returnedCount || 0}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Successfully Returned</div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/20 space-y-1">
          <div className="text-2xl font-black text-indigo-400">{stats?.summary?.returnRate || 0}%</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Campus Return Rate</div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/20 space-y-1">
          <div className="text-2xl font-black text-amber-400">{stats?.summary?.avgDaysToReturn || '1.8'} Days</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Return Velocity</div>
        </div>
      </div>

      {/* Prevention Insights (U11) */}
      <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/20 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>Automated Prevention Insights (U11)</span>
        </div>
        <h3 className="text-xl font-bold text-white">Campus Loss Analysis & Advisory</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {stats?.preventionInsights?.map((sentence: string, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-xs text-slate-200 leading-relaxed flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center flex-shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <span>{sentence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Hotspot Heatmap (U10) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            <span>Campus Loss Hotspot Heatmap (U10)</span>
          </h3>
        </div>

        <CampusMapSvg
          locations={locations}
          isHeatmap={true}
          hotspotCounts={hotspotCounts}
        />
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Lost Categories Bar Chart */}
        <div className="glass p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Category Distribution</h4>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Incident Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryData || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Area/Bar Chart */}
        <div className="glass p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Peak Hours (00:00 - 23:00)</h4>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Incident Timings</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.peakHoursData || []}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="reports" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Claims Queue & Moderation */}
      <div className="glass p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
        <h4 className="font-bold text-sm text-white">Claims Moderation Queue</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Item Title</th>
                <th className="py-2.5 px-3">Claimant</th>
                <th className="py-2.5 px-3">Challenge Answer</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {claimsQueue.slice(0, 8).map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-semibold text-white">{c.item_title}</td>
                  <td className="py-2.5 px-3 text-slate-300">{c.claimant_name} ({c.claimant_roll})</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-300">{c.answer || 'None'}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 text-white">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Abuse & Spam Reports (C8) */}
      <div className="glass p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
        <h4 className="font-bold text-sm text-white">Flagged Abuse & Content Reports</h4>
        {abuseReports.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No open abuse reports.</div>
        ) : (
          <div className="space-y-3">
            {abuseReports.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl bg-black/20 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-rose-300">Reason: {a.reason}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Reported on item: <span className="text-white">{a.item_title}</span> by {a.reporter_name} ({a.reporter_roll})
                  </div>
                </div>

                <div>
                  {a.resolved ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveAbuse(a.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Accounts & Fraud Guard (U15) */}
      <div className="glass p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
        <h4 className="font-bold text-sm text-white">Student Trust Scores & Fraud Protection (U15)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Roll Number</th>
                <th className="py-2.5 px-3">Trust Points</th>
                <th className="py-2.5 px-3">Fraud Claims</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersList.filter(u => u.role === 'STUDENT').map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-semibold text-white">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{u.roll_no}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{u.points} pts</td>
                  <td className="py-2.5 px-3 font-mono text-rose-400">{u.fraud_claims}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.flagged
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {u.flagged ? 'FLAGGED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleFlag(u.id)}
                      className="text-slate-400 hover:text-white p-1 text-xs"
                      title="Toggle Flag"
                    >
                      <Flag className={`w-3.5 h-3.5 ${u.flagged ? 'text-rose-400 fill-rose-400' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
