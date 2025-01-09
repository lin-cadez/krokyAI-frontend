'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

type Meal = {
  id: number
  name: string
  date: string
  selected?: boolean
  confidence_score?: number
}

type DayMeals = Meal[]

export default function TrainingPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<DayMeals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState(0)
  const [currentGroup, setCurrentGroup] = useState(0)
  const [trainingData, setTrainingData] = useState<Array<Meal[]>>([])
  const [skipPressed, setSkipPressed] = useState(false)
  const [startTime, setStartTime] = useState<number>(0) // Track decision start time

  useEffect(() => {
    async function fetchMenus() {
      try {
        const response = await fetch('https://kroky-ai-backend.vercel.app/api/menus')
        if (!response.ok) {
          throw new Error('Failed to fetch menus')
        }
        const data: Meal[][] = await response.json()

        const dates = Array.from(new Set(data.flat().map((meal: Meal) => meal.date))).sort()

        const groupedMeals = dates.map(date =>
          data.flat().filter((meal: Meal) => meal.date === date)
        )
        setMeals(groupedMeals)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menus')
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  const getCurrentGroup = (): Meal[] => {
    const dayMeals = meals[currentDay]
    if (!dayMeals) return []

    const groupSize = 3
    const startIndex = currentGroup * groupSize
    return dayMeals.slice(startIndex, startIndex + groupSize)
  }

  const getTotalGroups = (dayMeals: DayMeals) => {
    const groupSize = 3
    return Math.ceil(dayMeals.length / groupSize)
  }

  const calculateConfidenceScore = (decisionTime: number) => {
    if (decisionTime > 40) return 1
    if (decisionTime > 10) return Math.min(100, 1 + (10 / decisionTime) ** 2)
    return Math.min(100, 1 + 50 / decisionTime)
  }

  const totalGroups = meals.reduce((sum, dayMeals) => sum + getTotalGroups(dayMeals), 0)
  const completedGroups = trainingData.length
  const progress = Math.round((completedGroups / totalGroups) * 100)

  const handleSelection = async (selectedMeal?: Meal) => {
    const currentGroupMeals = getCurrentGroup()
    const endTime = Date.now()
    const decisionTime = (endTime - startTime) / 1000 // Time in seconds
    const confidenceScore = calculateConfidenceScore(decisionTime)

    if (selectedMeal) {
      setTrainingData((prev) => [
        ...prev,
        currentGroupMeals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          date: meal.date,
          selected: meal.id === selectedMeal.id,
          confidence_score: confidenceScore,
        })),
      ])
    } else {
      setTrainingData((prev) => [
        ...prev,
        currentGroupMeals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          date: meal.date,
          selected: false,
          confidence_score: confidenceScore,
        })),
      ])
      setSkipPressed(true)
    }

    const dayMeals = meals[currentDay]
    const totalGroupsForDay = getTotalGroups(dayMeals)

    if (currentGroup + 1 >= totalGroupsForDay) {
      if (currentDay + 1 < meals.length) {
        setCurrentDay((prev) => prev + 1)
        setCurrentGroup(0)
        setSkipPressed(false)
      } else {
        try {
            const trainingPayload = trainingData.map((group) => {
            const selectedMeal = group.find((meal) => meal.selected)
            return {
              options: group.map((meal) => meal.name),
              selectedOption: selectedMeal?.name || null,
              confidence_score: selectedMeal?.confidence_score || null,
            }
            })
          console.log("Training data:", trainingPayload)

          const username = localStorage.getItem('username')
          const sessionToken = localStorage.getItem('sessionToken')

          if (!username || !sessionToken) {
            throw new Error('Username or sessionToken is missing from local storage')
          }

          const response = await fetch(`https://kroky-ai-backend.vercel.app/api/upload?username=${encodeURIComponent(username)}&sessionToken=${encodeURIComponent(sessionToken)}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ trainingData: trainingPayload }),
          })

          if (!response.ok) {
            throw new Error(`Failed to submit training data: ${response.statusText}`)
          }

          setError("Training completed successfully!")
          localStorage.setItem('isTrainingComplete', 'true')
          router.push('/profile')
          


        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to submit training data")
        }
      }
    } else {
      setCurrentGroup((prev) => prev + 1)
    }

    setStartTime(Date.now()) // Reset start time for the next group
  }

  useEffect(() => {
    setStartTime(Date.now()) // Set start time when a new group is shown
  }, [currentDay, currentGroup])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant={error.includes('successfully') ? 'default' : 'destructive'}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentGroupMeals = getCurrentGroup()

  if (!currentGroupMeals.length) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertDescription>No more meals to compare.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Train Your AI</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Click on the meal you prefer or skip if you don&apos;t like any of them
          </p>

          <Progress value={progress} className="mb-2" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {progress}% Complete
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {currentGroupMeals.map(meal => (
            <Card
              key={meal.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelection(meal)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{meal.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-4">
          <button
            className={`px-4 py-2 text-sm ${
              skipPressed ? "bg-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
            } rounded`}
            onClick={() => handleSelection(undefined)}
            disabled={skipPressed}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
