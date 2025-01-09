import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Brain, Clock, Check } from 'lucide-react'

export default function HomePage() {


  let a = fetch("https://kroky-ai-backend.vercel.app/api/userCount")
    .then(async (res) => {
      const data: { userCount: number } = await res.json();
      return data.userCount;
    });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Never Forget School Lunch Orders with <span className="text-primary">KrokyAI</span>
            </h1>
            <h2 className="text-2xl text-muted-foreground mt-4">Trenutno storitev uporablja {a} uporabnikov.</h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up once, and let our AI handle your weekly school lunch orders from kroky.si automatically.
              Powered by custom machine learning algorithm that learns your preferences.
            </p>
            <div className="mt-10 flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">
                  Start Ordering
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Set Up Once</h3>
              <p className="text-muted-foreground">
                Configure your preferences once and let the system work for you every week.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Brain className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart AI Selection</h3>
              <p className="text-muted-foreground">
                Our AI learns your preferences and makes intelligent lunch choices for you.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Check className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Always On Time</h3>
              <p className="text-muted-foreground">
                Never miss a lunch order deadline again with automatic weekly ordering.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

