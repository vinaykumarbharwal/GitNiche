"use client";

import PreferencesForm from '@/components/PreferencesForm';
import { authStorage } from '@/services/api';
import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const session = authStorage.getSession();
    if (session) setUser({ id: session.user_id, username: session.username });
  }, []);

  const handleSaveSuccess = (userId: string, username: string) => {
    setUser({ id: userId, username });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 border-b border-[#d8dee4] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">Developer settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57606a]">
          Connect GitHub and tune your preferred domains, languages, difficulty, and contribution goals.
        </p>
      </div>

      <div className="flex w-full flex-col gap-5">
        <PreferencesForm onSaveSuccess={handleSaveSuccess} />

        {user && (
          <div className="mx-auto w-full max-w-3xl rounded-md border border-[#d0d7de] bg-white p-4 text-sm text-[#57606a] shadow-sm">
            Active profile: <span className="font-semibold text-[#0969da]">{user.username}</span>
          </div>
        )}
      </div>
    </div>
  );
}