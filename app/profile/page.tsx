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

  const handleAutoOrderToggle = (checked: boolean) => {
    if (checked) {
      setShowConfirmation(true)
    } else {
      setAutoOrder(false)
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

