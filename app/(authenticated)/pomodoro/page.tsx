"use client"

import { Clock, Brain, Coffee, Trophy, Target, Sparkles } from "lucide-react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { MicroObjetivos } from "@/components/micro-objetivos"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import ClientLayout from "../ClientLayout"

export default function PomodoroPage() {
  return (
    <ClientLayout>
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          Enfoque y Productividad
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Maximiza tu rendimiento con la técnica Pomodoro y micro-objetivos diseñados para el examen ESFM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Principal */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Temporizador de Estudio</CardTitle>
                  <CardDescription>25 min de enfoque profundo + 5 min de descanso</CardDescription>
                </div>
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Brain className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-6">
              <div className="scale-110 md:scale-125 origin-center py-12">
                <PomodoroTimer />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/30 border-dashed border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Misión del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  El éxito es la suma de pequeños esfuerzos repetidos día tras día.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-dashed border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Logro Desbloqueado
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <div className="bg-yellow-500/10 p-2 rounded-lg">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-sm font-medium">Primer ciclo completado</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar de Objetivos */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                Micro-objetivos
              </CardTitle>
              <CardDescription>Divide y vencerás</CardDescription>
            </CardHeader>
            <CardContent>
              <MicroObjetivos />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </ClientLayout>
  )
}
