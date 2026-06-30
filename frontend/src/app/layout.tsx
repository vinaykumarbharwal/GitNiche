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
      <body className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col font-sans selection:bg-[#1f6feb]/30">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <footer className="border-t border-[#30363d] bg-[#161b22] py-6 text-center text-xs text-[#8b949e] mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <p>(c) {new Date().getFullYear()} GitNiche. Find open-source work faster.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
