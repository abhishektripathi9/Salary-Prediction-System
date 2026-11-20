import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCurrency } from '../context/CurrencyContext';
import { Search, Filter, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BenchmarksPage() {
  const { formatSalary } = useCurrency();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [loading, setLoading] = useState(true);

  const roles = [
    'All Roles',
    'ML / AI Engineer',
    'Senior Backend Engineer',
    'Lead Product Designer',
    'Full Stack Engineer',
    'Engineering Manager',
    'SDE-1',
    'SDE-2'
  ];

  const locations = [
    'All Locations',
    'Tier 1 Metro (BLR/MUM/NCR)',
    'Tier 2 Metro (HYD/PUN)',
    'Remote'
  ];

  const fetchBenchmarks = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      search,
      role: roleFilter,
      location: locationFilter
    });

    fetch(`/api/benchmarks?${query.toString()}`)
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
    fetchBenchmarks();
  }, [page, roleFilter, locationFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBenchmarks();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Verified Tech Salary Benchmarks
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore verified compensation data across {total.toLocaleString()} individual tech offers.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Anonymized & Verified</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 p-4 bg-white exec-card flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search role, location, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-900 transition"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-slate-900 font-medium text-slate-700"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-slate-900 font-medium text-slate-700"
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="mt-6 exec-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Role & Level</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Skill Rank</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Company Tier</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4 text-right">Gross CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading verified benchmarks...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.candidate_role}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {r.education_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-700">
                        {r.experience_years} yrs
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                          {r.skill_rank} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{r.location_tier}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{r.company_tier}</td>
                      <td className="py-3 px-4 tabular-nums text-slate-700">
                        {formatSalary(r.base_inr)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                        {formatSalary(r.ctc_inr)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {records.length} of {total.toLocaleString()} offers
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
