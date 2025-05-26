
"use client";

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // This regex now matches /event/[id] and /event/[id]/any/sub/path
  const isEventSpecificPath = /^\/event\/[^/]+(\/.*)?$/.test(pathname);

  return (
    <html lang="en">
      <head>
        <title>EventLink - Your Personalized Event Invitations</title>
        <meta name="description" content="Create and share beautiful event invitation pages with EventLink." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          {!isEventSpecificPath && <Header />}
          <main className={`flex-grow ${isEventSpecificPath ? '' : 'container mx-auto px-4 py-8'}`}>
            {children}
          </main>
          {!isEventSpecificPath && <Footer />}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
