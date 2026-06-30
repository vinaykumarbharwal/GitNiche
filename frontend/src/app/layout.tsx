import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL("https://gitniche.com"),
  title: "GitNiche | Find Open Source Projects for Your Skills",
  description: "GitNiche helps developers find beginner-friendly open-source repositories by language, domain, and difficulty.",
  openGraph: {
    title: "GitNiche - Open Source Project Discovery",
    description: "Find GitHub repositories that match your tech stack and contribution level.",
    url: "https://gitniche.com",
    siteName: "GitNiche",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitNiche - Discover Open Source Opportunities",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitNiche - Open Source Project Discovery",
    description: "Find GitHub repositories that match your tech stack and contribution level.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans selection:bg-[#1f6feb]/30 transition-colors duration-200">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <footer className="border-t border-border-color bg-bg-footer py-6 text-center text-xs text-text-secondary mt-auto transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4">
            <p>(c) {new Date().getFullYear()} GitNiche. Find open-source work faster.</p>
            <p className="mt-1">
              Built by Vinay Kumar |{' '}
              <a
                href="https://github.com/vinaykumarbharwal"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#58a6ff] hover:underline"
              >
                GitHub
              </a>
              {' '}|{' '}
              <Link href="/privacy" className="font-medium text-[#58a6ff] hover:underline">
                Privacy Policy
              </Link>
              {' '}|{' '}
              <Link href="/terms" className="font-medium text-[#58a6ff] hover:underline">
                Terms of Service
              </Link>
              {' '}|{' '}
              <Link href="/contact" className="font-medium text-[#58a6ff] hover:underline">
                Contact
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
