"use client";

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-md border border-border-color bg-bg-card p-6 shadow-sm sm:p-8 transition duration-200">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">What is GitNiche?</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
          GitNiche is a smart discovery app that helps developers find open-source repositories they can actually contribute to,
          based on skills, languages, and difficulty level.
        </p>

        {/* Benefits Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border-color bg-bg-btn p-4 transition duration-200">
            <h2 className="text-sm font-semibold text-text-primary">1) Search smarter</h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              It filters noisy GitHub results so you can spend less time doom-scrolling and more time building.
            </p>
          </div>
          <div className="rounded-md border border-border-color bg-bg-btn p-4 transition duration-200">
            <h2 className="text-sm font-semibold text-text-primary">2) Match your level</h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Beginner-Friendly, Intermediate, or Advanced. Your call. Your pace.
            </p>
          </div>
          <div className="rounded-md border border-border-color bg-bg-btn p-4 transition duration-200">
            <h2 className="text-sm font-semibold text-text-primary">3) Save what matters</h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Bookmark promising repos and come back when your coffee is hot and your motivation is even hotter.
            </p>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3">How GitNiche Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
            <li><strong>Fetches active GitHub repositories:</strong> We query GitHub's Search API for recently active projects.</li>
            <li><strong>Labels them:</strong> Our categorizer assigns matching labels for domain (e.g. AI/ML, DevOps), primary language, and developer difficulty level.</li>
            <li><strong>Helps you find work:</strong> Ranks and scores repositories to showcase those with open issues and active maintainers.</li>
            <li><strong>Saves your bookmarks:</strong> Save opportunities to your profile so you can revisit them anytime.</li>
          </ol>
        </div>

        {/* Trust & Transparency Section */}
        <div className="mt-8 rounded-md border border-border-color bg-bg-btn p-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <svg className="h-4 w-4 text-[#2da44e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Trust &amp; Transparency
          </h2>
          <p className="mt-2 text-xs text-text-secondary leading-5">
            GitNiche requests strictly read-only profile scopes. We do not request write permissions to your public or private repositories, and we will never create, modify, or delete your code or pull requests. GitHub OAuth is used purely to identify you and sync your bookmarks.
          </p>
        </div>

        {/* Fun Lines Section */}
        <div className="mt-8 rounded-md border border-[#54aeff]/40 bg-[#ddf4ff]/10 dark:border-[#388bfd]/20 dark:bg-[#388bfd]/5 p-4 transition duration-200">
          <h2 className="text-sm font-semibold text-[#0969da] dark:text-[#58a6ff]">A few honest lines</h2>
          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
            <li>• GitNiche helps you find good first issues before your attention span finds a meme.</li>
            <li>• No more opening 27 tabs and forgetting why tab #3 existed.</li>
            <li>• Our algorithm does not judge your commit message style... yet.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c974b]">
            Start Exploring
          </Link>
          <Link href="/saved" className="rounded-md border border-border-color bg-bg-btn px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-card transition duration-200">
            View Saved Repos
          </Link>
        </div>
      </div>
    </div>
  );
}
