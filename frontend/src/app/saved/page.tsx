"use client";

import { useState, useEffect } from 'react';
import RepoCard from '@/components/RepoCard';
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
  const [savedUserId, setSavedUserId] = useState<string>(GUEST_USER_ID);

  useEffect(() => {
    const session = authStorage.getSession();
    const resolvedUserId = session?.user_id || GUEST_USER_ID;
    setSavedUserId(resolvedUserId);
    setUsername(session?.username || 'Guest');

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
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#d8dee4] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">Saved repositories</h1>
          <p className="mt-2 text-sm text-[#57606a]">Showing saved opportunities for <span className="font-semibold text-[#0969da]">{username}</span>.</p>
        </div>
        <Link href="/" className="w-fit rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-sm font-semibold text-[#24292f] hover:bg-white">
          Back to Explore
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d0d7de] border-t-[#0969da]" />
          <p className="text-sm text-[#57606a]">Retrieving saved repositories...</p>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-[#ff8182] bg-[#ffebe9] px-4 py-16 text-center">
          <h4 className="mb-1 font-semibold text-[#24292f]">Failed to load bookmarks</h4>
          <p className="max-w-sm text-sm text-[#57606a]">{error}</p>
        </div>
      ) : savedList.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-[#d0d7de] bg-white px-4 py-24 text-center shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#d0d7de] bg-[#f6f8fa] text-lg font-semibold text-[#57606a]">*</div>
          <h3 className="mb-1 text-lg font-semibold text-[#24292f]">No saved repositories yet</h3>
          <p className="mb-6 max-w-sm text-sm text-[#57606a]">Save repositories from Explore and they will appear here.</p>
          <Link href="/" className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c974b]">Explore projects</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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