"use client";

import PreferencesForm from '@/components/PreferencesForm';
import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('gitniche_user_id');
    const savedUsername = localStorage.getItem('gitniche_username');
    if (savedUserId && savedUsername) {
      setUser({ id: savedUserId, username: savedUsername });
    }
  }, []);

  const handleSaveSuccess = (userId: string, username: string) => {
    setUser({ id: userId, username });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 flex flex-col items-center">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-2">
          Developer Settings
        </h1>
        <p className="text-xs text-slate-400">
          Customize your experience by adding your GitHub handle, target experience levels, preferred language tech stack, and career goals.
        </p>
      </div>

      <div className="w-full flex flex-col gap-8">
        <PreferencesForm onSaveSuccess={handleSaveSuccess} />

        {user && (
          <div className="max-w-2xl mx-auto w-full p-6 border border-slate-900 rounded-2xl bg-slate-950/40 text-center text-xs text-slate-500">
            Active Profile Session: <span className="text-indigo-400 font-semibold">{user.username}</span> ({user.id})
          </div>
        )}
      </div>
    </div>
  );
}
