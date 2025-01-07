'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

type Meal = {
  id: number
  name: string
  date: string
  selected?: boolean
}

type DayMeals = Meal[]

export default function TrainingPage() {
  const [meals, setMeals] = useState<DayMeals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState(0)
  const [currentGroup, setCurrentGroup] = useState(0)
  const [trainingData, setTrainingData] = useState<Array<Meal[]>>([]) // Store groups of 3 meals
  const [uniqueDates, setUniqueDates] = useState<string[]>([])

  useEffect(() => {
    async function fetchMenus() {
      try {
        console.log('Fetching menus...')
        const response = await fetch('https://kroky-ai-backend.vercel.app/api/menus')
        if (!response.ok) {
          throw new Error('Failed to fetch menus')
        }
        const data: Meal[][] = await response.json()

        // Extract and sort unique dates
        const dates = Array.from(new Set(data.flat().map((meal: Meal) => meal.date))).sort()
        setUniqueDates(dates)

        // Group meals by date
        const groupedMeals = dates.map(date => 
          data.flat().filter((meal: Meal) => meal.date === date)
        )
        setMeals(groupedMeals)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch menus')
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  // Get current group of meals to compare
  const getCurrentGroup = (): Meal[] => {
    const dayMeals = meals[currentDay]
    if (!dayMeals) return []

    const groupSize = 3
    const startIndex = currentGroup * groupSize
    return dayMeals.slice(startIndex, startIndex + groupSize)
  }

  // Calculate progress
  const getTotalGroups = (dayMeals: DayMeals) => {
    const groupSize = 3
    return Math.ceil(dayMeals.length / groupSize)
  }

  const totalGroups = meals.reduce((sum, dayMeals) => sum + getTotalGroups(dayMeals), 0)
  const completedGroups = trainingData.length
  const progress = 10

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sl-SI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSelection = async (selectedMeal: Meal) => {
    const currentGroupMeals = getCurrentGroup()

    // Add to training data (stores the group of 3 meals)
    setTrainingData((prev) => [
      ...prev,
      currentGroupMeals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        date: meal.date,
        selected: meal.id === selectedMeal.id,
      })),
    ])

    // Move to the next group
    const dayMeals = meals[currentDay]
    const totalGroupsForDay = getTotalGroups(dayMeals)

    if (currentGroup + 1 >= totalGroupsForDay) {
      // Move to next day
      if (currentDay + 1 < meals.length) {
        setCurrentDay((prev) => prev + 1)
        setCurrentGroup(0)
      } else {
        // Training complete
        try {
          const trainingPayload = {
            data: trainingData.map((group) => ({
              options: group,
              selectedOptionName: group.find((meal) => meal.selected)?.name || null,
            })),
          }

          console.log('Training payload:', trainingPayload)

          setError('Training completed successfully!')
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to submit training data'
          )
        }
      }
    } else {
      // Move to the next group
      setCurrentGroup((prev) => prev + 1)
    }
  }

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
            Click on the meal you prefer to help train the AI
          </p>
          <Progress value={progress} className="mb-2" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {progress}% Complete
            </p>
            <p className="text-sm text-muted-foreground">
              Day {currentDay + 1} of {uniqueDates.length} ({formatDate(uniqueDates[currentDay])})
            </p>
            <p className="text-sm text-muted-foreground">
              Groups completed today: {currentGroup + 1} of {getTotalGroups(meals[currentDay])}
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
              <CardContent>
                <p className="text-sm text-muted-foreground">{formatDate(meal.date)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
