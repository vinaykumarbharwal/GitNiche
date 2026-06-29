"use client";

import { useState, useEffect } from 'react';
import RepoCard from '@/components/RepoCard';
import RepoCardSkeleton from '@/components/RepoCardSkeleton';
import { apiService, authStorage, GUEST_USER_ID, RepoResult, SavedRepository } from '@/services/api';
import Link from 'next/link';

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function SavedRepos() {
  const [savedList, setSavedList] = useState<SavedRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const session = authStorage.getSession();
    if (!session) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    const resolvedUserId = session.user_id;
    setSavedUserId(resolvedUserId);
    setUsername(session.username);

    const fetchSaved = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await apiService.getSavedRepositories(resolvedUserId);
        setSavedList(results);
      } catch (err: unknown) {
        console.error(err);
        setError(getErrorMessage(err, 'Failed to retrieve saved repositories.')); 
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const handleUnsaveRepo = async (repo: RepoResult) => {
    await apiService.unsaveRepository(savedUserId, repo.owner, repo.name);
    setSavedList((prev) => prev.filter(
      (savedRepo) => !(savedRepo.repo_owner === repo.owner && savedRepo.repo_name === repo.name)
    ));
  };

  const mapToRepoResult = (saved: SavedRepository): RepoResult => ({
    name: saved.repo_name,
    owner: saved.repo_owner,
    description: saved.description || 'Bookmarked opportunity.',
    stars: saved.stars || 0,
    forks: saved.forks || 0,
    language: saved.language || null,
    domain: saved.domain,
    difficulty_level: saved.difficulty,
    last_activity_date: saved.created_at,
    gitniche_score: saved.gitniche_score,
    github_url: saved.repo_url,
    codespaces_url: `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${saved.repo_owner}/${saved.repo_name}`,
    gitpod_url: `https://gitpod.io/#${saved.repo_url}`,
    open_issues: saved.open_issues || 0,
    good_first_issues: saved.good_first_issues || 0,
    license: saved.license || 'None',
  });
  if (isAuthenticated === null) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-color border-t-[#0969da] dark:border-t-[#58a6ff]" />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="w-full max-w-md rounded-md border border-border-color bg-bg-card p-8 shadow-sm transition duration-200">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-color bg-bg-btn text-text-secondary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">Saved Repositories</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Sign in with GitHub to save and revisit your favorite repositories.
          </p>
          <a
            href={apiService.getGitHubLoginUrl()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2da44e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2c974b]"
          >
            Continue with GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-border-divider pb-6 sm:flex-row sm:items-end sm:justify-between transition duration-200">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Saved repositories</h1>
          <p className="mt-2 text-sm text-text-secondary">Showing saved opportunities for <span className="font-semibold text-[#0969da] dark:text-[#58a6ff]">{username}</span>.</p>
        </div>
        <Link href="/" className="w-fit rounded-md border border-border-color bg-bg-btn px-3 py-1.5 text-sm font-semibold text-text-primary hover:bg-bg-card transition duration-200">
          Back to Explore
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <RepoCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-[#ff8182] bg-[#ffebe9] dark:border-[#f85149]/40 dark:bg-[#f85149]/10 px-4 py-16 text-center transition duration-200">
          <h4 className="mb-1 font-semibold text-text-primary">Failed to load bookmarks</h4>
          <p className="max-w-sm text-sm text-text-secondary">{error}</p>
        </div>
      ) : savedList.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-border-color bg-bg-card px-4 py-24 text-center shadow-sm transition duration-200">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-color bg-bg-btn text-lg font-semibold text-text-secondary">★</div>
          <h3 className="mb-1 text-lg font-semibold text-text-primary">You have not saved any repositories yet.</h3>
          <p className="mb-6 max-w-sm text-sm text-text-secondary">Explore projects and click Save.</p>
          <Link href="/" className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c974b]">Explore projects</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {savedList.map((savedRepo) => (
            <RepoCard
              key={savedRepo.id}
              repo={mapToRepoResult(savedRepo)}
              isSaved={true}
              onUnsave={handleUnsaveRepo}
              showStarsAndForks={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}