import { DayMeals, TrainingData } from "@/types/meals"


export async function trainModel(data: TrainingData): Promise<string> {
  const response = await fetch('http://localhost:5000/train', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to train the model: ${response.statusText}`)
  }
  
  return response.text()
}