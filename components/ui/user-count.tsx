'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

export function UserCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("https://kroky-ai-backend.vercel.app/api/userCount")
      .then(async (res) => {
        const data: { userCount: number } = await res.json()
        setCount(data.userCount)
      })
      .catch(console.error)
  }, [])

  if (count === null) return null

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
      <Users className="h-5 w-5" />
      <span className="text-sm font-medium">Število uporabnikov: {count}</span>
    </div>
  )
}

