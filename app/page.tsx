'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Brain, Clock, Check, Github, Sparkles } from 'lucide-react'
import { UserCount } from '@/components/ui/user-count'

export default function HomePage() {
  const username = typeof window !== "undefined" ? localStorage.getItem('username') : null

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <UserCount />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Pozabi na zamujanje malic z <span className="text-primary">KrokyAI</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Nastavi enkrat in pusti, da umetna inteligenca sama naroča malice na kroky.si.
            </p>
            <div className="mt-10 flex gap-4 justify-center">
              <Link href={username ? "/profile" : "/login"}>
                <Button size="lg" className="group">
                  {username ? "Moj Profil" : "Začni Zdaj"}
                  <Check className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
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
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur hover:scale-105 transition-all">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enkratna Nastavitev</h3>
              <p className="text-muted-foreground">
                Nastavi svoje želje enkrat in sistem bo delal zate vsak teden.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur hover:scale-105 transition-all">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Umetna Inteligenca</h3>
              <p className="text-muted-foreground">
                Napredni algoritmi se učijo tvojih preferenc in izbirajo malice po tvojem okusu.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur hover:scale-105 transition-all">
              <Check className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Vedno Pravočasno</h3>
              <p className="text-muted-foreground">
                Nikoli več ne zamudi roka za naročilo malice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Lin Čadež © 2025
          </p>
          <a
            href="https://github.com/lin-cadez"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            github.com/lin-cadez
          </a>
        </div>
      </footer>
    </div>
  )
}

