'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoggedIn = pathname !== '/' && pathname !== '/login'

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-primary">
              KrokyAI
            </Link>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link href="/training">
                    <Button variant="ghost">Training</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost">Profile</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="destructive">Logout</Button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}

