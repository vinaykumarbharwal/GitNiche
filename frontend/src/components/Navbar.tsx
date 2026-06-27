"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    return pathname === path ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white transition';
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/75 border-b border-slate-800/80 w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                G
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-200 via-purple-300 to-indigo-100 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                GitNiche
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 tracking-wider">
                MVP
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className={`${isLinkActive('/')} text-sm font-medium tracking-wide`}>
              Explore
            </Link>
            <Link href="/saved" className={`${isLinkActive('/saved')} text-sm font-medium tracking-wide`}>
              Saved Opportunities
            </Link>
            <Link href="/profile" className={`${isLinkActive('/profile')} text-sm font-medium tracking-wide`}>
              Preferences
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
