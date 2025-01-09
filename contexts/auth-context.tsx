'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  name: string | null
  email: string | null
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
  const [name, setName] = useState<string | null>(null)  // Store user's name
  const [email, setEmail] = useState<string | null>(null)  // Store user's email
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
    const storedName = localStorage.getItem('name')
    const storedEmail = localStorage.getItem('email')

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
        setName(storedName)
        setEmail(storedEmail)
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
        // Store session data in localStorage
        localStorage.setItem('sessionToken', data.sessionToken)
        localStorage.setItem('username', username)
        localStorage.setItem('sessionTime', sessionTime)
        localStorage.setItem('autoOrder', data.auto)  // Store auto setting
        localStorage.setItem('lessonDay', data.lessonDay)  // Store lesson day
        localStorage.setItem('name', data.name)  // Store name
        localStorage.setItem('email', data.email)  // Store email

        setIsAuthenticated(true)
        setUsername(username)
        setName(data.name || null)  // Set name
        setEmail(data.email || null)  // Set email
        setAutoOrder(data.auto)  // Set auto order
        setLessonDay(data.lessonDay || 1)  // Set lesson day

        router.push('/profile') // Redirect to profile page
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
    localStorage.removeItem('name')
    localStorage.removeItem('email')
    setIsAuthenticated(false)
    setUsername(null)
    setName(null)
    setEmail(null)
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
      name, 
      email, 
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
