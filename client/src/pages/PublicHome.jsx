import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import SubHeader from '../components/SubHeader';
import SimulatorInputs from '../components/SimulatorInputs';
import EstimatedCtcHero from '../components/EstimatedCtcHero';
import MarketDistributionCard from '../components/MarketDistributionCard';

export default function PublicHome() {
  const [profile, setProfile] = useState({
    candidate_role: 'ML / AI Engineer',
    experience_years: 10.5,
    skill_rank: 88,
    education_level: "Bachelor's",
    workloads_count: 14,
    location_tier: 'Tier 1 Metro (BLR/MUM/NCR)',
    company_tier: 'Growth Mid-Market ($50M-$250M ARR)'
  });

  const [prediction, setPrediction] = useState(null);
  const [bellCurveData, setBellCurveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPromoted, setIsPromoted] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const debounceTimeout = useRef(null);

  // Fetch bell curve & metadata on mount
  useEffect(() => {
    fetch('/api/ml/metadata')
      .then((res) => res.json())
      .then((data) => {
        if (data?.bell_curve) {
          setBellCurveData(data.bell_curve);
        }
      })
      .catch((err) => console.log('Metadata error:', err));
  }, []);

  // Run live prediction with debounce
  const fetchPrediction = (currentProfile) => {
    setLoading(true);
    fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentProfile)
    })
      .then((res) => res.json())
      .then((data) => {
        setPrediction(data);
      })
      .catch((err) => console.error('Prediction failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchPrediction(profile);
    }, 120);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [profile]);

  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSimulatePromotion = () => {
    if (isPromoted && originalProfile) {
      setProfile(originalProfile);
      setIsPromoted(false);
      setOriginalProfile(null);
    } else {
      setOriginalProfile({ ...profile });
      setProfile((prev) => ({
        ...prev,
        experience_years: Math.min(25, Number((prev.experience_years + 2.0).toFixed(1))),
        skill_rank: Math.min(100, prev.skill_rank + 5),
        workloads_count: Math.min(30, prev.workloads_count + 4)
      }));
      setIsPromoted(true);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/saved-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('salaryai_token') ? { Authorization: `Bearer ${localStorage.getItem('salaryai_token')}` } : {})
        },
        body: JSON.stringify({
          title: `${profile.candidate_role} (${profile.experience_years}y, ${profile.location_tier.split(' ')[0]})`,
          ...profile,
          predicted_ctc: prediction?.predicted_ctc || 4052000
        })
      });
      if (res.ok) {
        setNotification('Candidate profile successfully archived to Saved Profiles!');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <SubHeader />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
        {notification && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* 3-Column Interactive Compensation Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: Inputs */}
          <SimulatorInputs
            profile={profile}
            onChange={handleProfileChange}
            onSaveProfile={handleSaveProfile}
            onSimulatePromotion={handleSimulatePromotion}
            isPromoted={isPromoted}
            isSaving={isSaving}
          />

          {/* Column 2: Estimated Annual CTC (Hero Output) */}
          <EstimatedCtcHero prediction={prediction} loading={loading} />

          {/* Column 3: Market Distribution & Benchmarks */}
          <MarketDistributionCard
            prediction={prediction}
            bellCurveData={bellCurveData}
          />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SalaryAI — Tech Compensation & Leveling Engine • v4.2.0 Production Monorepo</span>
          <span className="text-slate-400">Trained on 2,540 verified tech offers • Scikit-Learn Pipeline</span>
        </div>
      </footer>
    </div>
  );
}
