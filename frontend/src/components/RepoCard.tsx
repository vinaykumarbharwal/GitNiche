"use client";

import { RepoResult } from '@/services/api';
import { useState } from 'react';

interface RepoCardProps {
  repo: RepoResult;
  onSave?: (repo: RepoResult) => Promise<void>;
  isSaved?: boolean;
}

export default function RepoCard({ repo, onSave, isSaved: initialIsSaved = false }: RepoCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave || isSaved || loading) return;
    setLoading(true);
    try {
      await onSave(repo);
      setIsSaved(true);
    } catch (err) {
      console.error("Failed to save repository", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 60) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  const getDifficultyColor = (level: string) => {
    if (level === 'Beginner-Friendly') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (level === 'Advanced') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="group relative bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 overflow-hidden backdrop-blur-sm">
      {/* Glossy overlay effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          {/* Owner & Repo Name */}
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium truncate mb-0.5">{repo.owner}</p>
            <h3 className="text-lg font-bold text-slate-100 truncate group-hover:text-white transition">
              {repo.name}
            </h3>
          </div>

          {/* GitNiche Score */}
          <div className={`flex flex-col items-center justify-center border rounded-xl py-1 px-2.5 h-12 w-14 shrink-0 font-bold ${getScoreColor(repo.gitniche_score)}`}>
            <span className="text-lg leading-none">{repo.gitniche_score}</span>
            <span className="text-[7px] uppercase tracking-wider text-slate-400 mt-0.5">Score</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed mb-4 h-8">
          {repo.description || "No description provided."}
        </p>

        {/* Tags / Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {repo.language && (
            <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
              {repo.language}
            </span>
          )}
          <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
            {repo.domain}
          </span>
          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${getDifficultyColor(repo.difficulty_level)}`}>
            {repo.difficulty_level}
          </span>
        </div>
      </div>

      <div>
        {/* Repo stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-5 border-t border-slate-800/80 pt-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {repo.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {repo.forks.toLocaleString()}
          </span>
          <span className="ml-auto text-[10px] text-slate-500 font-mono">
            Active: {formatDate(repo.last_activity_date)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Main GitHub Link */}
          <a
            href={repo.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl text-center transition flex items-center justify-center gap-1.5 border border-slate-700/40"
          >
            GitHub
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Quick Launch Buttons */}
          <a
            href={repo.codespaces_url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded-xl transition border border-indigo-500/20 flex items-center justify-center"
            title="Launch in GitHub Codespaces"
          >
            Codespaces
          </a>

          <a
            href={repo.gitpod_url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-[10px] font-bold rounded-xl transition border border-purple-500/20 flex items-center justify-center"
            title="Launch in Gitpod"
          >
            Gitpod
          </a>

          {/* Save Button */}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaved || loading}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isSaved ? "Saved" : "Save repository"}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
