"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import RepoCard from '@/components/RepoCard';
import { apiService, authStorage, RepoResult } from '@/services/api';

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const matchesFilter = (selected: string, allValue: string, actual?: string | null) => {
  return selected === allValue || actual?.toLowerCase() === selected.toLowerCase();
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('All Domains');
  const [level, setLevel] = useState('All Levels');
  const [language, setLanguage] = useState('All Languages');
  
  const [repos, setRepos] = useState<RepoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // Initialize user_id from localStorage
  useEffect(() => {
    const session = authStorage.getSession();
    setUserId(session?.user_id || '00000000-0000-0000-0000-000000000000');
  }, []);

  const fetchRepos = useCallback(async (
    searchQuery: string,
    selectedDomain: string,
    selectedLang: string,
    currUserId: string | null
  ) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const results = await apiService.searchRepositories({
        query: searchQuery,
        domain: selectedDomain,
        experience_level: undefined,
        language: selectedLang,
        user_id: currUserId || undefined
      });
      if (requestId !== requestIdRef.current) return;
      setRepos(results);
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      console.error(err);
      setError(getErrorMessage(err, 'Failed to load opportunities. Ensure the backend server is running.')); 
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Search when variables change
  useEffect(() => {
    fetchRepos(query, domain, language, userId);
  }, [query, domain, language, userId, fetchRepos]);

  const filteredRepos = repos.filter((repo) => {
    return (
      matchesFilter(domain, 'All Domains', repo.domain) &&
      matchesFilter(level, 'All Levels', repo.difficulty_level) &&
      matchesFilter(language, 'All Languages', repo.language)
    );
  });

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
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="mb-6 border-b border-[#d8dee4] pb-6">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#24292f] sm:text-4xl">
          Discover Your Next
          <span className="block text-[#0969da]">Open Source Contribution</span>
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[#57606a] sm:text-base">
          GitNiche uses AI-assisted labeling to find active, beginner-friendly GitHub repositories customized to your skills and career objectives.
        </p>
      </div>

      {/* Main Search Panel */}
      <SearchBar onSearch={(q) => setQuery(q)} initialValue={query} />

      {/* Grid Layout: Filter Sidebar + Repository Grid */}
      <div className="mt-6 flex w-full flex-1 flex-col items-start gap-6 lg:flex-row">
        <Filters
          selectedDomain={domain}
          selectedLevel={level}
          selectedLanguage={language}
          onChangeDomain={(d) => setDomain(d)}
          onChangeLevel={(l) => setLevel(l)}
          onChangeLanguage={(lang) => setLanguage(lang)}
        />

        <div className="flex w-full flex-1 flex-col">
          {/* Results Status */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-[#24292f]">
              {loading ? 'Finding projects...' : `${filteredRepos.length} matches found`}
            </h3>
            
            {/* Show a reminder if using default mock account */}
            {userId === '00000000-0000-0000-0000-000000000000' && (
              <span className="rounded-full border border-[#d0d7de] bg-[#f6f8fa] px-2.5 py-1 text-xs text-[#57606a]">
                Browsing as guest. Sign in with GitHub to save your profile.
              </span>
            )}
          </div>

          {/* Loader, Error, or Results Grid */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#d0d7de] border-t-[#0969da] rounded-full animate-spin"></div>
              <p className="text-xs text-[#57606a]">Classifying domains & calculating GitNiche scores...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 rounded-md border border-[#ff8182] bg-[#ffebe9] text-center">
              <svg className="w-12 h-12 text-[#cf222e] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="text-[#24292f] font-bold mb-1">Server Connection Offline</h4>
              <p className="text-xs text-[#57606a] max-w-sm">{error}</p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 rounded-md border border-[#d0d7de] bg-white text-center">
              <svg className="w-12 h-12 text-[#6e7781] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
              <h4 className="text-[#24292f] font-bold mb-1">No matches found</h4>
              <p className="text-xs text-[#57606a] max-w-xs">Try broadening your search query or loosening your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredRepos.map((repo, idx) => (
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
