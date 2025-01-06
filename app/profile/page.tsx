'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [autoOrder, setAutoOrder] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const handleLogout = () => {
    // Implement logout logic here
    router.push('/login')
  }

  const handleAutoOrderToggle = (checked: boolean) => {
    if (checked) {
      setShowConfirmation(true)
    } else {
      setAutoOrder(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-medium">Username</h3>
            <p className="text-muted-foreground">john.doe@example.com</p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Last Activity</h3>
            <p className="text-muted-foreground">Ordered lunch for next week - Jan 20, 2025</p>
          </div>

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

