"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authStorage } from '@/services/api';

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const message = params.get('error') || params.get('message');
    if (message) {
      setError(message);
      return;
    }

    const user_id = params.get('user_id');
    const username = params.get('username');
    const email = params.get('email') || '';
    const avatar_url = params.get('avatar_url') || undefined;

    if (!user_id || !username) {
      setError('GitHub did not return a usable profile. Please try again.');
      return;
    }

    authStorage.saveSession({ user_id, username, email, avatar_url });
    router.replace('/');
  }, [params, router]);

  return (
    <div className="w-full max-w-md rounded-md border border-[#30363d] bg-[#161b22] p-6 text-center shadow-sm">
      {error ? (
        <>
          <h1 className="mb-2 text-lg font-semibold text-[#f0f6fc]">GitHub sign in failed</h1>
          <p className="mb-5 text-sm text-[#8b949e]">{error}</p>
          <Link href="/" className="inline-flex rounded-md border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-medium text-[#f0f6fc] hover:bg-[#30363d]">
            Back to Explore
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff]" />
          <h1 className="text-lg font-semibold text-[#f0f6fc]">Signing you in with GitHub</h1>
        </>
      )}
    </div>
  );
}

export default function AuthCallback() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff]" />}>
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}
