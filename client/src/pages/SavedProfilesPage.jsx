import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, BookmarkCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedProfilesPage() {
  const { formatSalary } = useCurrency();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = () => {
    setLoading(true);
    fetch('/api/saved-profiles', {
      headers: {
        ...(localStorage.getItem('salaryai_token') ? { Authorization: `Bearer ${localStorage.getItem('salaryai_token')}` } : {})
      }
    })
      .then((res) => res.json())
      .then((data) => setProfiles(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/saved-profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Saved Candidate Profiles
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and compare archived compensation simulations and promotion pathways.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white px-3.5 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <span>Run New Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Loading archived profiles...
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No Saved Profiles Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Use the "Save Candidate Profile" button on the Simulator page to archive scenarios for leveling comparisons.
            </p>
            <Link
              to="/"
              className="text-xs font-bold text-slate-900 underline hover:text-emerald-600 transition"
            >
              Go to Simulator →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((p) => (
              <div key={p.id} className="exec-card p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {p.candidate_role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Predicted CTC:</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatSalary(p.predicted_ctc)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {p.experience_years} yrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Skill Rank:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {p.skill_rank} / 100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tier:</span>
                      <span className="text-slate-700 truncate max-w-[170px]">
                        {p.company_tier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Archived: {new Date(p.created_at).toLocaleDateString()}</span>
                  <span className="text-emerald-700 font-medium">Verified Model</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
