export type Meal = {
  id: number
  name: string
  date: string
  selected?: boolean
}

export type DayMeals = Meal[]

export type TrainingData = {
  data: {
    id: number
    name: string
    selected: boolean
  }[][]
}

