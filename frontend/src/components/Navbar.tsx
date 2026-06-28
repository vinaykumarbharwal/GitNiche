"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService, AuthSession, authStorage } from '@/services/api';

function GitHubMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(authStorage.getSession());
  }, [pathname]);

  const isLinkActive = (path: string) => (
    pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
      ? 'text-white bg-[#316dca]'
      : 'text-[#f0f6fc] hover:bg-[#30363d]'
  );

  const signOut = () => {
    authStorage.clearSession();
    setSession(null);
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#24292f] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 text-white">
              <GitHubMark />
              <span className="text-lg font-semibold tracking-tight">GitNiche</span>
            </Link>
            <span className="rounded-full border border-[#57606a] px-2 py-0.5 text-[11px] font-medium text-[#c9d1d9] md:hidden">GitHub style</span>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2 md:gap-1">
            <Link href="/" className={`${isLinkActive('/')} rounded-md px-3 py-1.5 text-sm font-medium transition`}>Explore</Link>
            <Link href="/saved" className={`${isLinkActive('/saved')} rounded-md px-3 py-1.5 text-sm font-medium transition`}>Saved</Link>
            <Link href="/about" className={`${isLinkActive('/about')} rounded-md px-3 py-1.5 text-sm font-medium transition`}>About</Link>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="flex min-w-0 items-center gap-2 rounded-md border border-[#57606a] bg-[#1f2328] px-2 py-1">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6e7781] bg-cover bg-center text-xs font-semibold"
                    style={session.avatar_url ? { backgroundImage: `url(${session.avatar_url})` } : undefined}
                    aria-hidden="true"
                  >
                    {!session.avatar_url && session.username[0]?.toUpperCase()}
                  </div>
                </div>
                <button onClick={signOut} className="rounded-md border border-[#57606a] bg-transparent px-3 py-1.5 text-sm font-medium text-[#f0f6fc] hover:bg-[#30363d]">
                  Sign out
                </button>
              </>
            ) : (
              <a href={apiService.getGitHubLoginUrl()} className="inline-flex items-center gap-2 rounded-md bg-[#2da44e] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2c974b]">
                <GitHubMark className="h-4 w-4" />
                Continue with GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
