'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/contexts/auth-context'
import { Clock, Key, Activity } from 'lucide-react'

export default function ProfilePage() {
  const { username, isAuthenticated } = useAuth()
  const [autoOrder, setAutoOrder] = useState(false)
  const [lessonDay, setLessonDay] = useState(1)  // Default lesson day to Monday (1)
  const [sessionInfo, setSessionInfo] = useState({
    token: '',
    createdAt: '',
    expiresAt: ''
  })

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref to store the timeout ID

  useEffect(() => {
    // Get session and user info from localStorage
    const token = localStorage.getItem('sessionToken') || ''
    const timestamp = localStorage.getItem('sessionTime') || ''
    const storedAutoOrder = localStorage.getItem('autoOrder') === 'true'
    const storedLessonDay = parseInt(localStorage.getItem('lessonDay') || '1')

    if (timestamp) {
      const creationTime = parseInt(timestamp)
      const expirationTime = creationTime + (30 * 24 * 60 * 60 * 1000)
    
      setSessionInfo({
        token: token.slice(0, 8) + '...',  // Display a truncated session token
        createdAt: new Date(creationTime).toLocaleString(),
        expiresAt: new Date(expirationTime).toLocaleString()
      })

      // Set the auto order and lesson day from localStorage
      setAutoOrder(storedAutoOrder)
      setLessonDay(storedLessonDay)
    }
  }, [])

  const handleAutoOrderToggle = (checked: boolean) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current) // Clear the previous timeout if any
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setAutoOrder(checked)
      localStorage.setItem('autoOrder', String(checked))  // Save the new auto order setting

      // Send API request to update auto order value
      try {
        const sessionToken = localStorage.getItem('sessionToken') || ''
        const response = await fetch('https://kroky-ai-backend.vercel.app/api/switchAuto', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            sessionToken: sessionToken,
            auto: checked,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log(data.message)  // success message
        } else {
          console.error(data.error)  // error message
        }
      } catch (error) {
        console.error('Error updating auto order:', error)
      }
    }, 250)
  }

  const handleLessonDayChange = async (newLessonDay: number) => {
    setLessonDay(newLessonDay)
    localStorage.setItem('lessonDay', String(newLessonDay))  // Save the new lesson day

    try {
      const sessionToken = localStorage.getItem('sessionToken') || ''
      const response = await fetch('https://kroky-ai-backend.vercel.app/api/changeLessonDay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          sessionToken: sessionToken,
          lessonDay: newLessonDay,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log(data.message)  // success message
      } else {
        console.error(data.error)  // error message
      }
    } catch (error) {
      console.error('Error updating lesson day:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="flex items-center space-x-4">
              <Key className="h-6 w-6 text-primary" />
              <div className="space-y-0.5">
                <h3 className="font-medium">Username</h3>
                <p className="text-muted-foreground">{username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6 text-primary" />
              <div className="space-y-0.5">
                <h3 className="font-medium">Session Created</h3>
                <p className="text-muted-foreground">{sessionInfo.createdAt}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6 text-primary" />
              <div className="space-y-0.5">
                <h3 className="font-medium">Session Expires</h3>
                <p className="text-muted-foreground">{sessionInfo.expiresAt}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Activity className="h-6 w-6 text-primary" />
              <div className="space-y-0.5">
                <h3 className="font-medium">Session Token</h3>
                <p className="text-muted-foreground font-mono">{sessionInfo.token}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Automatic Ordering</h3>
                  <p className="text-sm text-muted-foreground">
                    Let AI order meals for you automatically
                  </p>
                </div>
                <Switch
                  checked={autoOrder}
                  onCheckedChange={(checked) => handleAutoOrderToggle(checked)}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Lesson Day</h3>
                  <p className="text-sm text-muted-foreground">
                    Izberi dan, ko imaš pouk popoldne
                  </p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <Button
                      key={day}
                      variant={lessonDay === day ? "default" : "outline"}
                      onClick={() => handleLessonDayChange(day)}
                    >
                      {["Noup", "Pon", "Tor", "Sre", "Čet", "Pet"][day - 1]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
