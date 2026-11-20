import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Database,
  Plus,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2
} from 'lucide-react';

export default function AdminDataset() {
  const { formatSalary } = useCurrency();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Record Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    candidate_role: 'ML / AI Engineer',
    experience_years: 5.0,
    skill_rank: 80,
    education_level: "Bachelor's",
    workloads_count: 6,
    location_tier: 'Tier 1 Metro (BLR/MUM/NCR)',
    company_tier: 'Growth Mid-Market ($50M-$250M ARR)',
    ctc_inr: 3200000
  });
  const [savingRecord, setSavingRecord] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDataset = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      search
    });

    fetch(`/api/admin/dataset?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.records || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDataset();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDataset();
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSavingRecord(true);
    try {
      const res = await fetch('/api/admin/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('New benchmark offer record successfully committed to dataset!');
      setShowAddForm(false);
      fetchDataset();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingRecord(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dataset Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage the ground-truth compensation benchmarks pool ({total.toLocaleString()} records)
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : '+ Add Single Record'}</span>
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Add Record Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleCreateRecord} className="exec-card p-5 bg-white flex flex-col gap-4 border-slate-300">
            <div className="font-bold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              New Verified Salary Record
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Role</label>
                <select
                  value={formData.candidate_role}
                  onChange={(e) => setFormData({ ...formData, candidate_role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                >
                  <option value="ML / AI Engineer">ML / AI Engineer</option>
                  <option value="Senior Backend Engineer">Senior Backend Engineer</option>
                  <option value="Lead Product Designer">Lead Product Designer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Engineering Manager">Engineering Manager</option>
                  <option value="SDE-1">SDE-1</option>
                  <option value="SDE-2">SDE-2</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Experience (Years)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Skill Rank (0-100)</label>
                <input
                  type="number"
                  value={formData.skill_rank}
                  onChange={(e) => setFormData({ ...formData, skill_rank: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Education</label>
                <select
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                >
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD / D.Sc">PhD / D.Sc</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Tier</label>
                <select
                  value={formData.location_tier}
                  onChange={(e) => setFormData({ ...formData, location_tier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                >
                  <option value="Tier 1 Metro (BLR/MUM/NCR)">Tier 1 Metro (BLR/MUM/NCR)</option>
                  <option value="Tier 2 Metro (HYD/PUN)">Tier 2 Metro (HYD/PUN)</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company Tier</label>
                <select
                  value={formData.company_tier}
                  onChange={(e) => setFormData({ ...formData, company_tier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                >
                  <option value="Early Startup">Early Startup</option>
                  <option value="Growth Mid-Market ($50M-$250M ARR)">Growth Mid-Market ($50M-$250M ARR)</option>
                  <option value="FAANG / Tier-1 MNC">FAANG / Tier-1 MNC</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gross Annual CTC (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.ctc_inr}
                  onChange={(e) => setFormData({ ...formData, ctc_inr: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs shadow-xs"
                >
                  {savingRecord ? 'Committing...' : 'Commit to Dataset'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Dataset Table Card */}
        <div className="exec-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search benchmark records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none"
              />
            </form>

            <span className="text-xs text-slate-500 font-medium">
              Total Benchmark Population: <strong>{total.toLocaleString()}</strong> records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Education</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Company Tier</th>
                  <th className="py-3 px-4 text-right">Annual CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.candidate_role}</td>
                    <td className="py-3 px-4 tabular-nums text-slate-700">{r.experience_years} yrs</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                        {r.skill_rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.education_level}</td>
                    <td className="py-3 px-4 text-slate-600">{r.location_tier}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{r.company_tier}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                      {formatSalary(r.ctc_inr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
