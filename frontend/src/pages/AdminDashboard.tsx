import React, { useState, useEffect } from 'react';
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
  Printer,
  Activity,
  Download,
  Search,
  CheckCircle2,
  Shield,
  Mail,
  Building2,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { CampusMapSvg } from '../components/campus/CampusMapSvg';
import { Location } from '../types';

interface AdminDashboardProps {
  navigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [claimsQueue, setClaimsQueue] = useState<any[]>([]);
  const [abuseReports, setAbuseReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditFilter, setAuditFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [runningMaintenance, setRunningMaintenance] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, claimsRes, abuseRes, locRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminClaims(),
        api.getAdminAbuseReports(),
        api.getLocations(),
        api.getAdminAuditLogs().catch(() => ({ logs: [] })),
      ]);

      setStats(statsRes);
      setClaimsQueue(claimsRes.claims || []);
      setAbuseReports(abuseRes.reports || []);
      setLocations(locRes.locations || []);
      setAuditLogs(logsRes.logs || []);
    } catch (err: any) {
      toast(err.message || 'Error fetching administration records', 'error');
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
      toast('Report marked as resolved.', 'success');
      setAbuseReports((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    } catch (err) {
      toast('Failed to resolve report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center rounded-2xl border border-white/[0.08] bg-[#0c1421]/60 text-xs text-slate-400 font-mono">
        Loading institutional intelligence...
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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* ─── 1. QUIET HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Campus Security Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
            Incident Ledger &amp; Loss Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/posters')}
            className="px-3.5 py-2 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Printable QR Posters</span>
          </button>

          <button
            onClick={handleRunMaintenance}
            disabled={runningMaintenance}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${runningMaintenance ? 'animate-spin' : ''}`} />
            <span>{runningMaintenance ? 'Processing...' : 'Run Maintenance Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. GROUNDED SUMMARY METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1421]/80 space-y-1">
          <div className="text-xs font-medium text-slate-400">Total Items Logged</div>
          <div className="text-2xl font-semibold text-white tabular-nums tracking-tight">
            {stats?.summary?.totalItems || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1421]/80 space-y-1">
          <div className="text-xs font-medium text-slate-400">Successfully Returned</div>
          <div className="text-2xl font-semibold text-emerald-400 tabular-nums tracking-tight">
            {stats?.summary?.returnedCount || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1421]/80 space-y-1">
          <div className="text-xs font-medium text-slate-400">Campus Return Rate</div>
          <div className="text-2xl font-semibold text-white tabular-nums tracking-tight">
            {stats?.summary?.returnRate || 0}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c1421]/80 space-y-1">
          <div className="text-xs font-medium text-slate-400">Avg Return Velocity</div>
          <div className="text-2xl font-semibold text-white tabular-nums tracking-tight">
            {stats?.summary?.avgDaysToReturn || '1.8'} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
        </div>
      </div>

      {/* ─── 3. LOSS PREVENTION ADVISORY ─── */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Loss Prevention Advisory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational recommendations synthesized from campus incident reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {stats?.preventionInsights?.map((sentence: string, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-md bg-white/[0.06] text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{sentence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. SPATIAL HOTSPOT HEATMAP ─── */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Campus Spatial Loss Heatmap</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Loss density distribution across campus architectural zones
            </p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
          <CampusMapSvg
            locations={locations}
            isHeatmap={true}
            hotspotCounts={hotspotCounts}
          />
        </div>
      </div>

      {/* ─── 5. ANALYTICS CHARTS (QUIET MONOCHROME RAMP) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Lost Categories Bar Chart */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-xs text-white">Incident Breakdown by Category</h3>
            <span className="text-[11px] font-mono text-slate-400">Total Volume</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryData || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0c1421', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Area/Bar Chart */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-xs text-white">Peak Incident Hours (00:00 - 23:00)</h3>
            <span className="text-[11px] font-mono text-slate-400">Hourly Timing</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.peakHoursData || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0c1421', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="reports" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── 6. CLAIMS MODERATION QUEUE ─── */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
        <h3 className="font-medium text-xs text-white">Claims Moderation Queue</h3>
        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-medium text-slate-400 border-b border-white/[0.06] bg-white/[0.02]">
              <tr>
                <th className="py-2.5 px-3">Item Title</th>
                <th className="py-2.5 px-3">Claimant</th>
                <th className="py-2.5 px-3">Verification Answer</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {claimsQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-400">No active claims in queue</td>
                </tr>
              ) : (
                claimsQueue.slice(0, 8).map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white">{c.item_title}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span>{c.claimant_name}</span>{' '}
                      <span className="font-mono text-[11px] text-slate-400">({c.claimant_roll})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{c.answer || 'None'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.06] text-slate-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 7. CONTENT & FLAGGED REPORTS ─── */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
        <h3 className="font-medium text-xs text-white">Content &amp; Flagged Reports</h3>
        {abuseReports.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No open reports recorded</div>
        ) : (
          <div className="space-y-2">
            {abuseReports.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-medium text-slate-200">Reason: {a.reason}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Reported on item <span className="text-white font-medium">{a.item_title}</span> by {a.reporter_name}{' '}
                    <span className="font-mono">({a.reporter_roll})</span>
                  </div>
                </div>

                <div>
                  {a.resolved ? (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                      Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveAbuse(a.id)}
                      className="px-3 py-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium cursor-pointer transition-colors"
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

      {/* ─── 8. CUSTODY & ACTIVITY AUDIT TRAIL ─── */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c1421]/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-xs text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Institutional Custody &amp; Activity Audit</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-white/[0.06] text-slate-300">
                {auditLogs.length} events
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified campus activity log with physical zones and security records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                placeholder="Filter by user, action, or zone..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," + 
                  ["Timestamp,User Name,User Email,Role,Action,Campus Location,Zone,Details"].concat(
                    auditLogs.map(l => `"${l.timestamp}","${l.user_name}","${l.user_email}","${l.role}","${l.action}","${l.location_name}","${l.campus_zone}","${(l.details || '').replace(/"/g, '""')}"`)
                  ).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `rymec_activity_audit_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 rounded-lg border border-white/[0.06]">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-medium text-slate-400 border-b border-white/[0.06] sticky top-0 bg-[#0c1421] backdrop-blur-md">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User &amp; Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Campus Zone</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
              {auditLogs
                .filter(l => {
                  if (!auditFilter.trim()) return true;
                  const q = auditFilter.toLowerCase();
                  return (
                    l.user_name?.toLowerCase().includes(q) ||
                    l.user_email?.toLowerCase().includes(q) ||
                    l.action?.toLowerCase().includes(q) ||
                    l.location_name?.toLowerCase().includes(q) ||
                    l.campus_zone?.toLowerCase().includes(q) ||
                    l.details?.toLowerCase().includes(q)
                  );
                })
                .map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-medium text-white">{log.user_name}</div>
                      <span className="text-[10px] text-slate-400 block font-mono">{log.user_email}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium inline-block ${
                        log.action?.includes('HANDOVER') || log.action?.includes('VERIFIED')
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : log.action?.includes('REPORT')
                          ? 'bg-slate-500/10 text-slate-200'
                          : log.action?.includes('CLAIM')
                          ? 'bg-slate-500/10 text-slate-300'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{log.location_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.03] text-[10px]">
                        {log.campus_zone}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-xs max-w-xs truncate" title={log.details}>
                      {log.details}
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
