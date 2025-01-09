'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

function NavBar() {
  const { isAuthenticated, logout} = useAuth()
  const pathname = usePathname()
  const b = localStorage.getItem('isTrainingComplete')==='true';


  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary">
          KrokyAI
        </Link>
        <div className="flex items-center gap-4">
          
          {isAuthenticated ? (
            <>
              <Link href="/training" className="relative">
                <Button variant="ghost">Training</Button>
                {/* Display red dot notification if training is not complete */}
                {!b && (
                  <div className="absolute top-3 right-0 w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                )}
              </Link>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            pathname !== '/login' && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
  )
}
