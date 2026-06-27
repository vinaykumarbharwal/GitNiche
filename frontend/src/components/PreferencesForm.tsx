"use client";

import { useState, useEffect } from 'react';
import { apiService, PreferencesPayload } from '@/services/api';

interface PreferencesFormProps {
  onSaveSuccess?: (userId: string, username: string) => void;
}

export default function PreferencesForm({ onSaveSuccess }: PreferencesFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('Beginner-Friendly');
  const [careerGoal, setCareerGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const domains = ['AI/ML', 'Blockchain', 'Cybersecurity', 'Web Development', 'DevOps', 'Cloud'];
  const languages = ['TypeScript', 'Python', 'Rust', 'Go', 'JavaScript', 'Java', 'C++', 'Ruby'];

  // Load preferences from localStorage if exists
  useEffect(() => {
    const savedUserId = localStorage.getItem('gitniche_user_id');
    const savedUsername = localStorage.getItem('gitniche_username');
    const savedEmail = localStorage.getItem('gitniche_email');
    
    if (savedUsername) setUsername(savedUsername);
    if (savedEmail) setEmail(savedEmail);

    if (savedUserId) {
      setLoading(true);
      apiService.getPreferences(savedUserId)
        .then((pref) => {
          setSelectedDomains(pref.domains || []);
          setSelectedLanguages(pref.languages || []);
          setExperienceLevel(pref.experience_level || 'Beginner-Friendly');
          setCareerGoal(pref.career_goal || '');
        })
        .catch((err) => console.error("Could not fetch preferences on mount", err))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleToggleDomain = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      setMessage({ text: 'Please provide both a GitHub username and an email.', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload: PreferencesPayload = {
      github_username: username.trim(),
      email: email.trim(),
      domains: selectedDomains,
      languages: selectedLanguages,
      experience_level: experienceLevel,
      career_goal: careerGoal.trim() || undefined,
    };

    try {
      const response = await apiService.savePreferences(payload);
      
      // Save credentials in localStorage
      localStorage.setItem('gitniche_user_id', response.user.id);
      localStorage.setItem('gitniche_username', response.user.github_username);
      localStorage.setItem('gitniche_email', response.user.email);
      
      setMessage({ text: 'Preferences saved and synced successfully!', isError: false });
      
      if (onSaveSuccess) {
        onSaveSuccess(response.user.id, response.user.github_username);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Error occurred while saving preferences.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-100 bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent mb-2">
          Setup Developer Profile
        </h2>
        <p className="text-xs text-slate-400">
          Sync your profile to receive higher relevance scores and bookmark your favorite opportunities.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* User Account Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">GitHub Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds"
              className="px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm placeholder-slate-600"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dev@domain.com"
              className="px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm placeholder-slate-600"
            />
          </div>
        </div>

        <div className="h-px bg-slate-800/80 w-full my-1"></div>

        {/* Domain choices */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Preferred Domains</label>
          <div className="flex flex-wrap gap-2">
            {domains.map((dom) => {
              const selected = selectedDomains.includes(dom);
              return (
                <button
                  type="button"
                  key={dom}
                  onClick={() => handleToggleDomain(dom)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    selected
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/45 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {dom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tech language choices */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Preferred Languages</label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => {
              const selected = selectedLanguages.includes(lang);
              return (
                <button
                  type="button"
                  key={lang}
                  onClick={() => handleToggleLanguage(lang)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    selected
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-950/45 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['Beginner-Friendly', 'Intermediate', 'Advanced'].map((level) => {
              const selected = experienceLevel === level;
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    selected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/45 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Career Goals */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Career Objectives / Notes</label>
          <textarea
            rows={3}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Find Python ML projects to work on to enhance my portfolio..."
            className="px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm placeholder-slate-600 resize-none"
          ></textarea>
        </div>

        {/* Submission button & message */}
        <div className="mt-4 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving Profile...' : 'Save and Update Profile'}
          </button>

          {message && (
            <div className={`p-4 rounded-xl border text-center text-xs font-semibold ${
              message.isError
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
