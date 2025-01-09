"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import NavBar with client-side rendering only
const NavBar = dynamic(() => import('./NavBar'), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
