"use client";

import { useState, useEffect, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import RepoCard from '@/components/RepoCard';
import { apiService, RepoResult } from '@/services/api';

export default function Home() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('All Domains');
  const [level, setLevel] = useState('All Levels');
  const [language, setLanguage] = useState('All Languages');
  
  const [repos, setRepos] = useState<RepoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // Initialize user_id from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('gitniche_user_id') || '00000000-0000-0000-0000-000000000000';
    setUserId(savedUserId);
  }, []);

  const fetchRepos = useCallback(async (
    searchQuery: string,
    selectedDomain: string,
    selectedLevel: string,
    selectedLang: string,
    currUserId: string | null
  ) => {
    setLoading(true);
    setError(null);
    try {
      const results = await apiService.searchRepositories({
        query: searchQuery,
        domain: selectedDomain,
        experience_level: selectedLevel,
        language: selectedLang,
        user_id: currUserId || undefined
      });
      setRepos(results);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load opportunities. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when variables change
  useEffect(() => {
    fetchRepos(query, domain, level, language, userId);
  }, [query, domain, level, language, userId, fetchRepos]);

  const handleSaveRepo = async (repo: RepoResult) => {
    const targetUserId = userId || '00000000-0000-0000-0000-000000000000';
    
    await apiService.saveRepository({
      user_id: targetUserId,
      repo_name: repo.name,
      repo_owner: repo.owner,
      repo_url: repo.github_url,
      domain: repo.domain,
      difficulty: repo.difficulty_level,
      gitniche_score: repo.gitniche_score,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Discover Your Next
          <span className="block mt-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Open Source Contribution
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          GitNiche uses AI-assisted labeling to find active, beginner-friendly GitHub repositories customized to your skills and career objectives.
        </p>
      </div>

      {/* Main Search Panel */}
      <SearchBar onSearch={(q) => setQuery(q)} initialValue={query} />

      {/* Grid Layout: Filter Sidebar + Repository Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full mt-4 flex-1">
        <Filters
          selectedDomain={domain}
          selectedLevel={level}
          selectedLanguage={language}
          onChangeDomain={(d) => setDomain(d)}
          onChangeLevel={(l) => setLevel(l)}
          onChangeLanguage={(lang) => setLanguage(lang)}
        />

        <div className="flex-1 w-full flex flex-col">
          {/* Results Status */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {loading ? 'Finding projects...' : `${repos.length} matches found`}
            </h3>
            
            {/* Show a reminder if using default mock account */}
            {userId === '00000000-0000-0000-0000-000000000000' && (
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/15">
                Browsing as Mock Guest. Set preferences to customize scoring!
              </span>
            )}
          </div>

          {/* Loader, Error, or Results Grid */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Classifying domains & calculating GitNiche scores...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 border border-rose-500/10 rounded-2xl bg-rose-500/5 text-center">
              <svg className="w-12 h-12 text-rose-500/80 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="text-slate-200 font-bold mb-1">Server Connection Offline</h4>
              <p className="text-xs text-slate-400 max-w-sm">{error}</p>
            </div>
          ) : repos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 border border-slate-900 rounded-2xl bg-slate-900/10 text-center">
              <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
              <h4 className="text-slate-300 font-bold mb-1">No matches found</h4>
              <p className="text-xs text-slate-500 max-w-xs">Try broadening your search query or loosening your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repos.map((repo, idx) => (
                <RepoCard
                  key={`${repo.owner}-${repo.name}-${idx}`}
                  repo={repo}
                  onSave={handleSaveRepo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
