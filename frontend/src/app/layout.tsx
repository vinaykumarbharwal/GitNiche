import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "GitNiche | Discover Open Source Opportunities",
  description: "AI-powered platform to find active, beginner-friendly open-source contribution opportunities customized for your developer stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans selection:bg-[#0969da]/20 transition-colors duration-200">
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
                className="font-medium text-[#0969da] hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}