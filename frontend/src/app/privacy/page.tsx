"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-md border border-border-color bg-bg-card p-6 shadow-sm sm:p-8 transition duration-200">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-secondary">Last updated: June 29, 2026</p>
        
        <div className="mt-6 border-t border-border-divider pt-6 space-y-6 text-sm leading-6 text-text-secondary">
          <section>
            <h2 className="text-base font-semibold text-text-primary">1. What Data Do We Collect?</h2>
            <p className="mt-2">
              GitNiche is built around open-source search and discovery. When you authorize using GitHub OAuth, we collect:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 pl-2">
              <li>Your public GitHub username</li>
              <li>Your public email address (to identify your developer profile)</li>
              <li>Your public avatar image URL</li>
            </ul>
            <p className="mt-2 font-semibold text-text-primary">
              We DO NOT request, collect, or store any private source code repositories, passwords, or SSH keys.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">2. How Do We Use Your Data?</h2>
            <p className="mt-2">
              The data we collect is utilized strictly to run the GitNiche platform features:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 pl-2">
              <li>To persist your bookmarks/saved repositories across sessions.</li>
              <li>To save your contribution stack preferences (languages, domains, experience level) and calculate personalized GitNiche opportunity match scores.</li>
              <li>To allow you to customize developer search profiles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">3. Data Storage &amp; Security</h2>
            <p className="mt-2">
              Your profile preferences and bookmarked repositories are securely stored in our Supabase database instance. We do not sell, rent, or distribute your information to any advertising networks, third-party analytics firms, or companies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">4. Total Control &amp; Deletion</h2>
            <p className="mt-2">
              We believe developers should have absolute control over their profiles and data. At any time, you can:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 pl-2">
              <li>Clear all saved bookmarked repositories.</li>
              <li>Completely delete your developer settings, stack preferences, and account profile.</li>
            </ul>
            <p className="mt-2">
              These options are instantly accessible in the <strong>Danger Zone</strong> section of your{' '}
              <Link href="/profile" className="font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline">
                Developer Settings
              </Link>{' '}
              page. Deletions are processed immediately and are permanently removed from all database tables.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">5. Contact</h2>
            <p className="mt-2">
              If you have any questions about this Privacy Policy, please open an issue on the{' '}
              <a
                href="https://github.com/vinaykumarbharwal/GitNiche"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-border-divider pt-6">
          <Link href="/" className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c974b]">
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
