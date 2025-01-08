'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/contexts/auth-context'
import { Clock, Key, Activity } from 'lucide-react'

export default function ProfilePage() {
  const { username, isAuthenticated } = useAuth()
  const [autoOrder, setAutoOrder] = useState(false)
  const [lessonDay, setLessonDay] = useState(1)  // Default lesson day to Monday (1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sessionInfo, setSessionInfo] = useState({
    token: '',
    createdAt: '',
    expiresAt: ''
  })

  useEffect(() => {
    // Get session information from localStorage
    const token = localStorage.getItem('sessionToken') || ''
    const timestamp = localStorage.getItem('sessionTime') || ''
    
    if (timestamp) {
      const creationTime = parseInt(timestamp)
      const expirationTime = creationTime + (30 * 24 * 60 * 60 * 1000)
    
      setSessionInfo({
        token: token.slice(0, 8) + '...',
        createdAt: new Date(creationTime).toLocaleString(),
        expiresAt: new Date(expirationTime).toLocaleString()
      })
    }
  }, [])

  const handleAutoOrderToggle = async (checked: boolean) => {
    setAutoOrder(checked)

    if (checked) {
      setShowConfirmation(true)
    } else {
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
    }
  }

  const handleLessonDayChange = async (newLessonDay: number) => {
    setLessonDay(newLessonDay)

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
                  onCheckedChange={handleAutoOrderToggle}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Lesson Day</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the day of the week for your lessons (1 = Monday, 7 = Sunday)
                  </p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <Button
                      key={day}
                      variant={lessonDay === day ? "default" : "outline"}
                      onClick={() => handleLessonDayChange(day)}
                    >
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day - 1]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {showConfirmation && (
          <div className="p-4 border-t bg-muted">
            <p className="mb-4 text-sm">
              By enabling AI ordering, the system will automatically place lunch orders based on your preferences. You can disable this feature at any time.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setAutoOrder(true)
                  setShowConfirmation(false)
                }}
              >
                Continue
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
