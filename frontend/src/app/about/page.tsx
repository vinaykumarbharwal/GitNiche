import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#24292f]">What is GitNiche?</h1>
        <p className="mt-3 text-sm leading-6 text-[#57606a] sm:text-base">
          GitNiche is a smart discovery app that helps developers find open-source repositories they can actually contribute to,
          based on skills, languages, and difficulty level.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-4">
            <h2 className="text-sm font-semibold text-[#24292f]">1) Search smarter</h2>
            <p className="mt-2 text-xs leading-5 text-[#57606a]">
              It filters noisy GitHub results so you can spend less time doom-scrolling and more time building.
            </p>
          </div>
          <div className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-4">
            <h2 className="text-sm font-semibold text-[#24292f]">2) Match your level</h2>
            <p className="mt-2 text-xs leading-5 text-[#57606a]">
              Beginner-Friendly or Advanced. Your call. Your pace.
            </p>
          </div>
          <div className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-4">
            <h2 className="text-sm font-semibold text-[#24292f]">3) Save what matters</h2>
            <p className="mt-2 text-xs leading-5 text-[#57606a]">
              Bookmark promising repos and come back when your coffee is hot and your motivation is even hotter.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-md border border-[#bfd8ff] bg-[#ddf4ff] p-4">
          <h2 className="text-sm font-semibold text-[#0969da]">A few honest funny lines</h2>
          <ul className="mt-2 space-y-1 text-sm text-[#0a3069]">
            <li>GitNiche helps you find good first issues before your attention span finds a meme.</li>
            <li>No more opening 27 tabs and forgetting why tab #3 existed.</li>
            <li>Our algorithm does not judge your commit message style... yet.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c974b]">
            Start Exploring
          </Link>
          <Link href="/saved" className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-4 py-2 text-sm font-semibold text-[#24292f] hover:bg-white">
            View Saved Repos
          </Link>
        </div>

        <p className="mt-8 text-sm font-medium text-[#57606a]">
          Built by Vinay Kumar |
          {' '}
          <a
            href="https://github.com/vinaykumarbharwal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0969da] hover:underline"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
