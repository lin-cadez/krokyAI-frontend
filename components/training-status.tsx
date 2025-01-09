import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrainingStatusProps {
  isComplete: boolean
  className?: string
}

export function TrainingStatus({ isComplete, className }: TrainingStatusProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", 
      isComplete ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500",
      className
    )}>
      {isComplete ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Urjenje modela zaključeno</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Model je potrebno izuriti</span>
        </>
      )}
    </div>
  )
}

