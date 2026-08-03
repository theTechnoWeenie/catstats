import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "catstats",
  description: "A light dashboard to track a cat's feeding schedule and monitor trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-black/[.08] bg-zinc-50 dark:border-white/[.145] dark:bg-black">
          <div className="mx-auto flex w-full max-w-3xl gap-4 px-6 py-3 text-sm">
            <Link href="/" className="font-medium hover:underline">
              Main
            </Link>
            <Link href="/audit" className="font-medium hover:underline">
              Audit Log
            </Link>
            <Link href="/admin" className="font-medium hover:underline">
              Admin
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
