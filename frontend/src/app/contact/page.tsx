"use client";

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-md border border-border-color bg-bg-card p-6 shadow-sm sm:p-8 transition duration-200">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Contact</h1>
        <p className="mt-2 text-sm text-text-secondary">Have feedback, suggestions, or questions?</p>

        <div className="mt-6 border-t border-border-divider pt-6 space-y-6 text-sm leading-6 text-text-secondary">
          <p>
            GitNiche is built and maintained by <strong>Vinay Kumar</strong>. We are always looking to improve our categorization filters, score formulas, and matching systems.
          </p>

          <div>
            <h2 className="text-base font-semibold text-text-primary mb-2">Get in Touch</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong>GitHub Profile:</strong>{' '}
                <a
                  href="https://github.com/vinaykumarbharwal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0969da] dark:text-[#58a6ff] hover:underline"
                >
                  @vinaykumarbharwal
                </a>
              </li>
              <li>
                <strong>GitNiche Repository:</strong>{' '}
                <a
                  href="https://github.com/vinaykumarbharwal/GitNiche"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0969da] dark:text-[#58a6ff] hover:underline"
                >
                  vinaykumarbharwal/GitNiche
                </a>
              </li>
              <li>
                <strong>Issue Tracker:</strong> If you find bug reports, display scaling glitches, or missing metadata features, please open a ticket on the{' '}
                <a
                  href="https://github.com/vinaykumarbharwal/GitNiche/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0969da] dark:text-[#58a6ff] hover:underline"
                >
                  GitHub Issues
                </a>{' '}
                page.
              </li>
            </ul>
          </div>
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
