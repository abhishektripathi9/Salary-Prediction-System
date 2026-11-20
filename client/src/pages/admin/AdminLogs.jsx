import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Search, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function AdminLogs() {
  const { formatSalary } = useCurrency();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      search,
      tier
    });

    fetch(`/api/admin/logs?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page, tier]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inference Prediction Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit trail of all candidate compensation simulations ({total.toLocaleString()} total logged events)
            </p>
          </div>

          <a
            href="/api/admin/logs/export"
            download="salaryai_prediction_logs.csv"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Audit Log</span>
          </a>
        </div>

        {/* Filter bar */}
        <div className="exec-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by role, model, tier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 outline-none"
            >
              <option value="All">All Locations</option>
              <option value="Tier 1">Tier 1 Metro</option>
              <option value="Tier 2">Tier 2 Metro</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="exec-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-4">Candidate Role</th>
                  <th className="py-3 px-4">Exp</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Company Tier</th>
                  <th className="py-3 px-4">Predicted CTC</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-5 text-right">Model Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-5 text-slate-500 font-mono text-[11px]">
                      {new Date(l.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{l.candidate_role}</td>
                    <td className="py-3 px-4 tabular-nums text-slate-700">{l.experience_years}y</td>
                    <td className="py-3 px-4 tabular-nums text-slate-700">{l.skill_rank}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">{l.location_tier}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium truncate max-w-[150px]">{l.company_tier}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                      {formatSalary(l.predicted_ctc)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {l.percentile_rank}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-mono">
                      {l.model_used.split(' ')[0]} {l.model_used.split(' ')[1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page {page} of {pages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
