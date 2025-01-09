'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  autoOrder: boolean
  lessonDay: number
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setAutoOrder: (value: boolean) => void
  setLessonDay: (day: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [autoOrder, setAutoOrder] = useState<boolean>(false)
  const [lessonDay, setLessonDay] = useState<number>(1)  // Default to Monday (1)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const storedUsername = localStorage.getItem('username')
    const storedToken = localStorage.getItem('sessionToken')
    const sessionTime = localStorage.getItem('sessionTime')
    const storedAutoOrder = localStorage.getItem('autoOrder') === 'true'
    const storedLessonDay = Number(localStorage.getItem('lessonDay')) || 1

    if (storedUsername && storedToken && sessionTime) {
      // Check if session is expired (1 month = 30 days in milliseconds)
      const expirationTime = parseInt(sessionTime) + (30 * 24 * 60 * 60 * 1000)
      if (Date.now() > expirationTime) {
        // Session expired, clear everything
        logout()
      } else {
        setIsAuthenticated(true)
        setUsername(storedUsername)
        setAutoOrder(storedAutoOrder)
        setLessonDay(storedLessonDay)
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
        localStorage.setItem('autoOrder', data.auto)  // Default to false
        localStorage.setItem('lessonDay', data.lessonDay)  //  Default to Monday (1)

        setIsAuthenticated(true)
        setUsername(username)
        setAutoOrder(false)
        setLessonDay(1)
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
    localStorage.removeItem('autoOrder')
    localStorage.removeItem('lessonDay')
    setIsAuthenticated(false)
    setUsername(null)
    setAutoOrder(false)
    setLessonDay(1)
    router.push('/login')
  }

  // Update autoOrder in localStorage
  const handleSetAutoOrder = (value: boolean) => {
    localStorage.setItem('autoOrder', String(value))
    setAutoOrder(value)
  }

  // Update lessonDay in localStorage
  const handleSetLessonDay = (day: number) => {
    localStorage.setItem('lessonDay', String(day))
    setLessonDay(day)
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      username, 
      autoOrder, 
      lessonDay, 
      login, 
      logout, 
      setAutoOrder: handleSetAutoOrder, 
      setLessonDay: handleSetLessonDay
    }}>
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
