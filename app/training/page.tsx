'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'
import { getMenus, trainModel } from '@/utils/api'
import type { DayMeals, Meal, TrainingData } from '@/types/meals'

export default function TrainingPage() {
  const [meals, setMeals] = useState<DayMeals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState(0)
  const [currentPair, setCurrentPair] = useState(0)
  const [trainingData, setTrainingData] = useState<TrainingData>({ data: [] })

  // Fetch menus on component mount
  useEffect(() => {
    async function fetchMenus() {
      try {
        const menus = await getMenus()
        console.log('Fetched menus:', menus)
        setMeals(menus)
      } catch (err) {
        console.error('Error fetching menus:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch menus')
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  // Calculate progress
  const totalDays = meals.length
  const getPairsForDay = (dayMeals: Meal[]) => {
    const n = dayMeals.length
    return (n * (n - 1)) / 2
  }
  
  const totalPairs = meals.reduce((sum, dayMeals) => sum + getPairsForDay(dayMeals), 0)
  console.log('Total pairs:', totalPairs)

  const currentDayCompletedPairs = currentPair
  const previousDaysCompletedPairs = meals
    .slice(0, currentDay)
    .reduce((sum, dayMeals) => sum + getPairsForDay(dayMeals), 0)
  const completedPairs = previousDaysCompletedPairs + currentDayCompletedPairs
  const progress = totalPairs > 0 ? (completedPairs / totalPairs) * 100 : 0
  console.log('Progress:', progress)

  // Get current pair of meals to compare
  const getCurrentPair = (): [Meal | null, Meal | null] => {
    const dayMeals = meals[currentDay]
    if (!dayMeals) return [null, null]
    
    let pairIndex = currentPair
    for (let i = 0; i < dayMeals.length; i++) {
      for (let j = i + 1; j < dayMeals.length; j++) {
        if (pairIndex === 0) {
          return [dayMeals[i], dayMeals[j]]
        }
        pairIndex--
      }
    }
    
    return [null, null]
  }

  const selectPreference = async (meal1: Meal, meal2: Meal, preferredId: number) => {
    // Add the pair to training data
    const newPair = [
      { id: meal1.id, name: meal1.name, selected: meal1.id === preferredId },
      { id: meal2.id, name: meal2.name, selected: meal2.id === preferredId }
    ]
    
    setTrainingData(prev => ({
      data: [...prev.data, newPair]
    }))

    // Move to next pair
    const dayMeals = meals[currentDay]
    const totalPairsForCurrentDay = getPairsForDay(dayMeals)
    
    const nextPair = currentPair + 1
    if (nextPair >= totalPairsForCurrentDay) {
      if (currentDay + 1 < totalDays) {
        // Move to next day
        setCurrentDay(currentDay + 1)
        setCurrentPair(0)
      } else {
        // Training complete - send data to API
        try {
          await trainModel(trainingData)
          setError('Training completed successfully!')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to train model')
        }
      }
    } else {
      setCurrentPair(nextPair)
    }
  }

  const [meal1, meal2] = getCurrentPair()
  console.log('Current pair:', meal1, meal2)

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

  if (!meal1 || !meal2) {
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
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete - Day {currentDay + 1}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => selectPreference(meal1, meal2, meal1.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Option 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-2">{meal1.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(meal1.date).toLocaleDateString('sl-SI')}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => selectPreference(meal1, meal2, meal2.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg">Option 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-2">{meal2.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(meal2.date).toLocaleDateString('sl-SI')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}