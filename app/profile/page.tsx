"use client";

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {TrainingStatus} from "@/components/training-status"
import { useAuth } from '@/contexts/auth-context'
import { Clock, Key,  User, Mail, Brain, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { isAuthenticated, username } = useAuth()
  const [isTrainingComplete, setIsTrainingComplete] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const trainingComplete = localStorage.getItem('isTrainingComplete') === 'true'
      setIsTrainingComplete(trainingComplete)
    }
  }, [])

  const [autoOrder, setAutoOrder] = useState(false)
  const [lessonDay, setLessonDay] = useState(1)  // Default lesson day to Monday (1)
  const [sessionInfo, setSessionInfo] = useState({
    token: '',
    createdAt: '',
    expiresAt: ''
  })
  const [userName, setUserName] = useState<string | null>(null) // To store the user's name
  const [userEmail, setUserEmail] = useState<string | null>(null) // To store the user's email

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref to store the timeout ID

  useEffect(() => {
    // Get session and user info from localStorage
    const token = localStorage.getItem('sessionToken') || ''
    const timestamp = localStorage.getItem('sessionTime') || ''
    const storedAutoOrder = localStorage.getItem('autoOrder') === 'true'
    const storedLessonDay = parseInt(localStorage.getItem('lessonDay') || '1')
    const storedName = localStorage.getItem('name')
    const storedEmail = localStorage.getItem('email')

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

      // Set name and email from localStorage
      setUserName(storedName)
      setUserEmail(storedEmail)
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
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">Nastavitve profila</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6">
            {/* User Information Section */}
            <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground">Uporabniško ime</h3>
                  <p className="font-medium">{username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground">Ime</h3>
                  <p className="font-medium">{userName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p className="font-medium">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground">Seja ustvarjena</h3>
                  <p className="font-medium">{sessionInfo.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Avtomatsko naročanje</h3>
                    <p className="text-sm text-muted-foreground">
                      Dovoli, da umtna inteligenca naroča malice namesto tebe
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoOrder}
                  onCheckedChange={handleAutoOrderToggle}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Popoldanski pouk</h3>
                    <p className="text-sm text-muted-foreground">
                      Izberi dan, ko imaš pouk popoldne
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2 pt-2">
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <Button
                      key={day}
                      variant={lessonDay === day ? "default" : "outline"}
                      onClick={() => handleLessonDayChange(day)}
                      className="w-full"
                      size="sm"
                    >
                      {["Noup", "Pon", "Tor", "Sre", "Čet", "Pet"][day - 1]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Training Status */}
              <div className="flex items-center space-x-4">
              <TrainingStatus isComplete={isTrainingComplete} />

            
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
