"use client";

import { useState, useEffect } from 'react';
import RepoCard from '@/components/RepoCard';
import { apiService, RepoResult, SavedRepository } from '@/services/api';
import Link from 'next/link';

export default function SavedRepos() {
  const [savedList, setSavedList] = useState<SavedRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('gitniche_user_id') || '00000000-0000-0000-0000-000000000000';
    const savedUsername = localStorage.getItem('gitniche_username') || 'Mock Guest';
    setUsername(savedUsername);

    const fetchSaved = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await apiService.getSavedRepositories(savedUserId);
        setSavedList(results);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve saved repositories.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  // Map SavedRepository database object back to RepoResult shape for the card component
  const mapToRepoResult = (saved: SavedRepository): RepoResult => {
    return {
      name: saved.repo_name,
      owner: saved.repo_owner,
      description: "Bookmarked opportunity.",
      stars: 0,
      forks: 0,
      language: null,
      domain: saved.domain,
      difficulty_level: saved.difficulty,
      last_activity_date: saved.created_at,
      gitniche_score: saved.gitniche_score,
      github_url: saved.repo_url,
      codespaces_url: `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${saved.repo_owner}/${saved.repo_name}`,
      gitpod_url: `https://gitpod.io/#${saved.repo_url}`
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 flex flex-col">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-1">
            Bookmarked Opportunities
          </h1>
          <p className="text-xs text-slate-400">
            Showing saved opportunities for user: <span className="text-indigo-400 font-semibold">{username}</span>
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white transition flex items-center gap-1.5 w-fit"
        >
          ← Back to Explore
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Retrieving bookmarked repositories...</p>
        </div>
      ) : error ? (
        <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 border border-rose-500/10 rounded-2xl bg-rose-500/5 text-center">
          <svg className="w-12 h-12 text-rose-500/80 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="text-slate-200 font-bold mb-1">Failed to Load Bookmarks</h4>
          <p className="text-xs text-slate-400 max-w-sm">{error}</p>
        </div>
      ) : savedList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 border border-slate-900 rounded-3xl bg-slate-950/20 text-center">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-lg mb-4 border border-slate-800">
            ★
          </div>
          <h3 className="text-slate-200 font-bold mb-1 text-lg">No saved repositories yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mb-6">
            When you find a contribution opportunity you like on the explore dashboard, click the bookmark icon to save it here.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs hover:scale-105 transition duration-300"
          >
            Explore Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((savedRepo) => (
            <RepoCard
              key={savedRepo.id}
              repo={mapToRepoResult(savedRepo)}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
