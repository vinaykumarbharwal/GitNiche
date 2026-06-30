"use client";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-md border border-border-color bg-bg-card p-6 shadow-sm sm:p-8 transition duration-200">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Terms of Service</h1>
        <p className="mt-2 text-sm text-text-secondary">Last updated: June 29, 2026</p>

        <div className="mt-6 border-t border-border-divider pt-6 space-y-6 text-sm leading-6 text-text-secondary">
          <section>
            <h2 className="text-base font-semibold text-text-primary">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using the GitNiche platform (&quot;Service&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">2. Description of Service</h2>
            <p className="mt-2">
              GitNiche is an open-source repository discovery dashboard. We provide categorization, matching scores, search results caching, and bookmarking functionality. All repository content, source files, and contribution labels originate from GitHub, Inc.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">3. User Conduct &amp; GitHub Scopes</h2>
            <p className="mt-2">
              Users connect their GitHub account using OAuth. You agree not to exploit or abuse the Service&apos;s query endpoints or database storage. You must abide by GitHub&apos;s standard Acceptable Use Policies when initiating contributions or launching Codespaces.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">4. Disclaimers</h2>
            <p className="mt-2">
              GitNiche is provided &quot;as is&quot; and &quot;as available&quot;. We do not guarantee the completeness, accuracy, or availability of indexed repository metrics (stars, issue counts, activity timestamps). Discovering and contributing to external repositories is performed entirely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary">5. Changes to Terms</h2>
            <p className="mt-2">
              We reserve the right to modify these Terms of Service at any time. Your continued use of the Service following modifications denotes acceptance of the revised Terms.
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
