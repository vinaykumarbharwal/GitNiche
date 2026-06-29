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
    ? 'border-[#2da44e] bg-[#dafbe1] text-[#116329] dark:border-[#2ea44f]/40 dark:bg-[#2ea44f]/10 dark:text-[#56d364]'
    : repo.gitniche_score >= 60
      ? 'border-[#54aeff] bg-[#ddf4ff] text-[#0969da] dark:border-[#388bfd]/40 dark:bg-[#388bfd]/10 dark:text-[#58a6ff]'
      : repo.gitniche_score >= 40
        ? 'border-[#d4a72c] bg-[#fff8c5] text-[#7d4e00] dark:border-[#d29922]/40 dark:bg-[#d29922]/10 dark:text-[#e3b341]'
        : 'border-[#ff8182] bg-[#ffebe9] text-[#cf222e] dark:border-[#f85149]/40 dark:bg-[#f85149]/10 dark:text-[#ff7b72]';

  const difficultyClass = repo.difficulty_level === 'Beginner-Friendly'
    ? 'border-[#2da44e] bg-[#dafbe1] text-[#116329] dark:border-[#2ea44f]/40 dark:bg-[#2ea44f]/10 dark:text-[#56d364]'
    : repo.difficulty_level === 'Advanced'
      ? 'border-[#ff8182] bg-[#ffebe9] text-[#cf222e] dark:border-[#f85149]/40 dark:bg-[#f85149]/10 dark:text-[#ff7b72]'
      : 'border-[#54aeff] bg-[#ddf4ff] text-[#0969da] dark:border-[#388bfd]/40 dark:bg-[#388bfd]/10 dark:text-[#58a6ff]';

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <article className="flex min-h-72 flex-col justify-between rounded-md border border-border-color bg-bg-card p-5 shadow-sm transition duration-200 hover:border-[#8c959f] dark:hover:border-[#57606a] hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 truncate text-xs text-text-secondary">{repo.owner}</p>
            <a href={repo.github_url} target="_blank" rel="noopener noreferrer" className="block truncate text-lg font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline">
              {repo.name}
            </a>
          </div>
          <div className={`shrink-0 rounded-md border px-2.5 py-1 text-center ${scoreClass}`}>
            <div className="text-base font-semibold leading-none">{repo.gitniche_score}</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase">Score</div>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">
          {repo.description || 'No description provided.'}
        </p>

        {/* Contribution Info Grid */}
        <div className="mb-4 grid grid-cols-2 gap-y-2 text-xs border-t border-border-divider pt-3 transition duration-200">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="font-semibold text-text-primary">Language:</span>
            <span>{repo.language || 'None'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="font-semibold text-text-primary">Domain:</span>
            <span>{repo.domain}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="font-semibold text-text-primary">License:</span>
            <span className="truncate max-w-[100px]" title={repo.license || 'None'}>{repo.license || 'None'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="font-semibold text-text-primary">Difficulty:</span>
            <span className={`inline-block rounded-md border px-1.5 py-0.25 text-[10px] font-semibold leading-none ${difficultyClass}`}>
              {repo.difficulty_level}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between border-t border-border-divider pt-3 text-[11px] text-text-secondary transition duration-200">
          <span className="flex items-center gap-1" title="GitHub Stars">
            <svg className="h-3.5 w-3.5 text-text-secondary" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.211.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.194a.751.751 0 0 1-1.088.791L8 12.347l-3.767 1.982a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.211-.611L7.327.668A.75.75 0 0 1 8 .25Z" /></svg>
            <strong>Stars:</strong> {formatNumber(repo.stars)}
          </span>
          <span className="flex items-center gap-1" title="Open Issues">
            <strong>Open Issues:</strong> {repo.open_issues ?? 0}
          </span>
          <span className="flex items-center gap-1" title="Good First Issues">
            <strong>Good First Issues:</strong> {repo.good_first_issues ?? 0}
          </span>
        </div>
        <div className="mb-4 text-right text-[10px] text-text-secondary">
          Updated {getRelativeTime(repo.last_activity_date)}
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={repo.github_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border-color bg-bg-btn px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] cursor-pointer">GitHub</a>
          <a href={repo.codespaces_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border-color bg-bg-btn px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] cursor-pointer">Codespaces</a>
          <a href={repo.gitpod_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border-color bg-bg-btn px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] cursor-pointer">Gitpod</a>
          {onSave && !isSaved && (
            <button onClick={handleSave} disabled={loading} aria-label={`Save ${repo.owner}/${repo.name} repository to your list`} className="ml-auto rounded-md border border-border-color bg-bg-card px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-btn cursor-pointer">
              {loading ? 'Saving...' : 'Save'}
            </button>
          )}
          {onUnsave && (
            <button onClick={handleUnsave} disabled={loading} aria-label={`Unsave ${repo.owner}/${repo.name} repository from your list`} className="ml-auto rounded-md border border-[#ff8182] bg-[#ffebe9] px-3 py-1.5 text-xs font-semibold text-[#cf222e] hover:bg-[#ffd6d3] dark:border-[#f85149]/40 dark:bg-[#f85149]/10 dark:text-[#ff7b72] dark:hover:bg-[#f85149]/20 disabled:opacity-60 cursor-pointer">
              {loading ? 'Removing...' : 'Unsave'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}