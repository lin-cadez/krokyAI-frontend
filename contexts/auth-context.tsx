'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const storedUsername = localStorage.getItem('username')
    const storedToken = localStorage.getItem('sessionToken')
    const sessionTime = localStorage.getItem('sessionTime')
    
    if (storedUsername && storedToken && sessionTime) {
      // Check if session is expired (1 month = 30 days in milliseconds)
      const expirationTime = parseInt(sessionTime) + (30 * 24 * 60 * 60 * 1000)
      if (Date.now() > expirationTime) {
        // Session expired, clear everything
        logout()
      } else {
        setIsAuthenticated(true)
        setUsername(storedUsername)
      }
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `https://kroky-ai-backend.vercel.app/api/login?username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.auth) {
        const sessionTime = data.assignedAt.toString()
        // Store session data
        localStorage.setItem('sessionToken', data.sessionToken)
        localStorage.setItem('username', username)
        localStorage.setItem('sessionTime', sessionTime)

        setIsAuthenticated(true)
        setUsername(username)
        router.push('/profile') // Changed from '/training' to '/profile'
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('username')
    localStorage.removeItem('sessionTime')
    setIsAuthenticated(false)
    setUsername(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

