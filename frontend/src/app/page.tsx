"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import RepoCard from '@/components/RepoCard';
import RepoCardSkeleton from '@/components/RepoCardSkeleton';
import { apiService, authStorage, GUEST_USER_ID, RepoResult } from '@/services/api';

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const matchesFilter = (selected: string, allValue: string, actual?: string | null) => {
  return selected === allValue || actual?.toLowerCase() === selected.toLowerCase();
};

export default function Home() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('All Domains');
  const [level, setLevel] = useState('All Levels');
  const [language, setLanguage] = useState('All Languages');
  
  const [repos, setRepos] = useState<RepoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [savedRepoIds, setSavedRepoIds] = useState<Set<string>>(new Set());
  const requestIdRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize user_id from localStorage
  useEffect(() => {
    const session = authStorage.getSession();
    setUserId(session?.user_id || GUEST_USER_ID);
  }, []);

  // Fetch saved repositories to track save state on Explore page
  useEffect(() => {
    if (!userId) return;
    const fetchSaved = async () => {
      try {
        const saved = await apiService.getSavedRepositories(userId);
        setSavedRepoIds(new Set(saved.map(r => `${r.repo_owner}/${r.repo_name}`.toLowerCase())));
      } catch (err) {
        console.error('Failed to load saved repos in Explore page:', err);
      }
    };
    fetchSaved();
  }, [userId, pathname]);

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

  // Reset page when filters or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, domain, level, language]);

  const filteredRepos = repos.filter((repo) => {
    return (
      matchesFilter(domain, 'All Domains', repo.domain) &&
      matchesFilter(level, 'All Levels', repo.difficulty_level) &&
      matchesFilter(language, 'All Languages', repo.language)
    );
  });

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRepos = filteredRepos.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSaveRepo = async (repo: RepoResult) => {
    const targetUserId = userId || GUEST_USER_ID;
    
    await apiService.saveRepository({
      user_id: targetUserId,
      repo_name: repo.name,
      repo_owner: repo.owner,
      repo_url: repo.github_url,
      domain: repo.domain,
      difficulty: repo.difficulty_level,
      gitniche_score: repo.gitniche_score,
    });

    setSavedRepoIds(prev => {
      const next = new Set(prev);
      next.add(`${repo.owner}/${repo.name}`.toLowerCase());
      return next;
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="mb-6 border-b border-border-divider pb-6 transition duration-200">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Discover Your Next
          <span className="block text-[#0969da] dark:text-[#58a6ff]">Open Source Contribution</span>
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
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
            <h3 className="text-sm font-semibold text-text-primary">
              {loading ? 'Finding projects...' : `${filteredRepos.length} matches found`}
            </h3>
            
            {/* Show a reminder if using default mock account */}
            {userId === GUEST_USER_ID && (
              <span className="rounded-full border border-border-color bg-bg-btn px-2.5 py-1 text-xs text-text-secondary transition duration-200">
                Browsing as guest. Sign in with GitHub to save your profile.
              </span>
            )}
          </div>

          {/* Loader, Error, or Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <RepoCardSkeleton key={idx} />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 rounded-md border border-[#ff8182] bg-[#ffebe9] dark:border-[#f85149]/40 dark:bg-[#f85149]/10 text-center transition duration-200">
              <svg className="w-12 h-12 text-[#cf222e] dark:text-[#ff7b72] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="text-text-primary font-bold mb-1">Server Connection Offline</h4>
              <p className="text-xs text-text-secondary max-w-sm">{error}</p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 rounded-md border border-border-color bg-bg-card text-center transition duration-200">
              <svg className="w-12 h-12 text-text-secondary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
              <h4 className="text-text-primary font-bold mb-1">No matches found</h4>
              <p className="text-xs text-text-secondary max-w-xs">Try broadening your search query or loosening your filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {paginatedRepos.map((repo, idx) => (
                  <RepoCard
                    key={`${repo.owner}-${repo.name}-${idx}`}
                    repo={repo}
                    isSaved={savedRepoIds.has(`${repo.owner}/${repo.name}`.toLowerCase())}
                    onSave={handleSaveRepo}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4 border-t border-border-divider pt-6 transition duration-200">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="rounded-md border border-border-color bg-bg-card px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-btn disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-secondary">
                    Page <span className="font-semibold text-text-primary">{currentPage}</span> of <span className="font-semibold text-text-primary">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-border-color bg-bg-card px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-btn disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
