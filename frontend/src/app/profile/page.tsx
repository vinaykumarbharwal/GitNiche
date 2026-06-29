"use client";

import PreferencesForm from '@/components/PreferencesForm';
import { apiService, authStorage } from '@/services/api';
import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [dangerLoading, setDangerLoading] = useState(false);
  const [dangerMessage, setDangerMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = authStorage.getSession();
    if (session) setUser({ id: session.user_id, username: session.username });
  }, []);

  const handleSaveSuccess = (userId: string, username: string) => {
    setUser({ id: userId, username });
  };

  const handleSignOut = () => {
    authStorage.clearSession();
    window.location.href = '/';
  };

  const handleClearSaved = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to clear all your saved repositories? This action cannot be undone.")) return;

    setDangerLoading(true);
    setDangerMessage(null);
    try {
      await apiService.clearSavedRepositories(user.id);
      alert("All saved repositories have been successfully cleared.");
    } catch (err: unknown) {
      console.error(err);
      setDangerMessage("Failed to clear saved repositories.");
    } finally {
      setDangerLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    if (!confirm("CRITICAL WARNING: Are you sure you want to delete your profile, preferences, and all saved repositories from our servers? This action is permanent and cannot be undone.")) return;

    setDangerLoading(true);
    setDangerMessage(null);
    try {
      await apiService.deleteUserData(user.id);
      authStorage.clearSession();
      alert("Your profile and data have been completely deleted.");
      window.location.href = '/';
    } catch (err: unknown) {
      console.error(err);
      setDangerMessage("Failed to delete user profile data.");
      setDangerLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-border-divider pb-6 sm:flex-row sm:items-center sm:justify-between transition duration-200">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Developer settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Connect GitHub and tune your preferred domains, languages, difficulty, and contribution goals.
          </p>
        </div>
        {user && (
          <button
            onClick={handleSignOut}
            className="rounded-md border border-[#ff8182] bg-transparent px-3 py-1.5 text-sm font-semibold text-[#cf222e] dark:text-[#ff7b72] hover:bg-[#ffebe9] dark:hover:bg-[#f85149]/10 transition duration-200 cursor-pointer"
          >
            Sign out
          </button>
        )}
      </div>

      <div className="flex w-full flex-col gap-6">
        <PreferencesForm onSaveSuccess={handleSaveSuccess} />

        {user && (
          <div className="mx-auto w-full max-w-3xl rounded-md border border-[#d0d7de] dark:border-border-color bg-bg-card p-5 transition duration-200 shadow-sm">
            <h3 className="text-base font-semibold text-text-primary mb-2">Active profile</h3>
            <div className="text-sm text-text-secondary">
              Logged in as <span className="font-semibold text-[#0969da] dark:text-[#58a6ff]">{user.username}</span>.
            </div>
          </div>
        )}

        {user && (
          <div className="mx-auto w-full max-w-3xl rounded-md border border-[#ff8182]/50 dark:border-[#f85149]/40 bg-bg-card p-5 transition duration-200 shadow-sm">
            <h3 className="text-base font-semibold text-[#cf222e] dark:text-[#ff7b72] mb-1">Danger Zone</h3>
            <p className="text-xs text-text-secondary mb-4">Permanent actions regarding your account and saved opportunities.</p>
            
            {dangerMessage && (
              <div className="mb-4 text-xs font-semibold text-[#cf222e] dark:text-[#ff7b72]">
                {dangerMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={dangerLoading}
                onClick={handleClearSaved}
                className="rounded-md border border-border-color px-4 py-2 text-sm font-semibold text-text-primary hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition duration-200 disabled:opacity-60 cursor-pointer"
              >
                Clear saved repos
              </button>
              <button
                type="button"
                disabled={dangerLoading}
                onClick={handleDeleteData}
                className="rounded-md bg-[#cf222e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c] transition duration-200 disabled:opacity-60 cursor-pointer"
              >
                Delete my profile &amp; data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}