"use client";

import { RepoResult } from '@/services/api';
import { useState } from 'react';

interface RepoCardProps {
  repo: RepoResult;
  onSave?: (repo: RepoResult) => Promise<void>;
  onUnsave?: (repo: RepoResult) => Promise<void>;
  isSaved?: boolean;
  showStarsAndForks?: boolean;
}

export default function RepoCard({
  repo,
  onSave,
  onUnsave,
  isSaved = false,
  showStarsAndForks = true
}: RepoCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave || isSaved || loading) return;
    setLoading(true);
    try {
      await onSave(repo);
    } catch (err) {
      console.error('Failed to save repository', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async () => {
    if (!onUnsave || loading) return;
    setLoading(true);
    try {
      await onUnsave(repo);
    } catch (err) {
      console.error('Failed to unsave repository', err);
    } finally {
      setLoading(false);
    }
  };

  const scoreClass = repo.gitniche_score >= 80
    ? 'border-[#2da44e] bg-[#dafbe1] text-[#116329]'
    : repo.gitniche_score >= 60
      ? 'border-[#54aeff] bg-[#ddf4ff] text-[#0969da]'
      : repo.gitniche_score >= 40
        ? 'border-[#d4a72c] bg-[#fff8c5] text-[#7d4e00]'
        : 'border-[#ff8182] bg-[#ffebe9] text-[#cf222e]';

  const difficultyClass = repo.difficulty_level === 'Beginner-Friendly'
    ? 'border-[#2da44e] bg-[#dafbe1] text-[#116329]'
    : repo.difficulty_level === 'Advanced'
      ? 'border-[#ff8182] bg-[#ffebe9] text-[#cf222e]'
      : 'border-[#54aeff] bg-[#ddf4ff] text-[#0969da]';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? dateStr : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <article className="flex min-h-72 flex-col justify-between rounded-md border border-[#d0d7de] bg-white p-5 shadow-sm transition hover:border-[#8c959f] hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 truncate text-xs text-[#57606a]">{repo.owner}</p>
            <a href={repo.github_url} target="_blank" rel="noopener noreferrer" className="block truncate text-lg font-semibold text-[#0969da] hover:underline">
              {repo.name}
            </a>
          </div>
          <div className={`shrink-0 rounded-md border px-2.5 py-1 text-center ${scoreClass}`}>
            <div className="text-base font-semibold leading-none">{repo.gitniche_score}</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase">Score</div>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-[#57606a]">
          {repo.description || 'No description provided.'}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {repo.language && <span className="rounded-full border border-[#d0d7de] bg-[#f6f8fa] px-2 py-0.5 text-xs font-medium text-[#57606a]">{repo.language}</span>}
          <span className="rounded-full border border-[#54aeff] bg-[#ddf4ff] px-2 py-0.5 text-xs font-medium text-[#0969da]">{repo.domain}</span>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${difficultyClass}`}>{repo.difficulty_level}</span>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#d8dee4] pt-3 text-xs text-[#57606a]">
          {showStarsAndForks && (
            <>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.211.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.194a.751.751 0 0 1-1.088.791L8 12.347l-3.767 1.982a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.211-.611L7.327.668A.75.75 0 0 1 8 .25Z" /></svg>
                {repo.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v5.256a2.25 2.25 0 1 0 1.5 0V8.123A3.75 3.75 0 0 0 8.25 10h2.378a2.25 2.25 0 1 0 0-1.5H8.25A2.25 2.25 0 0 1 6 6.25V5.372ZM12.75 9a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-8.5 3.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" /></svg>
                {repo.forks.toLocaleString()}
              </span>
            </>
          )}
          <span className="ml-auto">Updated {formatDate(repo.last_activity_date)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={repo.github_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-xs font-semibold text-[#24292f] hover:bg-[#f3f4f6]">GitHub</a>
          <a href={repo.codespaces_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-xs font-semibold text-[#24292f] hover:bg-[#f3f4f6]">Codespaces</a>
          <a href={repo.gitpod_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-xs font-semibold text-[#24292f] hover:bg-[#f3f4f6]">Gitpod</a>
          {onSave && !isSaved && (
            <button onClick={handleSave} disabled={loading} className="ml-auto rounded-md border border-[#d0d7de] bg-white px-3 py-1.5 text-xs font-semibold text-[#24292f] hover:bg-[#f6f8fa]">
              {loading ? 'Saving...' : 'Save'}
            </button>
          )}
          {onUnsave && (
            <button onClick={handleUnsave} disabled={loading} className="ml-auto rounded-md border border-[#ff8182] bg-[#ffebe9] px-3 py-1.5 text-xs font-semibold text-[#cf222e] hover:bg-[#ffd6d3] disabled:opacity-60">
              {loading ? 'Removing...' : 'Unsave'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}