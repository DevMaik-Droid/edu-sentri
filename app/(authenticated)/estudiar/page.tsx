"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Lightbulb, Heart, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import ClientLayout from "../ClientLayout"

const areas = [
  {
    id: "comprension-lectora",
    titulo: "Comprensión Lectora",
    descripcion: "Mejora tu capacidad de análisis y entendimiento de textos",
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    conceptos: [
      "Identificación de ideas principales",
      "Análisis de argumentos",
      "Comprensión de vocabulario en contexto",
      "Inferencias y conclusiones",
    ],
    ejemplo: "Lee textos diversos y practica identificando la tesis, argumentos de apoyo y conclusiones del autor.",
    preguntas: 100,
  },
  {
    id: "razonamiento-logico",
    titulo: "Razonamiento Lógico",
    descripcion: "Desarrolla tu pensamiento crítico y resolución de problemas",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    conceptos: [
      "Secuencias numéricas y alfabéticas",
      "Razonamiento deductivo e inductivo",
      "Analogías y relaciones",
      "Resolución de problemas lógicos",
    ],
    ejemplo:
      "Practica con patrones: 2, 4, 8, 16... cada número es el doble del anterior. Identifica la lógica detrás de las secuencias.",
    preguntas: 300,
  },
  {
    id: "conocimientos-generales",
    titulo: "Conocimientos Generales",
    descripcion: "Amplía tu cultura general y conocimientos diversos",
    icon: Lightbulb,
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    conceptos: [
      "Historia y geografía",
      "Ciencias naturales y sociales",
      "Cultura y actualidad",
      "Conceptos fundamentales de diversas disciplinas",
    ],
    ejemplo:
      "Mantente informado sobre eventos actuales, lee sobre historia y ciencias. La cultura general se construye día a día.",
    preguntas: 200,
  },
  {
    id: "habilidades-socioemocionales",
    titulo: "Habilidades Socioemocionales",
    descripcion: "Fortalece tu inteligencia emocional y habilidades sociales",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
    borderColor: "border-rose-200 dark:border-rose-800",
    conceptos: [
      "Empatía y comprensión emocional",
      "Resolución de conflictos",
      "Trabajo en equipo",
      "Autoconocimiento y autorregulación",
    ],
    ejemplo: "Reflexiona sobre situaciones sociales: ¿Cómo te sentirías en esa situación? ¿Qué harías para ayudar?",
    preguntas: 5,
  },
]

export default function EstudiarPage() {
  return (
    <ClientLayout>
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-bold mb-2 text-balance">Estudio por Área</h1>
        <p className="text-muted-foreground text-pretty">
          Explora conceptos clave y practica en cada área de conocimiento
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {areas.map((area, index) => {
          const Icon = area.icon
          return (
            <Card
              key={area.id}
              className={`${area.bgColor} ${area.borderColor} border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20 animate-float">
                    <Icon className={`w-8 h-8 ${area.color} shrink-0`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{area.titulo}</CardTitle>
                    <CardDescription>{area.descripcion}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Conceptos Clave:</h4>
                  <ul className="space-y-1.5">
                    {area.conceptos.map((concepto, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{concepto}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Ejemplo:</h4>
                  <p className="text-sm text-muted-foreground italic">{area.ejemplo}</p>
                </div>

                <Link href={`/estudiar/practica?area=${encodeURIComponent(area.titulo)}`}>
                  <Button className="w-full gap-2 transition-all duration-200 hover:scale-105">
                    Practicar esta área ({area.preguntas} preguntas)
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
    </ClientLayout>
  )
}
